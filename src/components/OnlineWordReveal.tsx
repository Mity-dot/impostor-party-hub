import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayerAvatar } from "./PlayerAvatar";
import { Button } from "@/components/ui/button";
import { Eye, ArrowRight, Skull, CheckCircle } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type RoomPlayer = Database["public"]["Tables"]["room_players"]["Row"];
type Room = Database["public"]["Tables"]["rooms"]["Row"];

interface OnlineWordRevealProps {
  room: Room;
  players: RoomPlayer[];
  myPlayer: RoomPlayer | null;
  isHost: boolean;
  onAdvance: () => void;
}

export function OnlineWordReveal({ room, players, myPlayer, isHost, onAdvance }: OnlineWordRevealProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <PlayerAvatar color={myPlayer!.avatar_color} face={myPlayer!.avatar_face} size="lg" animate />
        <h3 className="text-2xl font-display font-bold text-foreground">{myPlayer!.player_name}</h3>
      </motion.div>

      <AnimatePresence mode="wait">
        {revealed ? (
          <motion.div
            key="word"
            initial={{ opacity: 0, rotateX: 90 }}
            animate={{ opacity: 1, rotateX: 0 }}
            exit={{ opacity: 0 }}
            className={`bg-card border-2 rounded-xl p-6 w-full ${myPlayer!.role === "impostor" ? "border-secondary/60 neon-glow-secondary" : "border-primary/40 neon-glow-primary"}`}
          >
            {myPlayer!.role === "impostor" ? (
              <>
                <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ duration: 0.5 }} className="mb-3">
                  <Skull className="w-12 h-12 text-secondary mx-auto" />
                </motion.div>
                <p className="text-lg font-display font-bold text-secondary text-glow-secondary mb-2">You are an Impostor! 🕵️</p>
                <p className="text-sm text-muted-foreground mb-2">Your word is:</p>
                <p className="text-3xl font-display font-bold text-secondary text-glow-secondary">
                  {myPlayer!.word}
                </p>
                {players.filter(p => p.role === "impostor").length > 1 && (
                  <p className="text-xs text-muted-foreground mt-2">There are {players.filter(p => p.role === "impostor").length} impostors this round!</p>
                )}
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-2">Your word is:</p>
                <p className="text-3xl font-display font-bold text-primary text-glow-primary">
                  {myPlayer!.word}
                </p>
                <p className="text-xs text-muted-foreground mt-2">You are a Civilian ✅</p>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div key="hidden" exit={{ opacity: 0 }}>
            <Button
              size="lg"
              onClick={() => setRevealed(true)}
              className="text-lg font-display px-8 neon-glow-secondary bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              <Eye className="w-5 h-5 mr-2" /> Reveal My Word
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {revealed && isHost && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <Button
            size="lg"
            onClick={onAdvance}
            className="text-lg font-display px-8 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Start Clues! <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      )}

      {revealed && !isHost && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle className="w-5 h-5 text-primary" />
            <p className="font-display text-sm">Waiting for host to start clues...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
