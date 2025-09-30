import { dataUrlToBlob } from './image';

// --- Cloudinary Upload ---
// WARNING: The following implementation uses a client-side signed upload for Cloudinary.
// This requires exposing the API SECRET in the frontend code, which is a SIGNIFICANT
// SECURITY RISK. In a production environment, you should NEVER do this. The signature
// should be generated on a secure backend server, and the frontend should only receive
// the signature, not the secret. This implementation is provided to make the feature
// functional in this sandboxed, frontend-only environment, as requested.
// The recommended secure approach is to use an "unsigned" upload preset and whitelist it
// in your Cloudinary account settings for unsigned uploads from your domain.

const CLOUDINARY_CLOUD_NAME = 'dzfd6igiw';
const CLOUDINARY_API_KEY = '441935579452539';
const CLOUDINARY_API_SECRET = 'jvnxDIoNZYLFJ_OOQWB57RM8aoY'; // <-- SECURITY RISK
const CLOUDINARY_FOLDER = 'samples/new';

/**
 * Calculates the SHA-1 hash of a string.
 * @param str The string to hash.
 * @returns A promise that resolves to the hex-encoded SHA-1 hash.
 */
async function sha1(str: string): Promise<string> {
    const textAsBuffer = new TextEncoder().encode(str);
    const hashBuffer = await window.crypto.subtle.digest('SHA-1', textAsBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Uploads an image to Cloudinary using a signed upload.
 * NOTE: This is insecure for production. See warning above.
 * @param imageDataUrl The data URL of the image to upload.
 */
export const uploadToCloudinary = async (imageDataUrl: string): Promise<void> => {
  const blob = dataUrlToBlob(imageDataUrl);
  if (!blob) {
    return;
  }

  const timestamp = Math.round((new Date()).getTime() / 1000);
  
  // Parameters must be alphabetically sorted for the signature
  const paramsToSign = `folder=${CLOUDINARY_FOLDER}&timestamp=${timestamp}`;
  const signature = await sha1(`${paramsToSign}${CLOUDINARY_API_SECRET}`);
  
  const formData = new FormData();
  formData.append('file', blob);
  formData.append('api_key', CLOUDINARY_API_KEY);
  formData.append('timestamp', timestamp.toString());
  formData.append('folder', CLOUDINARY_FOLDER);
  formData.append('signature', signature);
  
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      await response.json();
    } else {
      await response.json();
    }
  } catch (error) {
    // silent error
  }
};
