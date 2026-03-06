import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { HomeScreen } from "@/components/HomeScreen";
import { OnlineLobby } from "@/components/OnlineLobby";
import { CategorySelect } from "@/components/CategorySelect";
import { OnlineWordReveal } from "@/components/OnlineWordReveal";
import { OnlineCluePhase } from "@/components/OnlineCluePhase";
import { OnlineVotingPhase } from "@/components/OnlineVotingPhase";
import { OnlineResults } from "@/components/OnlineResults";
import { useRoom } from "@/hooks/useRoom";
import { startGame, advancePhase, submitClue, submitVote, resetForNewRound, leaveRoom } from "@/lib/roomService";
import { CategoryData } from "@/lib/gameData";
import { Skull, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string>("");
  const [isHostState, setIsHostState] = useState(false);

  const { room, players, myPlayer, isHost, loading } = useRoom(roomId);

  const handleRoomJoined = useCallback((id: string, code: string, host: boolean) => {
    setRoomId(id);
    setRoomCode(code);
    setIsHostState(host);
  }, []);

  const handleSelectCategory = useCallback(async (category: CategoryData) => {
    if (!roomId) return;
    await startGame(roomId, category.name);
  }, [roomId]);

  const handleAdvanceReveal = useCallback(async () => {
    if (!roomId || !room) return;
    const nextIndex = room.current_player_index + 1;
    if (nextIndex >= players.length) {
      await advancePhase(roomId, "clue-phase", 0);
    } else {
      await advancePhase(roomId, "word-reveal", nextIndex);
    }
  }, [roomId, room, players.length]);

  const handleSubmitClue = useCallback(async (clue: string) => {
    if (!roomId || !room) return;
    const currentPlayer = players[room.current_player_index];
    if (!currentPlayer) return;
    await submitClue(roomId, currentPlayer.id, clue, room.current_player_index + 1, players.length);
  }, [roomId, room, players]);

  const handleVote = useCallback(async (votedForId: string) => {
    if (!roomId || !room) return;
    const currentVoter = players[room.current_player_index];
    if (!currentVoter) return;
    await submitVote(roomId, currentVoter.id, votedForId, room.current_player_index + 1, players.length);
  }, [roomId, room, players]);

  const handlePlayAgain = useCallback(async () => {
    if (!roomId) return;
    await resetForNewRound(roomId);
  }, [roomId]);

  const handleLeave = useCallback(async () => {
    if (roomId) await leaveRoom(roomId);
    setRoomId(null);
    setRoomCode("");
  }, [roomId]);

  const handleStartGame = useCallback(async () => {
    if (!roomId) return;
    await advancePhase(roomId, "category-select", 0);
  }, [roomId]);

  // Not in a room yet
  if (!roomId) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center py-8">
        <HomeScreen onRoomJoined={handleRoomJoined} />
      </div>
    );
  }

  // Loading room data
  if (loading || !room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-3 py-4"
      >
        <Skull className="w-6 h-6 text-secondary" />
        <h1 className="text-2xl font-display font-bold text-foreground">
          IMPOST<span className="text-secondary">O</span>R
        </h1>
        <span className="text-sm text-muted-foreground font-display ml-2">#{roomCode}</span>
      </motion.header>

      {/* Game content */}
      <main className="flex-1 flex items-start justify-center py-4 pb-16">
        {room.game_phase === "lobby" && (
          <OnlineLobby
            roomCode={roomCode}
            roomId={roomId}
            players={players}
            myPlayer={myPlayer}
            isHost={isHost}
            onStartGame={handleStartGame}
          />
        )}
        {room.game_phase === "category-select" && isHost && (
          <CategorySelect onSelect={handleSelectCategory} />
        )}
        {room.game_phase === "category-select" && !isHost && (
          <div className="flex flex-col items-center gap-4 text-center px-4">
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-xl font-display text-muted-foreground"
            >
              Host is picking a category...
            </motion.p>
          </div>
        )}
        {room.game_phase === "word-reveal" && (
          <OnlineWordReveal
            room={room}
            players={players}
            myPlayer={myPlayer}
            isHost={isHost}
            onAdvance={handleAdvanceReveal}
          />
        )}
        {room.game_phase === "clue-phase" && (
          <OnlineCluePhase
            room={room}
            players={players}
            myPlayer={myPlayer}
            onSubmitClue={handleSubmitClue}
          />
        )}
        {room.game_phase === "voting" && (
          <OnlineVotingPhase
            room={room}
            players={players}
            myPlayer={myPlayer}
            onVote={handleVote}
          />
        )}
        {room.game_phase === "results" && (
          <OnlineResults
            room={room}
            players={players}
            isHost={isHost}
            onPlayAgain={handlePlayAgain}
            onLeave={handleLeave}
          />
        )}
      </main>

      {/* Quit */}
      {room.game_phase !== "results" && (
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-4 left-0 right-0 flex justify-center"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLeave}
            className="text-muted-foreground hover:text-destructive text-xs"
          >
            Leave Room
          </Button>
        </motion.footer>
      )}
    </div>
  );
};

export default Index;
