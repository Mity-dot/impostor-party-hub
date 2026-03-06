import { useState } from "react";
import { motion } from "framer-motion";
import { Player } from "@/lib/gameData";
import { PlayerAvatar } from "./PlayerAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, MessageCircle } from "lucide-react";

interface CluePhaseProps {
  players: Player[];
  currentPlayerIndex: number;
  onSubmitClue: (clue: string) => void;
}

export function CluePhase({ players, currentPlayerIndex, onSubmitClue }: CluePhaseProps) {
  const [clue, setClue] = useState("");
  const player = players[currentPlayerIndex];

  // Show clues already given
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
        className="text-2xl font-display font-bold text-accent text-glow-primary"
      >
        <MessageCircle className="inline w-6 h-6 mr-2" />
        Clue Time!
      </motion.h2>

      {/* Previously given clues */}
      {givenClues.length > 0 && (
        <div className="w-full space-y-2">
          <p className="text-sm text-muted-foreground">Clues given so far:</p>
          <div className="flex flex-wrap gap-2">
            {givenClues.map(p => (
              <div key={p.id} className="flex items-center gap-2 bg-muted rounded-full px-3 py-1.5">
                <PlayerAvatar color={p.avatarColor} face={p.avatarFace} size="sm" className="!w-6 !h-6 !text-sm" />
                <span className="text-sm font-display text-foreground">{p.name}:</span>
                <span className="text-sm font-semibold text-primary">&quot;{p.clue}&quot;</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current player */}
      <motion.div
        key={player.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-3 bg-card border border-border rounded-xl p-6 w-full"
      >
        <PlayerAvatar color={player.avatarColor} face={player.avatarFace} size="md" animate />
        <h3 className="text-xl font-display font-bold text-foreground">{player.name}'s turn</h3>
        <p className="text-muted-foreground text-sm text-center">
          Give a ONE-WORD clue about your word. Don't make it too obvious!
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

      <p className="text-xs text-muted-foreground">
        Player {currentPlayerIndex + 1} of {players.length}
      </p>
    </div>
  );
}
