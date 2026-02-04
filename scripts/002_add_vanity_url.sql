-- Add vanity_url and public_identifier fields to people table
ALTER TABLE public.people 
ADD COLUMN IF NOT EXISTS public_identifier text,
ADD COLUMN IF NOT EXISTS vanity_url text UNIQUE,
ADD COLUMN IF NOT EXISTS instruct text DEFAULT '';

-- Create index for faster vanity URL lookups
CREATE INDEX IF NOT EXISTS idx_people_vanity_url ON public.people(vanity_url);

-- Policy to allow anyone to read profiles by vanity_url (for public sharing)
CREATE POLICY IF NOT EXISTS "Anyone can view shared resumes by vanity_url" ON public.people
  FOR SELECT USING (vanity_url IS NOT NULL);
