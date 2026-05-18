import { supabase } from './supabase';

/**
 * Upload a base64 image to Supabase Storage and return the public URL
 */
export async function uploadImageToStorage(
  base64Data: string,
  folder: string = 'generated',
  fileName?: string
): Promise<{ url: string; thumbnailUrl: string | null }> {
  // Generate unique filename
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);
  const name = fileName || `${timestamp}-${randomId}.png`;
  const path = `${folder}/${name}`;

  // Convert base64 to blob
  let imageData: Blob;
  
  if (base64Data.startsWith('data:')) {
    // Handle data URL
    const base64Content = base64Data.split(',')[1];
    const byteCharacters = atob(base64Content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    imageData = new Blob([byteArray], { type: 'image/png' });
  } else {
    // Handle raw base64
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    imageData = new Blob([byteArray], { type: 'image/png' });
  }

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('generated-images')
    .upload(path, imageData, {
      contentType: 'image/png',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from('generated-images')
    .getPublicUrl(path);

  return {
    url: publicUrlData.publicUrl,
    thumbnailUrl: null, // We can add thumbnail generation later
  };
}

/**
 * Upload image from URL (for images returned as URLs from API)
 */
export async function uploadImageFromUrl(
  imageUrl: string,
  folder: string = 'generated',
  fileName?: string
): Promise<{ url: string; thumbnailUrl: string | null }> {
  // If it's already a Supabase storage URL, return it
  if (imageUrl.includes('supabase.co/storage')) {
    return { url: imageUrl, thumbnailUrl: null };
  }

  // If it's a base64 data URL, use the base64 upload
  if (imageUrl.startsWith('data:')) {
    return uploadImageToStorage(imageUrl, folder, fileName);
  }

  // Otherwise, fetch and upload
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);
  const name = fileName || `${timestamp}-${randomId}.png`;
  const path = `${folder}/${name}`;

  const { error: uploadError } = await supabase.storage
    .from('generated-images')
    .upload(path, blob, {
      contentType: 'image/png',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('generated-images')
    .getPublicUrl(path);

  return {
    url: publicUrlData.publicUrl,
    thumbnailUrl: null,
  };
}
