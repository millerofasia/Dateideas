CREATE TABLE public.date_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  answer text NOT NULL,
  date_day date,
  date_time text,
  date_type text,
  food_vibe text,
  note text,
  confirmed boolean NOT NULL DEFAULT false
);

GRANT INSERT ON public.date_responses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.date_responses TO authenticated;
GRANT ALL ON public.date_responses TO service_role;

ALTER TABLE public.date_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a response"
  ON public.date_responses FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Signed-in owner can read responses"
  ON public.date_responses FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Signed-in owner can delete responses"
  ON public.date_responses FOR DELETE TO authenticated
  USING (true);