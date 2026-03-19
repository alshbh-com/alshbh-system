
DROP POLICY "Anyone can insert logs" ON public.security_logs;
CREATE POLICY "Authenticated users insert logs" ON public.security_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
