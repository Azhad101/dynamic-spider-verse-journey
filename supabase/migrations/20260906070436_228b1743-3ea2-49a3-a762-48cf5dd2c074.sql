CREATE TABLE public.cleanup_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  progress INTEGER NOT NULL DEFAULT 0,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  color TEXT NOT NULL DEFAULT 'signal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cleanup_zones TO anon, authenticated;
GRANT ALL ON public.cleanup_zones TO service_role;
ALTER TABLE public.cleanup_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cleanup zones are publicly readable" ON public.cleanup_zones FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.cleanup_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  location TEXT NOT NULL,
  report_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'amber',
  note TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cleanup_reports TO authenticated;
GRANT ALL ON public.cleanup_reports TO service_role;
ALTER TABLE public.cleanup_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own cleanup reports" ON public.cleanup_reports FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own cleanup reports" ON public.cleanup_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cleanup reports" ON public.cleanup_reports FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cleanup reports" ON public.cleanup_reports FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.mission_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  mission_name TEXT NOT NULL,
  zone_id UUID REFERENCES public.cleanup_zones(id) ON DELETE SET NULL,
  action TEXT NOT NULL DEFAULT 'deployed',
  impact_kg NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mission_activity TO authenticated;
GRANT ALL ON public.mission_activity TO service_role;
ALTER TABLE public.mission_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own mission activity" ON public.mission_activity FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own mission activity" ON public.mission_activity FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own mission activity" ON public.mission_activity FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own mission activity" ON public.mission_activity FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.hero_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alias TEXT NOT NULL,
  sector TEXT NOT NULL,
  recovered_kg NUMERIC(12,2) NOT NULL DEFAULT 0,
  missions INTEGER NOT NULL DEFAULT 0,
  avatar_key TEXT NOT NULL DEFAULT 'swing',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hero_scores TO anon, authenticated;
GRANT ALL ON public.hero_scores TO service_role;
ALTER TABLE public.hero_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hero scores are publicly readable" ON public.hero_scores FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_cleanup_zones_updated_at BEFORE UPDATE ON public.cleanup_zones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cleanup_reports_updated_at BEFORE UPDATE ON public.cleanup_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mission_activity_updated_at BEFORE UPDATE ON public.mission_activity FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hero_scores_updated_at BEFORE UPDATE ON public.hero_scores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.cleanup_zones (name, city, status, progress, latitude, longitude, color) VALUES
  ('Downtown West', 'New York', 'alert', 84, 40.7128, -74.0060, 'signal'),
  ('Harbor Line', 'New York', 'clearing', 51, 40.7005, -74.0120, 'blue'),
  ('Old Town', 'New York', 'en_route', 12, 40.7306, -73.9973, 'neutral'),
  ('Riverside South', 'New York', 'clearing', 68, 40.7050, -74.0250, 'blue');

INSERT INTO public.hero_scores (alias, sector, recovered_kg, missions, avatar_key) VALUES
  ('Webwright', 'Sector 04', 2410, 38, 'swing'),
  ('Skyline Scout', 'Sector 07', 1980, 31, 'crawl'),
  ('Harbor Hand', 'Sector 02', 1540, 26, 'landing'),
  ('Signal Scout', 'Sector 09', 1120, 19, 'webshot');