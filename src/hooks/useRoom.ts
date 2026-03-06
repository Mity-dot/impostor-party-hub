import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { sessionId } from "@/lib/roomService";
import type { Database } from "@/integrations/supabase/types";

type Room = Database["public"]["Tables"]["rooms"]["Row"];
type RoomPlayer = Database["public"]["Tables"]["room_players"]["Row"];

export function useRoom(roomId: string | null) {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [myPlayer, setMyPlayer] = useState<RoomPlayer | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!roomId) return;

    const [roomRes, playersRes] = await Promise.all([
      supabase.from("rooms").select("*").eq("id", roomId).single(),
      supabase.from("room_players").select("*").eq("room_id", roomId).order("player_order"),
    ]);

    if (roomRes.data) setRoom(roomRes.data);
    if (playersRes.data) {
      setPlayers(playersRes.data);
      setMyPlayer(playersRes.data.find(p => p.session_id === sessionId) || null);
    }
    setLoading(false);
  }, [roomId]);

  useEffect(() => {
    fetchData();

    if (!roomId) return;

    // Subscribe to room changes
    const roomChannel = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms", filter: `id=eq.${roomId}` },
        () => fetchData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "room_players", filter: `room_id=eq.${roomId}` },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
    };
  }, [roomId, fetchData]);

  const isHost = room?.host_session_id === sessionId;

  return { room, players, myPlayer, isHost, loading, refetch: fetchData };
}
