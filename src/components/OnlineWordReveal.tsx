import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayerAvatar } from "./PlayerAvatar";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, ArrowRight, Clock, Skull } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { sessionId } from "@/lib/roomService";

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
  const currentPlayer = players[room.current_player_index];
  const isMyTurn = currentPlayer?.session_id === sessionId;

  if (!isMyTurn) {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto px-4 text-center">
        <Clock className="w-12 h-12 text-muted-foreground animate-pulse-glow" />
        <h2 className="text-2xl font-display font-bold text-foreground">
          Waiting for {currentPlayer?.player_name}...
        </h2>
        <p className="text-muted-foreground text-sm">
          Player {room.current_player_index + 1} of {players.length} is viewing their word
        </p>
        <div className="flex gap-2 flex-wrap justify-center">
          {players.map((p, i) => (
            <div key={p.id} className={`flex items-center gap-1 rounded-full px-3 py-1 ${
              i < room.current_player_index ? "bg-primary/20" : i === room.current_player_index ? "bg-secondary/20 ring-1 ring-secondary" : "bg-muted"
            }`}>
              <PlayerAvatar color={p.avatar_color} face={p.avatar_face} size="sm" className="!w-5 !h-5 !text-xs" />
              <span className="text-xs font-display text-foreground">{p.player_name}</span>
              {i < room.current_player_index && <span className="text-xs">✓</span>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <p className="text-muted-foreground text-sm">Your turn!</p>
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

      {revealed && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Button
            size="lg"
            onClick={onAdvance}
            className="text-lg font-display px-8 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <EyeOff className="w-5 h-5 mr-2" />
            Got it!
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
