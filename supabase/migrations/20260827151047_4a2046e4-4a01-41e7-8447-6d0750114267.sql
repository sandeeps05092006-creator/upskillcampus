CREATE TABLE public.urls (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_url text NOT NULL,
  short_code text NOT NULL UNIQUE,
  clicks integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX urls_created_at_idx ON public.urls (created_at DESC);

GRANT SELECT, INSERT, DELETE ON public.urls TO anon;
GRANT SELECT, INSERT, DELETE ON public.urls TO authenticated;
GRANT ALL ON public.urls TO service_role;

ALTER TABLE public.urls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read urls" ON public.urls FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can create urls" ON public.urls FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public can delete urls" ON public.urls FOR DELETE TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.increment_clicks(_short_code text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _url text;
BEGIN
  UPDATE public.urls
    SET clicks = clicks + 1
    WHERE short_code = _short_code
    RETURNING original_url INTO _url;
  RETURN _url;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_clicks(text) TO anon, authenticated, service_role;