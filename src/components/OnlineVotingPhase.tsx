import { useState } from "react";
import { motion } from "framer-motion";
import { PlayerAvatar } from "./PlayerAvatar";
import { Button } from "@/components/ui/button";
import { Vote, ArrowRight, Clock } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { sessionId } from "@/lib/roomService";

type RoomPlayer = Database["public"]["Tables"]["room_players"]["Row"];
type Room = Database["public"]["Tables"]["rooms"]["Row"];

interface OnlineVotingPhaseProps {
  room: Room;
  players: RoomPlayer[];
  myPlayer: RoomPlayer | null;
  onVote: (votedForId: string) => void;
}

export function OnlineVotingPhase({ room, players, myPlayer, onVote }: OnlineVotingPhaseProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const alivePlayers = players.filter(p => !p.eliminated);
  const currentVoter = players[room.current_player_index];
  const isMyTurn = currentVoter?.session_id === sessionId && !currentVoter?.eliminated;

  const handleSubmit = () => {
    if (selected) {
      onVote(selected);
      setSelected(null);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-display font-bold text-secondary text-glow-secondary"
      >
        <Vote className="inline w-6 h-6 mr-2" />
        Round {room.round_number} — Vote!
      </motion.h2>

      {/* All clues */}
      <div className="w-full bg-card border border-border rounded-xl p-4">
        <p className="text-sm text-muted-foreground mb-3">All clues:</p>
        <div className="space-y-2">
          {alivePlayers.map(p => (
            <div key={p.id} className="flex items-center gap-2">
              <PlayerAvatar color={p.avatar_color} face={p.avatar_face} size="sm" className="!w-6 !h-6 !text-sm" />
              <span className="font-display text-sm text-foreground">{p.player_name}:</span>
              <span className="text-sm text-primary font-semibold">&quot;{p.clue}&quot;</span>
            </div>
          ))}
        </div>
      </div>

      {isMyTurn ? (
        <>
          <div className="flex flex-col items-center gap-3">
            <PlayerAvatar color={myPlayer!.avatar_color} face={myPlayer!.avatar_face} size="md" />
            <h3 className="text-xl font-display font-bold text-foreground">Your vote!</h3>
            <p className="text-muted-foreground text-sm">Who is the Impostor?</p>
          </div>

          <div className="w-full grid grid-cols-2 gap-3">
            {alivePlayers
              .filter(p => p.id !== myPlayer!.id)
              .map(p => (
                <motion.button
                  key={p.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelected(p.id)}
                  className={`flex items-center gap-3 rounded-lg p-3 border-2 transition-colors ${
                    selected === p.id
                      ? "border-destructive bg-destructive/10"
                      : "border-border bg-card hover:border-muted-foreground/40"
                  }`}
                >
                  <PlayerAvatar color={p.avatar_color} face={p.avatar_face} size="sm" />
                  <span className="font-display text-sm font-semibold text-foreground">{p.player_name}</span>
                </motion.button>
              ))}
          </div>

          {selected && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button
                size="lg"
                onClick={handleSubmit}
                className="text-lg font-display px-8 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                <Vote className="w-5 h-5 mr-2" /> Cast Vote <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 bg-card border border-border rounded-xl p-6 w-full">
          <Clock className="w-8 h-8 text-muted-foreground animate-pulse-glow" />
          <p className="font-display text-foreground">
            Waiting for <span className="text-secondary font-bold">{currentVoter?.player_name}</span> to vote...
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Voter {room.current_player_index + 1} of {players.length}
      </p>
    </div>
  );
}
