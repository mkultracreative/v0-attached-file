-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "Anyone can view shared resumes by vanity_url" ON public.people;

-- Create policy to allow anyone to view shared resumes (for public /r/ routes)
CREATE POLICY "Anyone can view shared resumes" ON public.people
  FOR SELECT USING (true);
