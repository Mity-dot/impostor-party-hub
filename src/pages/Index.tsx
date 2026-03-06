import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { GameLobby } from "@/components/GameLobby";
import { CategorySelect } from "@/components/CategorySelect";
import { WordReveal } from "@/components/WordReveal";
import { CluePhase } from "@/components/CluePhase";
import { VotingPhase } from "@/components/VotingPhase";
import { GameResults } from "@/components/GameResults";
import { Player, CategoryData, resetNames } from "@/lib/gameData";
import { GameState, createInitialState, assignRoles, tallyVotes } from "@/lib/gameState";
import { Skull } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialState());

  const handleUpdatePlayers = useCallback((players: Player[]) => {
    setGameState(prev => ({ ...prev, players }));
  }, []);

  const handleStartGame = useCallback(() => {
    setGameState(prev => ({ ...prev, phase: "category-select" }));
  }, []);

  const handleSelectCategory = useCallback((category: CategoryData) => {
    setGameState(prev => assignRoles(prev, category));
  }, []);

  const handleNextReveal = useCallback(() => {
    setGameState(prev => {
      const nextIndex = prev.currentPlayerIndex + 1;
      if (nextIndex >= prev.players.length) {
        return { ...prev, phase: "clue-phase", currentPlayerIndex: 0 };
      }
      return { ...prev, currentPlayerIndex: nextIndex };
    });
  }, []);

  const handleSubmitClue = useCallback((clue: string) => {
    setGameState(prev => {
      const players = prev.players.map((p, i) =>
        i === prev.currentPlayerIndex ? { ...p, clue } : p
      );
      const nextIndex = prev.currentPlayerIndex + 1;
      if (nextIndex >= players.length) {
        return { ...prev, players, phase: "voting", currentPlayerIndex: 0 };
      }
      return { ...prev, players, currentPlayerIndex: nextIndex };
    });
  }, []);

  const handleVote = useCallback((votedForId: string) => {
    setGameState(prev => {
      const players = prev.players.map((p, i) =>
        i === prev.currentPlayerIndex ? { ...p, votedFor: votedForId } : p
      );
      const nextIndex = prev.currentPlayerIndex + 1;
      if (nextIndex >= players.length) {
        return tallyVotes({ ...prev, players });
      }
      return { ...prev, players, currentPlayerIndex: nextIndex };
    });
  }, []);

  const handlePlayAgain = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      phase: "category-select",
      currentPlayerIndex: 0,
      players: prev.players.map(p => ({
        ...p,
        role: undefined,
        word: undefined,
        clue: undefined,
        votedFor: undefined,
        votesReceived: 0,
      })),
      round: prev.round + 1,
    }));
  }, []);

  const handleNewGame = useCallback(() => {
    resetNames();
    setGameState(createInitialState());
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-3 py-6"
      >
        <Skull className="w-8 h-8 text-secondary" />
        <h1 className="text-4xl font-display font-bold text-foreground">
          IMPOST<span className="text-secondary">O</span>R
        </h1>
        <Skull className="w-8 h-8 text-secondary" />
      </motion.header>

      {/* Game content */}
      <main className="flex-1 flex items-start justify-center py-4 pb-12">
        {gameState.phase === "lobby" && (
          <GameLobby
            players={gameState.players}
            onUpdatePlayers={handleUpdatePlayers}
            onStartGame={handleStartGame}
          />
        )}
        {gameState.phase === "category-select" && (
          <CategorySelect onSelect={handleSelectCategory} />
        )}
        {gameState.phase === "word-reveal" && (
          <WordReveal
            players={gameState.players}
            currentPlayerIndex={gameState.currentPlayerIndex}
            onNext={handleNextReveal}
          />
        )}
        {gameState.phase === "clue-phase" && (
          <CluePhase
            players={gameState.players}
            currentPlayerIndex={gameState.currentPlayerIndex}
            onSubmitClue={handleSubmitClue}
          />
        )}
        {gameState.phase === "voting" && (
          <VotingPhase
            players={gameState.players}
            currentVoterIndex={gameState.currentPlayerIndex}
            onVote={handleVote}
          />
        )}
        {gameState.phase === "results" && (
          <GameResults
            state={gameState}
            onPlayAgain={handlePlayAgain}
            onNewGame={handleNewGame}
          />
        )}
      </main>

      {/* Footer */}
      {gameState.phase !== "lobby" && gameState.phase !== "results" && (
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-4 left-0 right-0 flex justify-center"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewGame}
            className="text-muted-foreground hover:text-destructive text-xs"
          >
            Quit Game
          </Button>
        </motion.footer>
      )}
    </div>
  );
};

export default Index;
