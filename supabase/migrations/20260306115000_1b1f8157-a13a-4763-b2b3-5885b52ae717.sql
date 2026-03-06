
CREATE OR REPLACE FUNCTION public.check_room_abandoned()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  remaining integer;
BEGIN
  SELECT count(*) INTO remaining FROM public.room_players WHERE room_id = OLD.room_id;
  IF remaining = 0 THEN
    UPDATE public.rooms SET abandoned_at = now() WHERE id = OLD.room_id;
  END IF;
  RETURN OLD;
END;
$$;

CREATE TRIGGER trg_check_room_abandoned
AFTER DELETE ON public.room_players
FOR EACH ROW
EXECUTE FUNCTION public.check_room_abandoned();
