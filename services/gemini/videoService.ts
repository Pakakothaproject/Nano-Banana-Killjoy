import { getAiClient } from './client';
import type { UploadedImage } from '../../types';
import { loadImage } from '../../utils/image';

const ANIMATION_MESSAGES = [
  "Warming up the VEO engine...",
  "Directing your scene...",
  "Rendering the frames...",
  "This can take a few minutes...",
  "Polishing the final cut...",
  "Almost there..."
];

export const animateImage = async (
  apiKey: string,
  baseImage: UploadedImage,
  prompt: string,
  setLoadingMessage?: (message: string) => void,
): Promise<string> => { // returns object URL for the video
  const aiClient = getAiClient(apiKey);
  const model = 'veo-2.0-generate-001';
  let messageIndex = 0;

  const updateMessage = () => {
      if (setLoadingMessage) {
        setLoadingMessage(ANIMATION_MESSAGES[messageIndex % ANIMATION_MESSAGES.length]);
        messageIndex++;
      }
  };
  
  setLoadingMessage?.("Preparing image for animation...");

  const originalImageUrl = `data:${baseImage.type};base64,${baseImage.base64}`;
  const img = await loadImage(originalImageUrl);
  const { naturalWidth, naturalHeight } = img;

  let imageToSend: UploadedImage = baseImage;

  // If image is portrait or square, letterbox it to a 16:9 landscape aspect ratio
  // to prevent VEO from cropping it.
  if (naturalWidth <= naturalHeight) {
      setLoadingMessage?.("Adjusting aspect ratio for video...");

      const targetAspectRatio = 16 / 9;
      const canvasHeight = naturalHeight;
      const canvasWidth = Math.round(canvasHeight * targetAspectRatio);

      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
          throw new Error("Could not create canvas context for letterboxing.");
      }
      
      // Fill background with black
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the original image centered horizontally
      const x = (canvas.width - naturalWidth) / 2;
      const y = 0;
      ctx.drawImage(img, x, y, naturalWidth, naturalHeight);

      // Get the new base64 data
      const letterboxedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const match = letterboxedDataUrl.match(/^data:(.+);base64,(.+)$/);
      if (!match) {
          throw new Error("Failed to create letterboxed image data.");
      }
      const [, mimeType, base64] = match;
      imageToSend = { base64, type: mimeType };
  }
  
  // Start the VEO generation process
  messageIndex = 0;
  updateMessage();
  
  let operation = await aiClient.models.generateVideos({
    model,
    prompt,
    image: {
      imageBytes: imageToSend.base64,
      mimeType: imageToSend.type,
    },
    config: {
      numberOfVideos: 1
    }
  });

  const messageInterval = setInterval(updateMessage, 10000);

  try {
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await aiClient.operations.getVideosOperation({ operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      const finishReason = operation.error?.message || 'Unknown reason';
      throw new Error(`Video generation failed: ${finishReason}`);
    }
    
    setLoadingMessage?.("Downloading your video...");
    const response = await fetch(`${downloadLink}&key=${apiKey}`);
    if (!response.ok) {
        throw new Error(`Failed to download video: ${response.statusText}`);
    }

    const videoBlob = await response.blob();
    return URL.createObjectURL(videoBlob);
  } finally {
    clearInterval(messageInterval);
  }
};
