import { motion } from "framer-motion";
import { PlayerAvatar } from "./PlayerAvatar";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trophy, Skull, Home } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type RoomPlayer = Database["public"]["Tables"]["room_players"]["Row"];
type Room = Database["public"]["Tables"]["rooms"]["Row"];

interface OnlineResultsProps {
  room: Room;
  players: RoomPlayer[];
  isHost: boolean;
  onPlayAgain: () => void;
  onLeave: () => void;
}

export function OnlineResults({ room, players, isHost, onPlayAgain, onLeave }: OnlineResultsProps) {
  const impostor = players.find(p => p.id === room.impostor_player_id);

  // Determine winner
  let maxVotes = 0;
  let mostVotedId: string | null = null;
  let tie = false;
  const voteMap: Record<string, number> = {};
  
  players.forEach(p => {
    voteMap[p.id] = p.votes_received;
    if (p.votes_received > maxVotes) {
      maxVotes = p.votes_received;
      mostVotedId = p.id;
      tie = false;
    } else if (p.votes_received === maxVotes && maxVotes > 0) {
      tie = true;
    }
  });

  const civiliansWin = !tie && mostVotedId === room.impostor_player_id;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="flex flex-col items-center gap-3"
      >
        {civiliansWin ? (
          <>
            <Trophy className="w-16 h-16 text-accent animate-float" />
            <h2 className="text-3xl font-display font-bold text-accent">Civilians Win! 🎉</h2>
          </>
        ) : (
          <>
            <Skull className="w-16 h-16 text-secondary animate-float" />
            <h2 className="text-3xl font-display font-bold text-secondary text-glow-secondary">
              Impostor Wins! 🕵️
            </h2>
            <p className="text-muted-foreground">{tie ? "It was a tie!" : "Wrong person voted!"}</p>
          </>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full bg-card border border-border rounded-xl p-5 space-y-4"
      >
        <div>
          <p className="text-sm text-muted-foreground">The Impostor was:</p>
          <div className="flex items-center justify-center gap-3 mt-2">
            {impostor && <PlayerAvatar color={impostor.avatar_color} face={impostor.avatar_face} size="md" />}
            <span className="text-xl font-display font-bold text-secondary">{impostor?.player_name}</span>
          </div>
        </div>
        <div className="border-t border-border pt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Civilian word</p>
            <p className="text-lg font-display font-bold text-primary">{room.civilian_word}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Impostor word</p>
            <p className="text-lg font-display font-bold text-secondary">{room.impostor_word}</p>
          </div>
        </div>
      </motion.div>

      {/* Votes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full bg-card border border-border rounded-xl p-4"
      >
        <p className="text-sm text-muted-foreground mb-3">Vote Results:</p>
        <div className="space-y-2">
          {[...players]
            .sort((a, b) => b.votes_received - a.votes_received)
            .map(p => (
              <div key={p.id} className="flex items-center gap-3">
                <PlayerAvatar color={p.avatar_color} face={p.avatar_face} size="sm" className="!w-6 !h-6 !text-sm" />
                <span className="font-display text-sm text-foreground flex-1 text-left">{p.player_name}</span>
                <div className="flex gap-1">
                  {Array.from({ length: p.votes_received }).map((_, i) => (
                    <span key={i} className="text-destructive text-xs">🔴</span>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground w-8 text-right">{p.votes_received}</span>
                {p.id === room.impostor_player_id && <span className="text-xs text-secondary">🕵️</span>}
              </div>
            ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex gap-3"
      >
        {isHost && (
          <Button
            size="lg"
            onClick={onPlayAgain}
            className="font-display neon-glow-primary bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <RotateCcw className="w-5 h-5 mr-2" /> Play Again
          </Button>
        )}
        <Button
          size="lg"
          variant="outline"
          onClick={onLeave}
          className="font-display border-secondary/40 text-secondary hover:bg-secondary/10"
        >
          <Home className="w-5 h-5 mr-2" /> Leave
        </Button>
      </motion.div>

      {!isHost && (
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-muted-foreground text-sm"
        >
          Waiting for host to start next round...
        </motion.p>
      )}
    </div>
  );
}
