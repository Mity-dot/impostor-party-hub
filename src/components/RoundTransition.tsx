import { motion } from "framer-motion";
import { PlayerAvatar } from "./PlayerAvatar";
import { Skull, UserX } from "lucide-react";

interface RoundTransitionProps {
  type: "eliminated" | "new-round" | "game-over";
  playerName?: string;
  playerColor?: string;
  playerFace?: string;
  roundNumber?: number;
  message?: string;
  onComplete: () => void;
}

export function RoundTransition({ type, playerName, playerColor, playerFace, roundNumber, message, onComplete }: RoundTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.6, delay: 0.2 }}
        className="flex flex-col items-center gap-6 text-center px-8"
      >
        {type === "eliminated" && (
          <>
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <UserX className="w-20 h-20 text-destructive" />
            </motion.div>
            {playerColor && playerFace && (
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.2, 0], opacity: [1, 1, 0] }}
                transition={{ duration: 1.2, delay: 0.6 }}
              >
                <PlayerAvatar color={playerColor} face={playerFace} size="lg" />
              </motion.div>
            )}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-3xl font-display font-bold text-destructive"
            >
              {playerName} was voted out!
            </motion.h2>
            {message && (
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-lg text-muted-foreground"
              >
                {message}
              </motion.p>
            )}
          </>
        )}

        {type === "new-round" && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Skull className="w-16 h-16 text-secondary" />
            </motion.div>
            <motion.h2
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-4xl font-display font-bold text-primary text-glow-primary"
            >
              Round {roundNumber}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-lg text-muted-foreground"
            >
              The impostor is still among you...
            </motion.p>
          </>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          onAnimationComplete={() => {
            setTimeout(onComplete, 800);
          }}
        />
      </motion.div>
    </motion.div>
  );
}
