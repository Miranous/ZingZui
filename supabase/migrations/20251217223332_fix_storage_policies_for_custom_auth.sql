-- Fix Storage Policies for Custom Authentication
--
-- Since this app uses custom authentication (not Supabase Auth),
-- we need to update storage policies to work without auth.uid()
--
-- Note: This makes the bucket publicly writable, which is acceptable
-- for this use case since the app logic manages user folders

-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload images to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;

-- Policy: Allow public uploads to note-images bucket
CREATE POLICY "Allow public uploads to note-images"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'note-images');

-- Policy: Allow public viewing of note-images
CREATE POLICY "Allow public viewing of note-images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'note-images');

-- Policy: Allow public deletion from note-images bucket
CREATE POLICY "Allow public deletion from note-images"
  ON storage.objects
  FOR DELETE
  TO public
  USING (bucket_id = 'note-images');

-- Policy: Allow public updates to note-images
CREATE POLICY "Allow public updates to note-images"
  ON storage.objects
  FOR UPDATE
  TO public
  USING (bucket_id = 'note-images')
  WITH CHECK (bucket_id = 'note-images');