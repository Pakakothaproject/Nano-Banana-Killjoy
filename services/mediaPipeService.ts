import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import type { UploadedImage } from '../types';
import { loadImage } from '../utils/image';

let faceLandmarker: FaceLandmarker | undefined;
let isInitializing = false;

const initializeFaceLandmarker = async () => {
  if (faceLandmarker || isInitializing) return;
  isInitializing = true;
  try {
    const filesetResolver = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
    );
    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
        delegate: "GPU"
      },
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: false,
      numFaces: 1
    });
  } catch (e) {
    console.error("Failed to initialize FaceLandmarker", e);
  } finally {
    isInitializing = false;
  }
};

export const restoreOriginalFace = async (
  originalFaceImage: UploadedImage,
  generatedImage: string // data URL
): Promise<string> => { // returns new data URL
  await initializeFaceLandmarker();
  if (!faceLandmarker) {
    console.warn("FaceLandmarker not ready, skipping face restoration.");
    return generatedImage;
  }

  try {
    const originalUrl = `data:${originalFaceImage.type};base64,${originalFaceImage.base64}`;
    const [originalImg, generatedImg] = await Promise.all([
      loadImage(originalUrl),
      loadImage(generatedImage)
    ]);

    if (originalImg.width === 0 || generatedImg.width === 0) {
      console.warn("Image dimensions are zero, skipping restoration.");
      return generatedImage;
    }

    const originalLandmarksResult = faceLandmarker.detect(originalImg);
    const generatedLandmarksResult = faceLandmarker.detect(generatedImg);
    const originalLandmarks = originalLandmarksResult.faceLandmarks?.[0];
    const generatedLandmarks = generatedLandmarksResult.faceLandmarks?.[0];

    if (!originalLandmarks || !generatedLandmarks) {
      console.warn("Could not detect face in one or both images. Skipping restoration.");
      return generatedImage;
    }

    // 1. Create a blurred mask of the original face
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = originalImg.width;
    maskCanvas.height = originalImg.height;
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return generatedImage;

    const faceOvalIndices = [
        10,  338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
        397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
        172, 58,  132, 93,  234, 127, 162, 21,  54,  103, 67,  109,
    ];
    
    maskCtx.beginPath();
    const firstPoint = originalLandmarks[faceOvalIndices[0]];
    maskCtx.moveTo(firstPoint.x * originalImg.width, firstPoint.y * originalImg.height);
    for (let i = 1; i < faceOvalIndices.length; i++) {
        const point = originalLandmarks[faceOvalIndices[i]];
        maskCtx.lineTo(point.x * originalImg.width, point.y * originalImg.height);
    }
    maskCtx.closePath();
    
    maskCtx.fillStyle = 'white';
    maskCtx.filter = 'blur(8px)';
    maskCtx.fill();
    maskCtx.filter = 'none';

    // 2. Create a canvas with just the masked original face
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = originalImg.width;
    faceCanvas.height = originalImg.height;
    const faceCtx = faceCanvas.getContext('2d');
    if (!faceCtx) return generatedImage;

    faceCtx.drawImage(originalImg, 0, 0);
    faceCtx.globalCompositeOperation = 'destination-in';
    faceCtx.drawImage(maskCanvas, 0, 0);

    // 3. Calculate scale and translation based on eye landmarks for robust alignment
    const p1Orig = { x: originalLandmarks[133].x * originalImg.width, y: originalLandmarks[133].y * originalImg.height };
    const p2Orig = { x: originalLandmarks[362].x * originalImg.width, y: originalLandmarks[362].y * originalImg.height };
    const p1Gen = { x: generatedLandmarks[133].x * generatedImg.width, y: generatedLandmarks[133].y * generatedImg.height };
    const p2Gen = { x: generatedLandmarks[362].x * generatedImg.width, y: generatedLandmarks[362].y * generatedImg.height };

    const distOrig = Math.sqrt(Math.pow(p2Orig.x - p1Orig.x, 2) + Math.pow(p2Orig.y - p1Orig.y, 2));
    const distGen = Math.sqrt(Math.pow(p2Gen.x - p1Gen.x, 2) + Math.pow(p2Gen.y - p1Gen.y, 2));
    
    if (distOrig === 0) return generatedImage;
    const scale = distGen / distOrig;
    
    const centerOrig = { x: (p1Orig.x + p2Orig.x) / 2, y: (p1Orig.y + p2Orig.y) / 2 };
    const centerGen = { x: (p1Gen.x + p2Gen.x) / 2, y: (p1Gen.y + p2Gen.y) / 2 };

    // 4. Create the final image by compositing the face
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = generatedImg.width;
    finalCanvas.height = generatedImg.height;
    const finalCtx = finalCanvas.getContext('2d');
    if (!finalCtx) return generatedImage;

    finalCtx.drawImage(generatedImg, 0, 0);
    
    const destWidth = faceCanvas.width * scale;
    const destHeight = faceCanvas.height * scale;
    const destX = centerGen.x - (centerOrig.x * scale);
    const destY = centerGen.y - (centerOrig.y * scale);
    
    finalCtx.drawImage(faceCanvas, destX, destY, destWidth, destHeight);

    return finalCanvas.toDataURL('image/png');
  } catch (error) {
    console.error("Face restoration with MediaPipe failed:", error);
    return generatedImage; // Fallback to unedited image on error
  }
};
