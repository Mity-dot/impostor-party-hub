import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { CategorySelect } from "@/components/CategorySelect";
import { RoundTransition } from "@/components/RoundTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Player, CategoryData, AVATAR_COLORS, AVATAR_FACES, generateUsername, resetNames, createPlayer,
} from "@/lib/gameData";
import { generateBotClue, generateBotVote } from "@/lib/botAI";
import {
  Skull, Bot, Play, Eye, EyeOff, ArrowRight, MessageCircle, Vote, Trophy, RotateCcw, Home, Minus, Plus, Pencil, Shuffle, Check, UserX, Users,
} from "lucide-react";
import { getImpostorCount } from "@/lib/gameState";

type Phase = "setup" | "category" | "reveal" | "clues" | "voting" | "elimination" | "round-transition" | "results";

interface BotPlayer extends Player {
  isBot: boolean;
  eliminated?: boolean;
}

export function BotGame({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [botCount, setBotCount] = useState(3);
  const [humanPlayer, setHumanPlayer] = useState<BotPlayer | null>(null);
  const [players, setPlayers] = useState<BotPlayer[]>([]);
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [civilianWord, setCivilianWord] = useState("");
  const [impostorWord, setImpostorWord] = useState("");
  const [impostorIds, setImpostorIds] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [clueIndex, setClueIndex] = useState(0);
  const [humanClue, setHumanClue] = useState("");
  const [voteIndex, setVoteIndex] = useState(0);
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editFace, setEditFace] = useState("");
  const [round, setRound] = useState(1);
  const [eliminatedPlayer, setEliminatedPlayer] = useState<BotPlayer | null>(null);
  const [gameWinner, setGameWinner] = useState<"civilians" | "impostor" | null>(null);
  const [eliminatedPlayers, setEliminatedPlayers] = useState<BotPlayer[]>([]);
  const botTimerRef = useRef<NodeJS.Timeout>();

  const alivePlayers = players.filter(p => !p.eliminated);

  useEffect(() => {
    resetNames();
    const p = createPlayer();
    setHumanPlayer({ ...p, isBot: false });
  }, []);

  const startGame = useCallback(() => {
    if (!humanPlayer) return;
    resetNames();
    const bots: BotPlayer[] = [];
    for (let i = 0; i < botCount; i++) {
      const bp = createPlayer(bots.map(b => b.name).concat([humanPlayer.name]));
      bots.push({ ...bp, isBot: true });
    }
    const allPlayers = [{ ...humanPlayer, isBot: false } as BotPlayer, ...bots];
    for (let i = allPlayers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allPlayers[i], allPlayers[j]] = [allPlayers[j], allPlayers[i]];
    }
    setPlayers(allPlayers);
    setRound(1);
    setEliminatedPlayers([]);
    setGameWinner(null);
    setPhase("category");
  }, [humanPlayer, botCount]);

  const handleSelectCategory = useCallback((cat: CategoryData) => {
    setCategory(cat);
    const wordPair = cat.words[Math.floor(Math.random() * cat.words.length)];
    setCivilianWord(wordPair.civilian);
    setImpostorWord(wordPair.impostor);

    setPlayers(prev => {
      const count = getImpostorCount(prev.length);
      const indices = Array.from({ length: prev.length }, (_, i) => i);
      const impIndices: number[] = [];
      for (let c = 0; c < count && indices.length > 0; c++) {
        const pick = Math.floor(Math.random() * indices.length);
        impIndices.push(indices[pick]);
        indices.splice(pick, 1);
      }
      setImpostorIds(impIndices.map(i => prev[i].id));
      return prev.map((p, i) => ({
        ...p,
        role: impIndices.includes(i) ? "impostor" as const : "civilian" as const,
        word: impIndices.includes(i) ? wordPair.impostor : wordPair.civilian,
        clue: undefined,
        votedFor: undefined,
        votesReceived: 0,
        eliminated: false,
      }));
    });
    setRevealed(false);
    setPhase("reveal");
  }, []);

  // Get next alive player index for clue/vote phases
  const getNextAliveIndex = (currentIdx: number, playerList: BotPlayer[]): number => {
    let idx = currentIdx + 1;
    while (idx < playerList.length && playerList[idx].eliminated) idx++;
    return idx;
  };

  const getFirstAliveIndex = (playerList: BotPlayer[]): number => {
    return playerList.findIndex(p => !p.eliminated);
  };

  // Bot clue auto-play
  useEffect(() => {
    if (phase !== "clues") return;
    const current = players[clueIndex];
    if (!current || current.eliminated || !current.isBot) return;

    botTimerRef.current = setTimeout(() => {
      const usedClues = players.filter(p => p.clue).map(p => p.clue!.toLowerCase());
      const clue = generateBotClue(current.word!, usedClues);
      setPlayers(prev => prev.map((p, i) => i === clueIndex ? { ...p, clue } : p));
      const nextIdx = getNextAliveIndex(clueIndex, players);
      if (nextIdx >= players.length) {
        setVoteIndex(getFirstAliveIndex(players));
        setPhase("voting");
      } else {
        setClueIndex(nextIdx);
      }
    }, 1200 + Math.random() * 800);

    return () => clearTimeout(botTimerRef.current);
  }, [phase, clueIndex, players]);

  // Bot vote auto-play
  useEffect(() => {
    if (phase !== "voting") return;
    const current = players[voteIndex];
    if (!current || current.eliminated || !current.isBot) return;

    botTimerRef.current = setTimeout(() => {
      const alive = players.filter(p => !p.eliminated);
      const votedFor = generateBotVote(
        current.id,
        current.role as "civilian" | "impostor",
        alive.map(p => ({ id: p.id, clue: p.clue, role: p.role })),
        impostorIds
      );
      setPlayers(prev => prev.map((p, i) => i === voteIndex ? { ...p, votedFor } : p));
      const nextIdx = getNextAliveIndex(voteIndex, players);
      if (nextIdx >= players.length) {
        processVotes();
      } else {
        setVoteIndex(nextIdx);
      }
    }, 800 + Math.random() * 600);

    return () => clearTimeout(botTimerRef.current);
  }, [phase, voteIndex, players, impostorIds]);

  const processVotes = () => {
    setPlayers(prev => {
      const alive = prev.filter(p => !p.eliminated);
      const voteCount: Record<string, number> = {};
      alive.forEach(p => { if (p.votedFor) voteCount[p.votedFor] = (voteCount[p.votedFor] || 0) + 1; });
      
      // Find most voted
      let maxVotes = 0;
      let mostVotedId: string | null = null;
      let tie = false;
      Object.entries(voteCount).forEach(([id, count]) => {
        if (count > maxVotes) { maxVotes = count; mostVotedId = id; tie = false; }
        else if (count === maxVotes) tie = true;
      });

      const updated = prev.map(p => ({ ...p, votesReceived: voteCount[p.id] || 0 }));
      
      if (!tie && mostVotedId) {
        const eliminated = updated.find(p => p.id === mostVotedId)!;
        setEliminatedPlayer({ ...eliminated });
        
        const isImpostor = impostorIds.includes(mostVotedId);
        const markedUpdated = updated.map(p => p.id === mostVotedId ? { ...p, eliminated: true } : p);
        const remainingAlive = markedUpdated.filter(p => !p.eliminated);
        const aliveImpostors = remainingAlive.filter(p => impostorIds.includes(p.id));
        const aliveCivilians = remainingAlive.filter(p => !impostorIds.includes(p.id));
        
        if (aliveImpostors.length === 0) {
          // All impostors eliminated
          setGameWinner("civilians");
        } else if (aliveCivilians.length <= aliveImpostors.length) {
          // Impostors equal or outnumber civilians
          setGameWinner("impostor");
        }
        // Otherwise continue
        return markedUpdated;
      } else {
        // Tie - no one eliminated, impostor survives
        setEliminatedPlayer(null);
        setGameWinner("impostor");
      }
      return updated;
    });
    setPhase("elimination");
  };

  const submitHumanClue = () => {
    if (!humanClue.trim()) return;
    setPlayers(prev => prev.map((p, i) => i === clueIndex ? { ...p, clue: humanClue.trim() } : p));
    setHumanClue("");
    const nextIdx = getNextAliveIndex(clueIndex, players);
    if (nextIdx >= players.length) {
      setVoteIndex(getFirstAliveIndex(players));
      setPhase("voting");
    } else {
      setClueIndex(nextIdx);
    }
  };

  const submitHumanVote = () => {
    if (!selectedVote) return;
    setPlayers(prev => prev.map((p, i) => i === voteIndex ? { ...p, votedFor: selectedVote } : p));
    setSelectedVote(null);
    const nextIdx = getNextAliveIndex(voteIndex, players);
    if (nextIdx >= players.length) {
      processVotes();
    } else {
      setVoteIndex(nextIdx);
    }
  };

  const handleEliminationComplete = () => {
    if (gameWinner) {
      setPhase("results");
    } else {
      // Next round
      setRound(prev => prev + 1);
      setPhase("round-transition");
    }
  };

  const handleRoundTransitionComplete = () => {
    // Reset clues/votes for next round
    setPlayers(prev => prev.map(p => ({ ...p, clue: undefined, votedFor: undefined, votesReceived: 0 })));
    const firstAlive = players.findIndex(p => !p.eliminated);
    setClueIndex(firstAlive >= 0 ? firstAlive : 0);
    setPhase("clues");
  };

  const startEditing = () => {
    if (!humanPlayer) return;
    setEditName(humanPlayer.name);
    setEditColor(humanPlayer.avatarColor);
    setEditFace(humanPlayer.avatarFace);
    setEditing(true);
  };

  const saveEdit = () => {
    if (!editName.trim() || !humanPlayer) return;
    setHumanPlayer({ ...humanPlayer, name: editName.trim(), avatarColor: editColor, avatarFace: editFace });
    setEditing(false);
  };

  const playAgain = () => {
    setPhase("category");
    setClueIndex(0);
    setVoteIndex(0);
    setRevealed(false);
    setRound(1);
    setEliminatedPlayers([]);
    setGameWinner(null);
    setEliminatedPlayer(null);
  };

  const me = players.find(p => !p.isBot);
  const meEliminated = me?.eliminated;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-3 py-4">
        <Bot className="w-6 h-6 text-accent" />
        <h1 className="text-2xl font-display font-bold text-foreground">
          IMPOST<span className="text-secondary">O</span>R
        </h1>
        <span className="text-sm text-muted-foreground font-display ml-2">vs Bots</span>
        {phase !== "setup" && phase !== "category" && phase !== "results" && (
          <span className="text-xs bg-muted rounded-full px-3 py-1 font-display text-muted-foreground ml-2">
            Round {round} • {alivePlayers.length} alive
          </span>
        )}
      </motion.header>

      <main className="flex-1 flex items-start justify-center py-4 pb-16">
        {/* Elimination transition */}
        <AnimatePresence>
          {phase === "elimination" && eliminatedPlayer && (
            <RoundTransition
              type="eliminated"
              playerName={eliminatedPlayer.name}
              playerColor={eliminatedPlayer.avatarColor}
              playerFace={eliminatedPlayer.avatarFace}
              message={
                gameWinner === "civilians"
                  ? "They were the Impostor! 🎉"
                  : gameWinner === "impostor"
                  ? "They were innocent... The Impostor wins!"
                  : "They were innocent..."
              }
              onComplete={handleEliminationComplete}
            />
          )}
          {phase === "elimination" && !eliminatedPlayer && (
            <RoundTransition
              type="eliminated"
              playerName="Nobody"
              message="It's a tie! The Impostor escapes!"
              onComplete={handleEliminationComplete}
            />
          )}
          {phase === "round-transition" && (
            <RoundTransition
              type="new-round"
              roundNumber={round}
              onComplete={handleRoundTransitionComplete}
            />
          )}
        </AnimatePresence>

        {/* SETUP */}
        {phase === "setup" && humanPlayer && (
          <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto px-4">
            <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-display font-bold text-accent">
              Play vs Bots
            </motion.h2>

            <div className="w-full bg-card border border-border rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-3">Your Character</p>
              {editing ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <PlayerAvatar color={editColor} face={editFace} size="sm" />
                    <Input value={editName} onChange={e => setEditName(e.target.value)} className="flex-1 bg-muted" maxLength={20} />
                    <Button size="icon" variant="ghost" onClick={() => setEditName(generateUsername())}><Shuffle className="w-4 h-4" /></Button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {AVATAR_COLORS.map(c => (
                      <button key={c} onClick={() => setEditColor(c)} className={`w-7 h-7 rounded-full transition-transform ${editColor === c ? "scale-125 ring-2 ring-foreground" : ""}`} style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {AVATAR_FACES.map(f => (
                      <button key={f} onClick={() => setEditFace(f)} className={`w-8 h-8 rounded-md flex items-center justify-center text-lg transition-transform ${editFace === f ? "scale-125 bg-muted ring-2 ring-foreground" : ""}`}>{f}</button>
                    ))}
                  </div>
                  <Button size="sm" onClick={saveEdit} className="neon-glow-primary bg-primary text-primary-foreground"><Check className="w-4 h-4 mr-1" /> Save</Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <PlayerAvatar color={humanPlayer.avatarColor} face={humanPlayer.avatarFace} size="md" />
                  <span className="font-display font-bold text-lg text-foreground flex-1">{humanPlayer.name}</span>
                  <Button size="icon" variant="ghost" onClick={startEditing}><Pencil className="w-4 h-4" /></Button>
                </div>
              )}
            </div>

            <div className="w-full bg-card border border-border rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-3">Number of Bots</p>
              <div className="flex items-center justify-center gap-4">
                <Button size="icon" variant="outline" onClick={() => setBotCount(Math.max(2, botCount - 1))} disabled={botCount <= 2}>
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: botCount }).map((_, i) => (
                    <Bot key={i} className="w-6 h-6 text-accent" />
                  ))}
                </div>
                <Button size="icon" variant="outline" onClick={() => setBotCount(Math.min(9, botCount + 1))} disabled={botCount >= 9}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-2">{botCount} bots + you = {botCount + 1} players</p>
            </div>

            <Button size="lg" onClick={startGame} className="text-lg font-display px-8 neon-glow-accent bg-accent text-accent-foreground hover:bg-accent/90">
              <Play className="w-5 h-5 mr-2" /> Let's Go!
            </Button>
          </div>
        )}

        {/* CATEGORY */}
        {phase === "category" && <CategorySelect onSelect={handleSelectCategory} />}

        {/* REVEAL */}
        {phase === "reveal" && me && (
          <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto px-4 text-center">
            <PlayerAvatar color={me.avatarColor} face={me.avatarFace} size="lg" animate />
            <h3 className="text-2xl font-display font-bold text-foreground">{me.name}</h3>
            <AnimatePresence mode="wait">
              {revealed ? (
                <motion.div key="word" initial={{ opacity: 0, rotateX: 90 }} animate={{ opacity: 1, rotateX: 0 }} className="bg-card border-2 border-primary/40 rounded-xl p-6 w-full neon-glow-primary">
                  <p className="text-sm text-muted-foreground mb-2">Your word is:</p>
                  <p className="text-3xl font-display font-bold text-primary text-glow-primary">{me.word}</p>
                  {me.role === "impostor" && <p className="text-xs text-secondary mt-2 text-glow-secondary">You are the Impostor! 🕵️</p>}
                </motion.div>
              ) : (
                <motion.div key="hidden" exit={{ opacity: 0 }}>
                  <Button size="lg" onClick={() => setRevealed(true)} className="text-lg font-display px-8 neon-glow-secondary bg-secondary text-secondary-foreground hover:bg-secondary/90">
                    <Eye className="w-5 h-5 mr-2" /> Reveal My Word
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            {revealed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <Button size="lg" onClick={() => { setClueIndex(getFirstAliveIndex(players)); setPhase("clues"); }} className="text-lg font-display px-8 bg-primary text-primary-foreground hover:bg-primary/90">
                  <ArrowRight className="w-5 h-5 mr-2" /> Start Round 1!
                </Button>
              </motion.div>
            )}
          </div>
        )}

        {/* CLUES */}
        {phase === "clues" && (
          <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4">
            <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-display font-bold text-accent">
              <MessageCircle className="inline w-6 h-6 mr-2" />Round {round} — Clues
            </motion.h2>

            {/* Eliminated players strip */}
            {players.filter(p => p.eliminated).length > 0 && (
              <div className="flex gap-2 flex-wrap justify-center">
                {players.filter(p => p.eliminated).map(p => (
                  <div key={p.id} className="flex items-center gap-1 bg-destructive/10 rounded-full px-2 py-1 opacity-50">
                    <PlayerAvatar color={p.avatarColor} face={p.avatarFace} size="sm" className="!w-5 !h-5 !text-xs grayscale" />
                    <span className="text-xs text-muted-foreground line-through">{p.name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Given clues */}
            {alivePlayers.filter(p => p.clue).length > 0 && (
              <div className="w-full space-y-2">
                <p className="text-sm text-muted-foreground">Clues given:</p>
                <div className="flex flex-wrap gap-2">
                  {alivePlayers.filter(p => p.clue).map(p => (
                    <div key={p.id} className="flex items-center gap-2 bg-muted rounded-full px-3 py-1.5">
                      <PlayerAvatar color={p.avatarColor} face={p.avatarFace} size="sm" className="!w-6 !h-6 !text-sm" />
                      <span className="text-sm font-display text-foreground">{p.name}:</span>
                      <span className="text-sm font-semibold text-primary">&quot;{p.clue}&quot;</span>
                      {p.isBot && <Bot className="w-3 h-3 text-muted-foreground" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Current player */}
            {players[clueIndex] && !players[clueIndex].eliminated && (
              players[clueIndex].isBot ? (
                <motion.div key={clueIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3 bg-card border border-border rounded-xl p-6 w-full">
                  <PlayerAvatar color={players[clueIndex].avatarColor} face={players[clueIndex].avatarFace} size="md" animate />
                  <p className="font-display text-foreground">{players[clueIndex].name} is thinking...</p>
                  <Bot className="w-5 h-5 text-muted-foreground animate-pulse-glow" />
                </motion.div>
              ) : meEliminated ? (
                <div className="flex flex-col items-center gap-3 bg-card border border-destructive/30 rounded-xl p-6 w-full">
                  <UserX className="w-8 h-8 text-destructive" />
                  <p className="font-display text-destructive">You've been eliminated! Watching...</p>
                </div>
              ) : (
                <motion.div key={clueIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3 bg-card border border-border rounded-xl p-6 w-full">
                  <PlayerAvatar color={players[clueIndex].avatarColor} face={players[clueIndex].avatarFace} size="md" animate />
                  <h3 className="text-xl font-display font-bold text-foreground">Your turn!</h3>
                  <p className="text-muted-foreground text-sm text-center">Give a ONE-WORD clue.</p>
                  <div className="flex gap-2 w-full mt-2">
                    <Input value={humanClue} onChange={e => setHumanClue(e.target.value.replace(/\s/g, ""))} placeholder="Your clue..." className="flex-1 bg-muted text-lg font-display" maxLength={20} onKeyDown={e => e.key === "Enter" && submitHumanClue()} />
                    <Button onClick={submitHumanClue} disabled={!humanClue.trim()} className="neon-glow-accent bg-accent text-accent-foreground hover:bg-accent/90">
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </motion.div>
              )
            )}
          </div>
        )}

        {/* VOTING */}
        {phase === "voting" && (
          <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4">
            <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-display font-bold text-secondary text-glow-secondary">
              <Vote className="inline w-6 h-6 mr-2" />Round {round} — Vote
            </motion.h2>

            {/* All clues */}
            <div className="w-full bg-card border border-border rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-3">All clues:</p>
              <div className="space-y-2">
                {alivePlayers.map(p => (
                  <div key={p.id} className="flex items-center gap-2">
                    <PlayerAvatar color={p.avatarColor} face={p.avatarFace} size="sm" className="!w-6 !h-6 !text-sm" />
                    <span className="font-display text-sm text-foreground">{p.name}:</span>
                    <span className="text-sm text-primary font-semibold">&quot;{p.clue}&quot;</span>
                  </div>
                ))}
              </div>
            </div>

            {players[voteIndex] && !players[voteIndex].eliminated && (
              players[voteIndex].isBot ? (
                <div className="flex flex-col items-center gap-3 bg-card border border-border rounded-xl p-6 w-full">
                  <PlayerAvatar color={players[voteIndex].avatarColor} face={players[voteIndex].avatarFace} size="md" />
                  <p className="font-display text-foreground">{players[voteIndex].name} is voting...</p>
                  <Bot className="w-5 h-5 text-muted-foreground animate-pulse-glow" />
                </div>
              ) : meEliminated ? (
                <div className="flex flex-col items-center gap-3 bg-card border border-destructive/30 rounded-xl p-6 w-full">
                  <UserX className="w-8 h-8 text-destructive" />
                  <p className="font-display text-destructive">You're out! Watching the vote...</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center gap-3">
                    <PlayerAvatar color={players[voteIndex].avatarColor} face={players[voteIndex].avatarFace} size="md" />
                    <h3 className="text-xl font-display font-bold text-foreground">Your vote!</h3>
                    <p className="text-muted-foreground text-sm">Who is the Impostor?</p>
                  </div>
                  <div className="w-full grid grid-cols-2 gap-3">
                    {alivePlayers.filter(p => p.id !== players[voteIndex].id).map(p => (
                      <motion.button key={p.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setSelectedVote(p.id)}
                        className={`flex items-center gap-3 rounded-lg p-3 border-2 transition-colors ${selectedVote === p.id ? "border-destructive bg-destructive/10" : "border-border bg-card hover:border-muted-foreground/40"}`}
                      >
                        <PlayerAvatar color={p.avatarColor} face={p.avatarFace} size="sm" />
                        <span className="font-display text-sm font-semibold text-foreground">{p.name}</span>
                        {p.isBot && <Bot className="w-3 h-3 text-muted-foreground" />}
                      </motion.button>
                    ))}
                  </div>
                  {selectedVote && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Button size="lg" onClick={submitHumanVote} className="text-lg font-display px-8 bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        <Vote className="w-5 h-5 mr-2" /> Cast Vote
                      </Button>
                    </motion.div>
                  )}
                </>
              )
            )}
          </div>
        )}

        {/* RESULTS */}
        {phase === "results" && (() => {
          const impostor = players.find(p => p.id === impostorId);
          return (
            <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4 text-center">
              <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", duration: 0.8 }} className="flex flex-col items-center gap-3">
                {gameWinner === "civilians" ? (
                  <><Trophy className="w-16 h-16 text-accent animate-float" /><h2 className="text-3xl font-display font-bold text-accent">Civilians Win! 🎉</h2><p className="text-muted-foreground">The Impostor was found in Round {round}!</p></>
                ) : (
                  <><Skull className="w-16 h-16 text-secondary animate-float" /><h2 className="text-3xl font-display font-bold text-secondary text-glow-secondary">Impostor Wins! 🕵️</h2><p className="text-muted-foreground">The Impostor survived {round} round{round > 1 ? "s" : ""}!</p></>
                )}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="w-full bg-card border border-border rounded-xl p-5 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">The Impostor was:</p>
                  <div className="flex items-center justify-center gap-3 mt-2">
                    {impostor && <PlayerAvatar color={impostor.avatarColor} face={impostor.avatarFace} size="md" />}
                    <span className="text-xl font-display font-bold text-secondary">{impostor?.name}</span>
                    {impostor && !impostor.isBot && <span className="text-xs text-primary">(You!)</span>}
                  </div>
                </div>
                <div className="border-t border-border pt-4 grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-muted-foreground">Civilian word</p><p className="text-lg font-display font-bold text-primary">{civilianWord}</p></div>
                  <div><p className="text-xs text-muted-foreground">Impostor word</p><p className="text-lg font-display font-bold text-secondary">{impostorWord}</p></div>
                </div>
              </motion.div>

              {/* Elimination timeline */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="w-full bg-card border border-border rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-3">Final Round Votes:</p>
                <div className="space-y-2">
                  {[...alivePlayers, ...players.filter(p => p.eliminated)].sort((a, b) => (b.votesReceived || 0) - (a.votesReceived || 0)).map(p => (
                    <div key={p.id} className={`flex items-center gap-3 ${p.eliminated ? "opacity-50" : ""}`}>
                      <PlayerAvatar color={p.avatarColor} face={p.avatarFace} size="sm" className={`!w-6 !h-6 !text-sm ${p.eliminated ? "grayscale" : ""}`} />
                      <span className={`font-display text-sm text-foreground flex-1 text-left ${p.eliminated ? "line-through" : ""}`}>{p.name}</span>
                      {p.isBot && <Bot className="w-3 h-3 text-muted-foreground" />}
                      <div className="flex gap-1">{Array.from({ length: p.votesReceived || 0 }).map((_, i) => <span key={i} className="text-xs">🔴</span>)}</div>
                      <span className="text-sm text-muted-foreground w-8 text-right">{p.votesReceived || 0}</span>
                      {p.id === impostorId && <span className="text-xs text-secondary">🕵️</span>}
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex gap-3">
                <Button size="lg" onClick={playAgain} className="font-display neon-glow-primary bg-primary text-primary-foreground hover:bg-primary/90">
                  <RotateCcw className="w-5 h-5 mr-2" /> Play Again
                </Button>
                <Button size="lg" variant="outline" onClick={onExit} className="font-display border-secondary/40 text-secondary hover:bg-secondary/10">
                  <Home className="w-5 h-5 mr-2" /> Home
                </Button>
              </motion.div>
            </div>
          );
        })()}
      </main>

      {phase !== "results" && phase !== "setup" && phase !== "elimination" && phase !== "round-transition" && (
        <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed bottom-4 left-0 right-0 flex justify-center">
          <Button variant="ghost" size="sm" onClick={onExit} className="text-muted-foreground hover:text-destructive text-xs">Quit</Button>
        </motion.footer>
      )}
    </div>
  );
}
