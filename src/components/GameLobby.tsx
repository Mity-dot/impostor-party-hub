import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player, createPlayer, AVATAR_COLORS, AVATAR_FACES, releaseName } from "@/lib/gameData";
import { PlayerAvatar } from "./PlayerAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, X, Play, Pencil, Check, Shuffle } from "lucide-react";
import { generateUsername } from "@/lib/gameData";

interface GameLobbyProps {
  players: Player[];
  onUpdatePlayers: (players: Player[]) => void;
  onStartGame: () => void;
}

export function GameLobby({ players, onUpdatePlayers, onStartGame }: GameLobbyProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editFace, setEditFace] = useState("");

  const addPlayer = () => {
    const existingNames = players.map(p => p.name);
    const newPlayer = createPlayer(existingNames);
    onUpdatePlayers([...players, newPlayer]);
  };

  const removePlayer = (id: string) => {
    const player = players.find(p => p.id === id);
    if (player) releaseName(player.name);
    onUpdatePlayers(players.filter(p => p.id !== id));
  };

  const startEditing = (player: Player) => {
    setEditingId(player.id);
    setEditName(player.name);
    setEditColor(player.avatarColor);
    setEditFace(player.avatarFace);
  };

  const saveEdit = () => {
    if (!editingId || !editName.trim()) return;
    onUpdatePlayers(players.map(p =>
      p.id === editingId
        ? { ...p, name: editName.trim(), avatarColor: editColor, avatarFace: editFace }
        : p
    ));
    setEditingId(null);
  };

  const randomizeName = () => {
    setEditName(generateUsername());
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-display font-bold text-primary text-glow-primary"
      >
        Game Lobby
      </motion.h2>
      <p className="text-muted-foreground text-center">
        Add 3–10 players to start. Pass the device around!
      </p>

      {/* Player list */}
      <div className="w-full space-y-3">
        <AnimatePresence>
          {players.map((player, i) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 bg-card rounded-lg p-3 border border-border"
            >
              {editingId === player.id ? (
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <PlayerAvatar color={editColor} face={editFace} size="sm" />
                    <Input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="flex-1 bg-muted"
                      maxLength={20}
                    />
                    <Button size="icon" variant="ghost" onClick={randomizeName}>
                      <Shuffle className="w-4 h-4" />
                    </Button>
                  </div>
                  {/* Color picker */}
                  <div className="flex gap-2 flex-wrap">
                    {AVATAR_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setEditColor(c)}
                        className={`w-7 h-7 rounded-full transition-transform ${editColor === c ? "scale-125 ring-2 ring-foreground" : ""}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  {/* Face picker */}
                  <div className="flex gap-2 flex-wrap">
                    {AVATAR_FACES.map(f => (
                      <button
                        key={f}
                        onClick={() => setEditFace(f)}
                        className={`w-8 h-8 rounded-md flex items-center justify-center text-lg transition-transform ${editFace === f ? "scale-125 bg-muted ring-2 ring-foreground" : ""}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  <Button size="sm" onClick={saveEdit} className="neon-glow-primary">
                    <Check className="w-4 h-4 mr-1" /> Save
                  </Button>
                </div>
              ) : (
                <>
                  <PlayerAvatar color={player.avatarColor} face={player.avatarFace} size="sm" />
                  <span className="flex-1 font-display font-semibold text-foreground">{player.name}</span>
                  <Button size="icon" variant="ghost" onClick={() => startEditing(player)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => removePlayer(player.id)} className="text-destructive">
                    <X className="w-4 h-4" />
                  </Button>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add player */}
      {players.length < 30 && (
        <Button onClick={addPlayer} variant="outline" className="w-full border-dashed border-2 border-primary/40 text-primary hover:bg-primary/10">
          <UserPlus className="w-5 h-5 mr-2" /> Add Player
        </Button>
      )}

      {/* Start game */}
      {players.length >= 3 && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Button
            size="lg"
            onClick={onStartGame}
            className="text-lg font-display px-8 neon-glow-primary bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Play className="w-5 h-5 mr-2" /> Start Game
          </Button>
        </motion.div>
      )}

      {players.length < 3 && players.length > 0 && (
        <p className="text-muted-foreground text-sm">Need at least {3 - players.length} more player{3 - players.length > 1 ? "s" : ""}</p>
      )}
    </div>
  );
}
