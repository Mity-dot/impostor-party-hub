import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES, CategoryData } from "@/lib/gameData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Pencil, Play } from "lucide-react";

interface CategorySelectProps {
  onSelect: (category: CategoryData) => void;
}

export function CategorySelect({ onSelect }: CategorySelectProps) {
  const [customMode, setCustomMode] = useState(false);
  const [customCivilian, setCustomCivilian] = useState("");
  const [customImpostor, setCustomImpostor] = useState("");

  const handleCustomSubmit = () => {
    if (!customCivilian.trim() || !customImpostor.trim()) return;
    const customCategory: CategoryData = {
      name: "Custom",
      emoji: "✏️",
      words: [{ civilian: customCivilian.trim(), impostor: customImpostor.trim() }],
    };
    onSelect(customCategory);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-display font-bold text-secondary text-glow-secondary"
      >
        Pick a Category
      </motion.h2>

      <AnimatePresence mode="wait">
        {!customMode ? (
          <motion.div
            key="categories"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full space-y-3"
          >
            <div className="grid grid-cols-2 gap-3 w-full">
              {CATEGORIES.map((cat, i) => (
                <motion.button
                  key={cat.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelect(cat)}
                  className="flex flex-col items-center gap-2 bg-card border border-border rounded-lg p-5 hover:border-secondary/60 transition-colors"
                >
                  <span className="text-4xl">{cat.emoji}</span>
                  <span className="font-display font-semibold text-foreground">{cat.name}</span>
                </motion.button>
              ))}
              {/* Random category */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: CATEGORIES.length * 0.08 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect(CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)])}
                className="flex flex-col items-center gap-2 bg-card border border-dashed border-accent/60 rounded-lg p-5 hover:border-accent transition-colors"
              >
                <span className="text-4xl">🎲</span>
                <span className="font-display font-semibold text-accent">Random!</span>
              </motion.button>
              {/* Custom words */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (CATEGORIES.length + 1) * 0.08 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCustomMode(true)}
                className="flex flex-col items-center gap-2 bg-card border border-dashed border-primary/60 rounded-lg p-5 hover:border-primary transition-colors"
              >
                <span className="text-4xl">✏️</span>
                <span className="font-display font-semibold text-primary">Custom Words</span>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="custom"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full space-y-4"
          >
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Pencil className="w-5 h-5 text-primary" />
                <h3 className="font-display font-semibold text-foreground">Custom Words</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter two similar words. Civilians get one, Impostors get the other!
              </p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-primary font-display mb-1 block">Civilian Word</label>
                  <Input
                    value={customCivilian}
                    onChange={e => setCustomCivilian(e.target.value)}
                    placeholder="e.g. Pizza"
                    className="bg-muted text-lg font-display"
                    maxLength={30}
                  />
                </div>
                <div>
                  <label className="text-xs text-secondary font-display mb-1 block">Impostor Word</label>
                  <Input
                    value={customImpostor}
                    onChange={e => setCustomImpostor(e.target.value)}
                    placeholder="e.g. Flatbread"
                    className="bg-muted text-lg font-display"
                    maxLength={30}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setCustomMode(false)}
                className="flex-1 font-display border-border text-muted-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button
                onClick={handleCustomSubmit}
                disabled={!customCivilian.trim() || !customImpostor.trim()}
                className="flex-1 font-display neon-glow-primary bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Play className="w-4 h-4 mr-2" /> Start!
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
