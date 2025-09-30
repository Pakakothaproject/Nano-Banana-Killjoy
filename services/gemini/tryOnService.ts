import { GenerateContentResponse } from '@google/genai';
import { getAiClient, withTimeout, API_TIMEOUT, generateSingleImageWithNanoBanana, fileToGenerativePart } from './client';
import type { UploadedImage } from '../../types';

/**
 * Generates a "prepared" model image by replacing clothes with a neutral base layer.
 * It tries a "modest bikini" first, and if that fails, falls back to "tight beachwear".
 */
export const prepareModelImage = async (
  apiKey: string,
  modelImage: UploadedImage,
  count: 1 | 2,
): Promise<string[]> => { // Returns data URL
  const aiClient = getAiClient(apiKey);
  
  const prompts = [
    {
      name: "modest bikini",
      text: "Your task is to prepare a base model for a virtual try-on. In the provided image, completely remove all existing clothing from the person and replace it with a simple, form-fitting, modest, plain, neutral-grey bikini. IMPORTANT: The person's body shape, pose, face, hair, and the background must not be changed at all. The output must be a clean, photorealistic image with the same dimensions as the original."
    },
    {
      name: "tight beachwear",
      text: "Your task is to prepare a base model for a virtual try-on. In the provided image, completely remove all existing clothing from the person and replace it with simple, form-fitting, neutral-colored tight beachwear. IMPORTANT: The person's body shape, pose, face, hair, and the background must not be changed at all. The output must be a clean, photorealistic image with the same dimensions as the original."
    }
  ];

  let lastError: Error | null = new Error('Model preparation failed after all attempts.');

  for (const prompt of prompts) {
    try {
      const promptParts = [
        fileToGenerativePart(modelImage),
        { text: prompt.text }
      ];

      const generationPromises = Array(count).fill(0).map(() => 
        generateSingleImageWithNanoBanana(aiClient, promptParts)
      );
      
      const images = await Promise.all(generationPromises);

      if (images.length > 0 && images.every(img => img)) {
          return images;
      }
      
      lastError = new Error(`Attempt with '${prompt.name}' succeeded but returned no image data.`);
    } catch (err) {
      lastError = err as Error;
      if (err instanceof Error && !err.message.toLowerCase().includes('safety')) {
        break;
      }
    }
  }

  throw lastError;
};


/**
 * Step 1: Generate a clean, isolated image of the clothing from either a user-uploaded image or a text description.
 */
const generateCleanClothingImage = async (
  apiKey: string,
  clothingText?: string,
  clothingImage?: UploadedImage | null
): Promise<UploadedImage> => {
  const aiClient = getAiClient(apiKey);
  const model = 'gemini-2.5-flash-image-preview';
  const promptParts: ({ text: string } | { inlineData: { data: string; mimeType: string } })[] = [];
  let promptText = '';

  if (clothingImage) {
    promptParts.push(fileToGenerativePart(clothingImage));
    promptText = 'From the provided image, create a clean, photorealistic product shot of only the clothing item on a plain, neutral background. The output should be just the clothing, isolated.';
    promptParts.push({ text: promptText });
  } else if (clothingText) {
    promptText = `Generate a photorealistic image of the following clothing item on a plain, neutral background, suitable for a product catalog: "${clothingText}"`;
    promptParts.push({ text: promptText });
  } else {
    throw new Error('No clothing input provided for generation.');
  }

  const result = await withTimeout<GenerateContentResponse>(aiClient.models.generateContent({
    model: model,
    contents: { parts: promptParts },
    config: {
      responseModalities: ['IMAGE', 'TEXT'],
    },
  }), API_TIMEOUT);

  const candidate = result.candidates?.[0];
  if (candidate?.content?.parts) {
    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return {
          base64: part.inlineData.data,
          type: part.inlineData.mimeType,
        };
      }
    }
  }

  let reason = "The API did not return a clothing image.";
  if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
    reason = `The request was blocked. Reason: ${candidate.finishReason}.`;
  }
  const textResponse = candidate?.content?.parts?.find(p => p.text)?.text;
  if (textResponse) {
      reason += ` Response: "${textResponse}"`;
  }
  
  throw new Error(`Could not generate a clothing image. ${reason}`);
};

export const generateStyledImage = async (
  apiKey: string,
  preparedModelImage: UploadedImage,
  isPoseLocked: boolean,
  clothingText?: string,
  clothingImage?: UploadedImage | null,
  setLoadingMessage?: (message: string) => void,
  targetPoint?: { x: number; y: number } | null,
  count: 1 | 2 = 1
): Promise<string[]> => {
  const aiClient = getAiClient(apiKey);
  
  setLoadingMessage?.('Isolating clothing design...');
  const cleanClothingImage = await generateCleanClothingImage(apiKey, clothingText, clothingImage);

  setLoadingMessage?.('Styling your model...');
  
  let promptParts: ({ text: string } | { inlineData: { data: string; mimeType: string } })[] = [];
  let promptText = '';

  if (isPoseLocked) {
    if (targetPoint) {
      promptText = `This is a virtual try-on task for a multi-person image. Edit the first image (the base model) by dressing the person located nearest to coordinates (x: ${targetPoint.x}, y: ${targetPoint.y}) in the clothing shown in the second image. The existing attire on that person should be completely replaced. IMPORTANT: Do not change any other person in the image. For the target person, do not change their body shape, pose, face, or hair. The background must also remain identical. The result should be a seamless, photorealistic edit. Maintain original image dimensions.`;
    } else {
      promptText = `This is a virtual try-on task. Edit the first image (the base model) by dressing the person in the clothing shown in the second image. The existing attire on the base model (e.g., a bikini) should be completely replaced by the new clothing. IMPORTANT: Do not change the person's body shape, pose, face, hair, or the background. The final result should be a seamless, photorealistic image of the person wearing only the new clothes. Maintain the original image dimensions.`;
    }
  } else { // Creative mode, no environment
    if (targetPoint) {
      promptText = `Create a new, photorealistic fashion photograph. The model in the photo should look like the person in the first image located nearest to the coordinates (x: ${targetPoint.x}, y: ${targetPoint.y}). They should be wearing the clothing from the second image. You have creative freedom to choose a dynamic pose, a suitable high-fashion background, and appropriate lighting for that specific person. The final image should be stylish and engaging.`;
    } else {
      promptText = `Create a new, photorealistic fashion photograph. The model in the photo should look like the person in the first image. They should be wearing the clothing from the second image. You have creative freedom to choose a dynamic pose, a suitable high-fashion background, and appropriate lighting. The final image should be stylish and engaging.`;
    }
  }

  promptParts.push(fileToGenerativePart(preparedModelImage));
  promptParts.push(fileToGenerativePart(cleanClothingImage));
  promptParts.push({ text: promptText });

  try {
    const generationPromises = Array(count).fill(0).map(() => 
      generateSingleImageWithNanoBanana(aiClient, promptParts)
    );
    return await Promise.all(generationPromises);
  } catch (err) {
     throw err;
  }
};

export const tryOnHairStyle = async (
  apiKey: string,
  modelImage: UploadedImage,
  hairStyleImage: UploadedImage,
  count: 1 | 2,
  setLoadingMessage?: (message: string) => void
): Promise<string[]> => {
  const aiClient = getAiClient(apiKey);

  // Step 1: Analyze the hairstyle
  setLoadingMessage?.('Analyzing hairstyle...');
  const analysisModel = 'gemini-2.5-flash';
  const analysisPrompt = `Analyze the provided image and describe the hairstyle in detail. Include information about the color, length, texture (e.g., curly, straight, wavy), cut (e.g., bob, layered, pixie), parting, volume, and any specific features like bangs or highlights. Do NOT describe the person's face. Your output must be a textual description only.`;
  
  const analysisPromptParts = [
    fileToGenerativePart(hairStyleImage),
    { text: analysisPrompt }
  ];

  const analysisResult = await withTimeout<GenerateContentResponse>(aiClient.models.generateContent({
    model: analysisModel,
    contents: { parts: analysisPromptParts },
  }), API_TIMEOUT);

  const hairDescription = analysisResult.text;

  if (!hairDescription || hairDescription.trim() === '') {
      let reason = "The API failed to return a description of the hairstyle.";
      const candidate = analysisResult.candidates?.[0];
      if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
          reason = `Hairstyle analysis was blocked. Reason: ${candidate.finishReason}.`;
      }
      throw new Error(reason);
  }

  // Step 2: Generate the final image with the new hairstyle
  setLoadingMessage?.('Applying new hairstyle...');
  const generationPrompt = `You are an expert digital hairstylist. Your task is to give the person in the provided model image a new hairstyle based on the detailed description below.

  **Hairstyle Description:**
  "${hairDescription}"
  
  **CRITICAL INSTRUCTIONS:**
  - You MUST preserve the model's exact face, identity, and facial expression. Do not change who they are.
  - Replace the model's current hair completely with the new described hairstyle.
  - You MUST adjust the forehead and hairline to naturally blend with the new hairstyle. The transition should be seamless.
  - Do not change the model's body, clothing, or the background of the image.
  - The final output must be a single, photorealistic, high-quality image.`;
  
  const generationPromptParts = [
    fileToGenerativePart(modelImage),
    { text: generationPrompt }
  ];

  try {
    const generationPromises = Array(count).fill(0).map(() => 
        generateSingleImageWithNanoBanana(aiClient, generationPromptParts)
    );
    return await Promise.all(generationPromises);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred.';
    throw new Error(`Failed to generate new hairstyle. ${errorMsg}`);
  }
};
