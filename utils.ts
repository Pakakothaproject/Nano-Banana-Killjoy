import type { UploadedImage } from './types';

export const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = src;
    });
};

export const fetchImageAsUploadedImage = async (url: string): Promise<UploadedImage> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image. Status: ${response.statusText}`);
  }
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
      if (match) {
        const [, type, base64] = match;
        resolve({ base64, type });
      } else {
        reject(new Error('Failed to parse data URL.'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// --- Inpainting Helper Functions ---

export type BoundingBox = { x: number; y: number; width: number; height: number; };

/**
 * Analyzes a mask image and returns the bounding box of the non-black areas.
 */
export const getMaskBoundingBox = async (maskDataUrl: string): Promise<BoundingBox | null> => {
  const img = await loadImage(maskDataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
  let hasMask = false;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      // Check if pixel is not black (R, G, or B is not 0)
      if (data[i] > 0 || data[i + 1] > 0 || data[i + 2] > 0) {
        hasMask = true;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (!hasMask) return null;

  return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
};


/**
 * Adds padding to a bounding box, clamped to the image dimensions.
 */
export const addPaddingToBox = (box: BoundingBox, imageDims: { width: number; height: number; }, padding: number): BoundingBox => {
  const newX = Math.max(0, box.x - padding);
  const newY = Math.max(0, box.y - padding);
  const newMaxX = Math.min(imageDims.width, box.x + box.width + padding);
  const newMaxY = Math.min(imageDims.height, box.y + box.height + padding);

  return {
    x: newX,
    y: newY,
    width: newMaxX - newX,
    height: newMaxY - newY,
  };
};

/**
 * Crops an image from a data URL to the specified bounding box.
 */
export const cropImage = async (imageDataUrl: string, box: BoundingBox): Promise<string> => {
  const img = await loadImage(imageDataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = box.width;
  canvas.height = box.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context for cropping.');
  
  ctx.drawImage(img, box.x, box.y, box.width, box.height, 0, 0, box.width, box.height);
  return canvas.toDataURL('image/png');
};

/**
 * Pastes a cropped image onto a base image at the specified coordinates.
 */
export const pasteImage = async (baseImageDataUrl: string, cropDataUrl: string, box: BoundingBox): Promise<string> => {
    const [baseImg, cropImg] = await Promise.all([
        loadImage(baseImageDataUrl),
        loadImage(cropDataUrl),
    ]);

    const canvas = document.createElement('canvas');
    canvas.width = baseImg.naturalWidth;
    canvas.height = baseImg.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context for pasting.');
    
    // Draw the original image first
    ctx.drawImage(baseImg, 0, 0);

    // Then draw the edited crop on top at the correct location
    ctx.drawImage(cropImg, box.x, box.y, box.width, box.height);

    return canvas.toDataURL('image/png');
};
