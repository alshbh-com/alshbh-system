
-- Create storage bucket for project files
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', false);

-- RLS for storage: users can manage their own project files
CREATE POLICY "Users upload project files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'project-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users view own project files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'project-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete own project files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'project-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Project files metadata table
CREATE TABLE public.project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own files" ON public.project_files FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
