import { GoogleGenAI, Modality, GenerateContentResponse } from '@google/genai';
import type { UploadedImage } from '../../types';
import { loadImage } from '../../utils/image';

let ai: GoogleGenAI | null = null;
let currentApiKey: string | null = null;

export const getAiClient = (apiKey: string): GoogleGenAI => {
  if (!apiKey) {
    throw new Error("API key has not been provided. Please add it in the settings.");
  }
  if (ai && currentApiKey === apiKey) {
    return ai;
  }
  ai = new GoogleGenAI({ apiKey });
  currentApiKey = apiKey;
  return ai;
};


export const API_TIMEOUT = 60000; // 60 seconds
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const adjustImageAspectRatio = async (
  imageToAdjust: UploadedImage,
  targetImage: UploadedImage
): Promise<UploadedImage> => {
  const [imgToAdjust, imgTarget] = await Promise.all([
    loadImage(`data:${imageToAdjust.type};base64,${imageToAdjust.base64}`),
    loadImage(`data:${targetImage.type};base64,${targetImage.base64}`),
  ]);

  const aspectToAdjust = imgToAdjust.naturalWidth / imgToAdjust.naturalHeight;
  const aspectTarget = imgTarget.naturalWidth / imgTarget.naturalHeight;
  
  const isAdjustPortrait = aspectToAdjust < 1;
  const isTargetPortrait = aspectTarget < 1;
  
  // No adjustment needed if they are both portrait or both landscape/square
  if (isAdjustPortrait === isTargetPortrait) {
    return imageToAdjust;
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return imageToAdjust; // Fallback

  // Case 1: Landscape model, Portrait target -> Add vertical padding (letterbox)
  if (!isAdjustPortrait && isTargetPortrait) {
    canvas.width = imgToAdjust.naturalWidth;
    canvas.height = Math.round(imgToAdjust.naturalWidth / aspectTarget);
    
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const yOffset = (canvas.height - imgToAdjust.naturalHeight) / 2;
    ctx.drawImage(imgToAdjust, 0, yOffset);
  }
  // Case 2: Portrait model, Landscape target -> Add horizontal padding (pillarbox)
  else if (isAdjustPortrait && !isTargetPortrait) {
    canvas.height = imgToAdjust.naturalHeight;
    canvas.width = Math.round(imgToAdjust.naturalHeight * aspectTarget);
    
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const xOffset = (canvas.width - imgToAdjust.naturalWidth) / 2;
    ctx.drawImage(imgToAdjust, xOffset, 0);
  } else {
      // Should not happen due to initial check, but good for safety
      return imageToAdjust;
  }

  const dataUrl = canvas.toDataURL('image/png');
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (match) {
    const [, type, base64] = match;
    return { base64, type };
  }
  
  return imageToAdjust; // Fallback
};

export const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(`API call timed out after ${ms / 1000} seconds`));
        }, ms);

        promise
            .then(value => {
                clearTimeout(timer);
                resolve(value);
            })
            .catch(reason => {
                clearTimeout(timer);
                reject(reason);
            });
    });
};


export const fileToGenerativePart = (image: UploadedImage) => {
  return {
    inlineData: {
      data: image.base64,
      mimeType: image.type,
    },
  };
};

export const dataUrlToGenerativePart = (dataUrl: string) => {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid data URL format');
  }
  const mimeType = match[1];
  const base64 = match[2];
  return {
    inlineData: { data: base64, mimeType },
  };
};

export const generateSingleImageWithNanoBanana = async (
  aiClient: GoogleGenAI,
  promptParts: ({ text: string } | { inlineData: { data: string; mimeType: string } })[],
): Promise<string> => {
  const model = 'gemini-2.5-flash-image-preview';
  
  const result = await withTimeout<GenerateContentResponse>(aiClient.models.generateContent({
    model: model,
    contents: { parts: promptParts },
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
      // candidateCount is not set, which defaults to 1.
    },
  }), API_TIMEOUT);

  const candidate = result.candidates?.[0];
  if (candidate?.content?.parts) {
    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  }

  // Error handling if no image is returned
  let reason = "The API did not return an image.";
  if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
      reason = `The request was blocked. Reason: ${candidate.finishReason}.`;
  }
  const textResponse = candidate?.content?.parts?.find(p => p.text)?.text;
  if (textResponse) {
      reason += ` Response: "${textResponse}"`;
  }

  throw new Error(`Image generation failed. ${reason}`);
};
