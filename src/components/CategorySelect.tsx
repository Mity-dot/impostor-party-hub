import { motion } from "framer-motion";
import { CATEGORIES, CategoryData } from "@/lib/gameData";

interface CategorySelectProps {
  onSelect: (category: CategoryData) => void;
}

export function CategorySelect({ onSelect }: CategorySelectProps) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-display font-bold text-secondary text-glow-secondary"
      >
        Pick a Category
      </motion.h2>
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
          className="flex flex-col items-center gap-2 bg-card border border-dashed border-accent/60 rounded-lg p-5 hover:border-accent transition-colors col-span-2"
        >
          <span className="text-4xl">🎲</span>
          <span className="font-display font-semibold text-accent">Random!</span>
        </motion.button>
      </div>
    </div>
  );
}
