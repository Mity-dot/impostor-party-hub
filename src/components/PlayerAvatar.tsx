import { motion } from "framer-motion";

interface PlayerAvatarProps {
  color: string;
  face: string;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
  className?: string;
}

const sizes = {
  sm: "w-10 h-10 text-lg",
  md: "w-16 h-16 text-3xl",
  lg: "w-24 h-24 text-5xl",
};

export function PlayerAvatar({ color, face, size = "md", animate = false, className = "" }: PlayerAvatarProps) {
  const Component = animate ? motion.div : "div";
  const props = animate ? { animate: { y: [0, -6, 0] }, transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } } : {};

  return (
    <Component
      {...(props as any)}
      className={`${sizes[size]} rounded-full flex items-center justify-center select-none ${className}`}
      style={{ backgroundColor: color, boxShadow: `0 0 20px ${color}40` }}
    >
      {face}
    </Component>
  );
}
