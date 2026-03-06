
-- Create rooms table
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT NOT NULL UNIQUE,
  host_session_id TEXT NOT NULL,
  game_phase TEXT NOT NULL DEFAULT 'lobby',
  category_name TEXT,
  civilian_word TEXT,
  impostor_word TEXT,
  impostor_player_id UUID,
  current_player_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create room_players table
CREATE TABLE public.room_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  avatar_color TEXT NOT NULL,
  avatar_face TEXT NOT NULL,
  player_order INTEGER NOT NULL DEFAULT 0,
  role TEXT,
  word TEXT,
  clue TEXT,
  voted_for UUID,
  votes_received INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(room_id, session_id)
);

-- Enable RLS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_players ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read/write rooms (guest users, no auth)
CREATE POLICY "Anyone can read rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can create rooms" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update rooms" ON public.rooms FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete rooms" ON public.rooms FOR DELETE USING (true);

CREATE POLICY "Anyone can read room_players" ON public.room_players FOR SELECT USING (true);
CREATE POLICY "Anyone can create room_players" ON public.room_players FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update room_players" ON public.room_players FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete room_players" ON public.room_players FOR DELETE USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_players;

-- Index for room code lookups
CREATE INDEX idx_rooms_room_code ON public.rooms(room_code);
CREATE INDEX idx_room_players_room_id ON public.room_players(room_id);
