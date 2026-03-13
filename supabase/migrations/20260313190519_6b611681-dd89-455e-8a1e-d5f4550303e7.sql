ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS travel_style text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trip_frequency text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}'::text[];