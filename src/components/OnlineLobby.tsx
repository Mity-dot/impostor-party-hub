import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayerAvatar } from "./PlayerAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Pencil, Check, Shuffle, Copy, Users, Crown, X } from "lucide-react";
import { AVATAR_COLORS, AVATAR_FACES, generateUsername } from "@/lib/gameData";
import { updatePlayerProfile, kickPlayer } from "@/lib/roomService";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type RoomPlayer = Database["public"]["Tables"]["room_players"]["Row"];

interface OnlineLobbyProps {
  roomCode: string;
  roomId: string;
  players: RoomPlayer[];
  myPlayer: RoomPlayer | null;
  isHost: boolean;
  onStartGame: () => void;
}

export function OnlineLobby({ roomCode, roomId, players, myPlayer, isHost, onStartGame }: OnlineLobbyProps) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(myPlayer?.player_name || "");
  const [editColor, setEditColor] = useState(myPlayer?.avatar_color || "");
  const [editFace, setEditFace] = useState(myPlayer?.avatar_face || "");

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast.success("Room code copied!");
  };

  const startEditing = () => {
    if (!myPlayer) return;
    setEditName(myPlayer.player_name);
    setEditColor(myPlayer.avatar_color);
    setEditFace(myPlayer.avatar_face);
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!editName.trim()) return;
    await updatePlayerProfile(roomId, {
      player_name: editName.trim(),
      avatar_color: editColor,
      avatar_face: editFace,
    });
    setEditing(false);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4">
      {/* Room code */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-2"
      >
        <p className="text-sm text-muted-foreground">Room Code</p>
        <button
          onClick={copyCode}
          className="flex items-center gap-2 bg-card border-2 border-primary/40 rounded-xl px-6 py-3 neon-glow-primary hover:border-primary/70 transition-colors"
        >
          <span className="text-4xl font-display font-bold tracking-[0.3em] text-primary">{roomCode}</span>
          <Copy className="w-5 h-5 text-primary" />
        </button>
        <p className="text-xs text-muted-foreground">Tap to copy • Share with friends!</p>
      </motion.div>

      {/* Players */}
      <div className="w-full">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Players ({players.length})</span>
        </div>
        <div className="space-y-2">
          <AnimatePresence>
            {players.map((player, i) => {
              const isMe = player.session_id === myPlayer?.session_id;
              const isPlayerHost = player.player_order === 0;

              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-3 rounded-lg p-3 border ${
                    isMe ? "bg-card border-primary/30" : "bg-card border-border"
                  }`}
                >
                  <PlayerAvatar color={player.avatar_color} face={player.avatar_face} size="sm" />
                  <span className="flex-1 font-display font-semibold text-foreground">
                    {player.player_name}
                    {isMe && <span className="text-xs text-primary ml-2">(You)</span>}
                  </span>
                  {isPlayerHost && <Crown className="w-4 h-4 text-warning" />}
                  {isMe && !editing && (
                    <Button size="icon" variant="ghost" onClick={startEditing}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Edit my profile */}
      {editing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="w-full bg-card border border-border rounded-xl p-4 space-y-3"
        >
          <h3 className="font-display font-semibold text-foreground">Customize</h3>
          <div className="flex items-center gap-2">
            <PlayerAvatar color={editColor} face={editFace} size="sm" />
            <Input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="flex-1 bg-muted"
              maxLength={20}
            />
            <Button size="icon" variant="ghost" onClick={() => setEditName(generateUsername())}>
              <Shuffle className="w-4 h-4" />
            </Button>
          </div>
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
          <Button size="sm" onClick={saveEdit} className="neon-glow-primary bg-primary text-primary-foreground">
            <Check className="w-4 h-4 mr-1" /> Save
          </Button>
        </motion.div>
      )}

      {/* Start / Waiting */}
      {isHost ? (
        players.length >= 3 ? (
          <Button
            size="lg"
            onClick={onStartGame}
            className="text-lg font-display px-8 neon-glow-primary bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Play className="w-5 h-5 mr-2" /> Start Game
          </Button>
        ) : (
          <p className="text-muted-foreground text-sm">
            Need at least {3 - players.length} more player{3 - players.length > 1 ? "s" : ""} to start
          </p>
        )
      ) : (
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-muted-foreground font-display text-center"
        >
          Waiting for host to start the game...
        </motion.p>
      )}
    </div>
  );
}
