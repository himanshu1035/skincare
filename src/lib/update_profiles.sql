-- Add skin_username to skin_user_profiles if it doesn't exist
ALTER TABLE public.skin_user_profiles ADD COLUMN IF NOT EXISTS skin_username TEXT;

-- Update existing profiles to have a username based on their names
UPDATE public.skin_user_profiles 
SET skin_username = TRIM(skin_first_name || ' ' || skin_last_name)
WHERE skin_username IS NULL;
