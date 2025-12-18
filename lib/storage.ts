import { supabase } from './supabase';

export interface ImageUploadResult {
  url: string;
  path: string;
  error?: string;
}

export const uploadImage = async (
  file: Blob,
  userId: string
): Promise<ImageUploadResult> => {
  try {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const fileName = `${timestamp}-${randomStr}.png`;
    const filePath = `${userId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('note-images')
      .upload(filePath, file, {
        contentType: 'image/png',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return { url: '', path: '', error: error.message };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('note-images').getPublicUrl(data.path);

    return { url: publicUrl, path: data.path };
  } catch (error) {
    console.error('Upload exception:', error);
    return {
      url: '',
      path: '',
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};

export const deleteImage = async (path: string): Promise<{ error?: string }> => {
  try {
    const { error } = await supabase.storage.from('note-images').remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return { error: error.message };
    }

    return {};
  } catch (error) {
    console.error('Delete exception:', error);
    return {
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
};

export const extractImagePaths = (body: string): string[] => {
  const imgRegex = /<img[^>]+src="([^">]+)"/g;
  const paths: string[] = [];
  let match;

  while ((match = imgRegex.exec(body)) !== null) {
    const url = match[1];
    if (url.includes('note-images')) {
      const pathMatch = url.match(/note-images\/(.+)$/);
      if (pathMatch) {
        paths.push(pathMatch[1]);
      }
    }
  }

  return paths;
};
