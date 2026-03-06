import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HomeScreen } from "@/components/HomeScreen";
import { BotGame } from "@/components/BotGame";
import { OnlineLobby } from "@/components/OnlineLobby";
import { CategorySelect } from "@/components/CategorySelect";
import { OnlineWordReveal } from "@/components/OnlineWordReveal";
import { OnlineCluePhase } from "@/components/OnlineCluePhase";
import { OnlineVotingPhase } from "@/components/OnlineVotingPhase";
import { OnlineResults } from "@/components/OnlineResults";
import { RoundTransition } from "@/components/RoundTransition";
import { useRoom } from "@/hooks/useRoom";
import { startGame, advancePhase, submitClue, submitVote, resetForNewRound, leaveRoom, startNextRound } from "@/lib/roomService";
import { CategoryData } from "@/lib/gameData";
import { Skull, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string>("");
  const [isHostState, setIsHostState] = useState(false);
  const [botMode, setBotMode] = useState(false);

  const { room, players, myPlayer, isHost, loading } = useRoom(roomId);

  // Helpers to find next alive player index
  const getNextAliveIndex = (currentIdx: number): number | null => {
    for (let i = currentIdx + 1; i < players.length; i++) {
      if (!players[i].eliminated) return i;
    }
    return null; // No more alive players after current
  };

  const getFirstAliveIndex = (): number => {
    const idx = players.findIndex(p => !p.eliminated);
    return idx >= 0 ? idx : 0;
  };

  const handleRoomJoined = useCallback((id: string, code: string, host: boolean) => {
    setRoomId(id);
    setRoomCode(code);
    setIsHostState(host);
  }, []);

  const handleSelectCategory = useCallback(async (category: CategoryData) => {
    if (!roomId) return;
    if (category.name === "Custom") {
      await startGame(roomId, "Custom", category.words[0]);
    } else {
      await startGame(roomId, category.name);
    }
  }, [roomId]);

  const handleAdvanceReveal = useCallback(async () => {
    if (!roomId || !room) return;
    const nextIndex = room.current_player_index + 1;
    if (nextIndex >= players.length) {
      const firstAlive = getFirstAliveIndex();
      await advancePhase(roomId, "clue-phase", firstAlive);
    } else {
      await advancePhase(roomId, "word-reveal", nextIndex);
    }
  }, [roomId, room, players]);

  const handleSubmitClue = useCallback(async (clue: string) => {
    if (!roomId || !room) return;
    const currentPlayer = players[room.current_player_index];
    if (!currentPlayer) return;
    const nextAlive = getNextAliveIndex(room.current_player_index);
    await submitClue(roomId, currentPlayer.id, clue, nextAlive);
  }, [roomId, room, players]);

  const handleVote = useCallback(async (votedForId: string) => {
    if (!roomId || !room) return;
    const currentVoter = players[room.current_player_index];
    if (!currentVoter) return;
    const nextAlive = getNextAliveIndex(room.current_player_index);
    await submitVote(roomId, currentVoter.id, votedForId, nextAlive);
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

  const handleEliminationComplete = useCallback(async () => {
    if (!roomId) return;
    await startNextRound(roomId);
  }, [roomId]);

  // Bot mode
  if (botMode) {
    return <BotGame onExit={() => setBotMode(false)} />;
  }

  // Not in a room yet
  if (!roomId) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center py-8">
        <HomeScreen onRoomJoined={handleRoomJoined} onPlayBots={() => setBotMode(true)} />
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

  const alivePlayers = players.filter(p => !p.eliminated);
  const eliminatedPlayer = players.find(p => p.eliminated && p.votes_received > 0 &&
    p.votes_received === Math.max(...players.map(pp => pp.votes_received)));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-4 py-4"
      >
        {/* Leave button - top left */}
        {room.game_phase !== "results" && room.game_phase !== "elimination" ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLeave}
            className="text-muted-foreground hover:text-destructive text-xs"
          >
            Leave
          </Button>
        ) : (
          <div className="w-16" />
        )}

        <div className="flex items-center gap-3">
          <Skull className="w-6 h-6 text-secondary" />
          <h1 className="text-2xl font-display font-bold text-foreground">
            IMPOST<span className="text-secondary">O</span>R
          </h1>
          <span className="text-sm text-muted-foreground font-display ml-2">#{roomCode}</span>
          {room.game_phase !== "lobby" && room.game_phase !== "category-select" && (
            <span className="text-xs bg-muted rounded-full px-3 py-1 font-display text-muted-foreground ml-2">
              Round {room.round_number} • {alivePlayers.length} alive
            </span>
          )}
        </div>

        <div className="w-16" />
      </motion.header>

      {/* Elimination transition overlay */}
      <AnimatePresence>
        {room.game_phase === "elimination" && isHost && eliminatedPlayer && (
          <RoundTransition
            type="eliminated"
            playerName={eliminatedPlayer.player_name}
            playerColor={eliminatedPlayer.avatar_color}
            playerFace={eliminatedPlayer.avatar_face}
            message="They were innocent..."
            onComplete={handleEliminationComplete}
          />
        )}
        {room.game_phase === "elimination" && !isHost && (
          <RoundTransition
            type="eliminated"
            playerName={eliminatedPlayer?.player_name || "Someone"}
            playerColor={eliminatedPlayer?.avatar_color}
            playerFace={eliminatedPlayer?.avatar_face}
            message="Waiting for next round..."
            onComplete={() => {}}
          />
        )}
      </AnimatePresence>

      {/* Game content */}
      <main className="flex-1 flex items-start justify-center py-4 pb-8">
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
    </div>
  );
};

export default Index;
