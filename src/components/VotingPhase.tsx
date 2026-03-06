import { useState } from "react";
import { motion } from "framer-motion";
import { Player } from "@/lib/gameData";
import { PlayerAvatar } from "./PlayerAvatar";
import { Button } from "@/components/ui/button";
import { Vote, ArrowRight } from "lucide-react";

interface VotingPhaseProps {
  players: Player[];
  currentVoterIndex: number;
  onVote: (votedForId: string) => void;
}

export function VotingPhase({ players, currentVoterIndex, onVote }: VotingPhaseProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const voter = players[currentVoterIndex];

  const handleSubmit = () => {
    if (selected) {
      onVote(selected);
      setSelected(null);
    }
  };

  // Show all clues for discussion
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-display font-bold text-secondary text-glow-secondary"
      >
        <Vote className="inline w-6 h-6 mr-2" />
        Time to Vote!
      </motion.h2>

      {/* All clues recap */}
      <div className="w-full bg-card border border-border rounded-xl p-4">
        <p className="text-sm text-muted-foreground mb-3">All clues:</p>
        <div className="space-y-2">
          {players.map(p => (
            <div key={p.id} className="flex items-center gap-2">
              <PlayerAvatar color={p.avatarColor} face={p.avatarFace} size="sm" className="!w-6 !h-6 !text-sm" />
              <span className="font-display text-sm text-foreground">{p.name}:</span>
              <span className="text-sm text-primary font-semibold">&quot;{p.clue}&quot;</span>
            </div>
          ))}
        </div>
      </div>

      {/* Voter info */}
      <motion.div
        key={voter.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-3"
      >
        <PlayerAvatar color={voter.avatarColor} face={voter.avatarFace} size="md" />
        <h3 className="text-xl font-display font-bold text-foreground">{voter.name}'s vote</h3>
        <p className="text-muted-foreground text-sm">Who is the Impostor?</p>
      </motion.div>

      {/* Vote options */}
      <div className="w-full grid grid-cols-2 gap-3">
        {players
          .filter(p => p.id !== voter.id)
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
              <PlayerAvatar color={p.avatarColor} face={p.avatarFace} size="sm" />
              <span className="font-display text-sm font-semibold text-foreground">{p.name}</span>
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
            <Vote className="w-5 h-5 mr-2" />
            Cast Vote
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      )}

      <p className="text-xs text-muted-foreground">
        Voter {currentVoterIndex + 1} of {players.length}
      </p>
    </div>
  );
}
