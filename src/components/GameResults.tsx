import { motion } from "framer-motion";
import { Player } from "@/lib/gameData";
import { GameState, getMostVoted, didCiviliansWin } from "@/lib/gameState";
import { PlayerAvatar } from "./PlayerAvatar";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trophy, Skull } from "lucide-react";

interface GameResultsProps {
  state: GameState;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

export function GameResults({ state, onPlayAgain, onNewGame }: GameResultsProps) {
  const civiliansWin = didCiviliansWin(state);
  const mostVoted = getMostVoted(state);
  const impostor = state.players.find(p => p.id === state.impostorId);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4 text-center">
      {/* Result header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="flex flex-col items-center gap-3"
      >
        {civiliansWin ? (
          <>
            <Trophy className="w-16 h-16 text-accent animate-float" />
            <h2 className="text-3xl font-display font-bold text-accent">
              Civilians Win! 🎉
            </h2>
            <p className="text-muted-foreground">The Impostor was caught!</p>
          </>
        ) : (
          <>
            <Skull className="w-16 h-16 text-secondary animate-float" />
            <h2 className="text-3xl font-display font-bold text-secondary text-glow-secondary">
              Impostor Wins! 🕵️
            </h2>
            <p className="text-muted-foreground">
              {mostVoted ? "Wrong person voted out!" : "It was a tie!"}
            </p>
          </>
        )}
      </motion.div>

      {/* Reveal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full bg-card border border-border rounded-xl p-5 space-y-4"
      >
        <div>
          <p className="text-sm text-muted-foreground">The Impostor was:</p>
          <div className="flex items-center justify-center gap-3 mt-2">
            {impostor && <PlayerAvatar color={impostor.avatarColor} face={impostor.avatarFace} size="md" />}
            <span className="text-xl font-display font-bold text-secondary">{impostor?.name}</span>
          </div>
        </div>
        <div className="border-t border-border pt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Civilian word</p>
            <p className="text-lg font-display font-bold text-primary">{state.civilianWord}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Impostor word</p>
            <p className="text-lg font-display font-bold text-secondary">{state.impostorWord}</p>
          </div>
        </div>
      </motion.div>

      {/* Vote breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full bg-card border border-border rounded-xl p-4"
      >
        <p className="text-sm text-muted-foreground mb-3">Vote Results:</p>
        <div className="space-y-2">
          {state.players
            .sort((a, b) => (b.votesReceived || 0) - (a.votesReceived || 0))
            .map(p => (
              <div key={p.id} className="flex items-center gap-3">
                <PlayerAvatar color={p.avatarColor} face={p.avatarFace} size="sm" className="!w-6 !h-6 !text-sm" />
                <span className="font-display text-sm text-foreground flex-1 text-left">{p.name}</span>
                <div className="flex gap-1">
                  {Array.from({ length: p.votesReceived || 0 }).map((_, i) => (
                    <span key={i} className="text-destructive text-xs">🔴</span>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground w-8 text-right">{p.votesReceived || 0}</span>
                {p.id === state.impostorId && (
                  <span className="text-xs text-secondary">🕵️</span>
                )}
              </div>
            ))}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex gap-3"
      >
        <Button
          size="lg"
          onClick={onPlayAgain}
          className="font-display neon-glow-primary bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <RotateCcw className="w-5 h-5 mr-2" /> Play Again
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={onNewGame}
          className="font-display border-secondary/40 text-secondary hover:bg-secondary/10"
        >
          New Game
        </Button>
      </motion.div>
    </div>
  );
}
