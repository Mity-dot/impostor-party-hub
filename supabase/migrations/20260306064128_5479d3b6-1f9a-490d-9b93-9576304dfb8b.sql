
ALTER TABLE public.room_players ADD COLUMN eliminated BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.rooms ADD COLUMN round_number INTEGER NOT NULL DEFAULT 1;
