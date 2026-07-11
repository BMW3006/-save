CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  movie_id INTEGER,
  movie_title TEXT,
  movie_poster TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_read_notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "allow_insert_notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_update_notifications" ON public.notifications FOR UPDATE USING (true);
CREATE POLICY "allow_delete_notifications" ON public.notifications FOR DELETE USING (true);
