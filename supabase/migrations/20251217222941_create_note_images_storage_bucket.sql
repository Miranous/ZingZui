-- Create Storage Bucket for Note Images
--
-- 1. New Storage Bucket
--    - note-images: Public bucket for storing note images
--    - Organized by user ID folders
--    - Supports PNG images from pasted content
--
-- 2. Security
--    - Bucket is public (images can be viewed without authentication)
--    - Authenticated users can upload images to their own folder
--    - Authenticated users can delete their own images
--    - Users cannot access or modify other users image folders

-- Create the storage bucket for note images
INSERT INTO storage.buckets (id, name, public)
VALUES ('note-images', 'note-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload images to their own folder
CREATE POLICY "Users can upload images to own folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'note-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Allow authenticated users to view all images (bucket is public)
CREATE POLICY "Anyone can view images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'note-images');

-- Policy: Allow authenticated users to delete their own images
CREATE POLICY "Users can delete own images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'note-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Allow authenticated users to update their own images
CREATE POLICY "Users can update own images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'note-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'note-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );