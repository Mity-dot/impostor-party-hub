import { useState } from "react";
import { motion } from "framer-motion";
import { PlayerAvatar } from "./PlayerAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, MessageCircle, Clock } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { sessionId } from "@/lib/roomService";

type RoomPlayer = Database["public"]["Tables"]["room_players"]["Row"];
type Room = Database["public"]["Tables"]["rooms"]["Row"];

interface OnlineCluePhaseProps {
  room: Room;
  players: RoomPlayer[];
  myPlayer: RoomPlayer | null;
  onSubmitClue: (clue: string) => void;
}

export function OnlineCluePhase({ room, players, myPlayer, onSubmitClue }: OnlineCluePhaseProps) {
  const [clue, setClue] = useState("");
  const currentPlayer = players[room.current_player_index];
  const isMyTurn = currentPlayer?.session_id === sessionId;
  const givenClues = players.filter(p => p.clue);

  const handleSubmit = () => {
    if (clue.trim()) {
      onSubmitClue(clue.trim());
      setClue("");
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-display font-bold text-accent"
      >
        <MessageCircle className="inline w-6 h-6 mr-2" />
        Clue Time!
      </motion.h2>

      {givenClues.length > 0 && (
        <div className="w-full space-y-2">
          <p className="text-sm text-muted-foreground">Clues given:</p>
          <div className="flex flex-wrap gap-2">
            {givenClues.map(p => (
              <div key={p.id} className="flex items-center gap-2 bg-muted rounded-full px-3 py-1.5">
                <PlayerAvatar color={p.avatar_color} face={p.avatar_face} size="sm" className="!w-6 !h-6 !text-sm" />
                <span className="text-sm font-display text-foreground">{p.player_name}:</span>
                <span className="text-sm font-semibold text-primary">&quot;{p.clue}&quot;</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isMyTurn ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 bg-card border border-border rounded-xl p-6 w-full"
        >
          <PlayerAvatar color={myPlayer!.avatar_color} face={myPlayer!.avatar_face} size="md" animate />
          <h3 className="text-xl font-display font-bold text-foreground">Your turn!</h3>
          <p className="text-muted-foreground text-sm text-center">
            Give a ONE-WORD clue about your word.
          </p>
          <div className="flex gap-2 w-full mt-2">
            <Input
              value={clue}
              onChange={e => setClue(e.target.value.replace(/\s/g, ""))}
              placeholder="Your clue..."
              className="flex-1 bg-muted text-lg font-display"
              maxLength={20}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
            />
            <Button
              onClick={handleSubmit}
              disabled={!clue.trim()}
              className="neon-glow-accent bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center gap-3 bg-card border border-border rounded-xl p-6 w-full">
          <Clock className="w-8 h-8 text-muted-foreground animate-pulse-glow" />
          <p className="font-display text-foreground">
            Waiting for <span className="text-primary font-bold">{currentPlayer?.player_name}</span>...
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Player {room.current_player_index + 1} of {players.length}
      </p>
    </div>
  );
}
