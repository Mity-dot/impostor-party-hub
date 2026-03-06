import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skull, Plus, LogIn, Shuffle } from "lucide-react";
import { createRoom, joinRoom } from "@/lib/roomService";
import { toast } from "sonner";

interface HomeScreenProps {
  onRoomJoined: (roomId: string, roomCode: string, isHost: boolean) => void;
}

export function HomeScreen({ onRoomJoined }: HomeScreenProps) {
  const [mode, setMode] = useState<"home" | "create" | "join">("home");
  const [roomCode, setRoomCode] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const code = await createRoom(customCode || undefined);
      const { roomId, isHost } = await joinRoom(code);
      onRoomJoined(roomId, code, isHost);
    } catch (e: any) {
      toast.error(e.message);
    }
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!roomCode.trim()) return;
    setLoading(true);
    try {
      const { roomId, isHost } = await joinRoom(roomCode);
      onRoomJoined(roomId, roomCode.toUpperCase(), isHost);
    } catch (e: any) {
      toast.error(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto px-4">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="flex flex-col items-center gap-2 mt-8"
      >
        <div className="flex items-center gap-3">
          <Skull className="w-10 h-10 text-secondary" />
          <h1 className="text-5xl font-display font-bold text-foreground">
            IMPOST<span className="text-secondary">O</span>R
          </h1>
          <Skull className="w-10 h-10 text-secondary" />
        </div>
        <p className="text-muted-foreground text-center">
          The party word game of deception 🕵️
        </p>
      </motion.div>

      {mode === "home" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 w-full"
        >
          <Button
            size="lg"
            onClick={() => setMode("create")}
            className="text-xl font-display h-16 neon-glow-primary bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-6 h-6 mr-3" /> Create Room
          </Button>
          <Button
            size="lg"
            onClick={() => setMode("join")}
            className="text-xl font-display h-16 neon-glow-secondary bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            <LogIn className="w-6 h-6 mr-3" /> Join Room
          </Button>
        </motion.div>
      )}

      {mode === "create" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 w-full"
        >
          <h2 className="text-2xl font-display font-bold text-primary text-center">Create a Room</h2>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Custom room code (optional)</label>
            <Input
              value={customCode}
              onChange={e => setCustomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
              placeholder="e.g. PARTY"
              className="text-center text-2xl font-display tracking-widest bg-muted h-14"
              maxLength={6}
            />
            <p className="text-xs text-muted-foreground text-center">Leave empty for a random code</p>
          </div>
          <Button
            size="lg"
            onClick={handleCreate}
            disabled={loading}
            className="text-lg font-display neon-glow-primary bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? "Creating..." : "Create Room"}
          </Button>
          <Button variant="ghost" onClick={() => setMode("home")} className="text-muted-foreground">
            Back
          </Button>
        </motion.div>
      )}

      {mode === "join" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 w-full"
        >
          <h2 className="text-2xl font-display font-bold text-secondary text-center">Join a Room</h2>
          <Input
            value={roomCode}
            onChange={e => setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
            placeholder="Enter room code"
            className="text-center text-3xl font-display tracking-[0.5em] bg-muted h-16"
            maxLength={6}
            onKeyDown={e => e.key === "Enter" && handleJoin()}
          />
          <Button
            size="lg"
            onClick={handleJoin}
            disabled={loading || !roomCode.trim()}
            className="text-lg font-display neon-glow-secondary bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            {loading ? "Joining..." : "Join Room"}
          </Button>
          <Button variant="ghost" onClick={() => setMode("home")} className="text-muted-foreground">
            Back
          </Button>
        </motion.div>
      )}
    </div>
  );
}
