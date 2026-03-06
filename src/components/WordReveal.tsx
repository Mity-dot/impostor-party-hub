import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player } from "@/lib/gameData";
import { PlayerAvatar } from "./PlayerAvatar";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

interface WordRevealProps {
  players: Player[];
  currentPlayerIndex: number;
  onNext: () => void;
}

export function WordReveal({ players, currentPlayerIndex, onNext }: WordRevealProps) {
  const [revealed, setRevealed] = useState(false);
  const player = players[currentPlayerIndex];

  const handleNext = () => {
    setRevealed(false);
    onNext();
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto px-4 text-center">
      <motion.div
        key={player.id}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <p className="text-muted-foreground text-sm">
          Player {currentPlayerIndex + 1} of {players.length}
        </p>
        <PlayerAvatar color={player.avatarColor} face={player.avatarFace} size="lg" animate />
        <h3 className="text-2xl font-display font-bold text-foreground">{player.name}</h3>
        <p className="text-muted-foreground">Pass the device to this player, then reveal your word!</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {revealed ? (
          <motion.div
            key="word"
            initial={{ opacity: 0, rotateX: 90 }}
            animate={{ opacity: 1, rotateX: 0 }}
            exit={{ opacity: 0 }}
            className="bg-card border-2 border-primary/40 rounded-xl p-6 w-full neon-glow-primary"
          >
            <p className="text-sm text-muted-foreground mb-2">Your word is:</p>
            <p className="text-3xl font-display font-bold text-primary text-glow-primary">
              {player.word}
            </p>
            {player.role === "impostor" && (
              <p className="text-xs text-secondary mt-2 text-glow-secondary">
                You are the Impostor! 🕵️ Blend in!
              </p>
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
            onClick={handleNext}
            className="text-lg font-display px-8 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <EyeOff className="w-5 h-5 mr-2" />
            {currentPlayerIndex < players.length - 1 ? "Next Player" : "Start Clues!"}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
