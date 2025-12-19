/*
  # Add color column to notes table

  1. Changes
    - Add `color` column to `notes` table to store user-selected note colors
    - Color is optional (nullable) - if null, the app will generate a color based on note ID
    - Stores hex color value (e.g., '#E63946')

  2. Notes
    - Existing notes will have NULL color, which triggers automatic color generation
    - New notes can optionally specify a color
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notes' AND column_name = 'color'
  ) THEN
    ALTER TABLE notes ADD COLUMN color text;
  END IF;
END $$;
