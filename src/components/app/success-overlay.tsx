"use client";

import { AnimatePresence, motion } from "framer-motion";

export function SuccessOverlay({
  emoji,
  visible,
}: {
  emoji: string;
  visible: boolean;
}) {
  const confetti = ["#6b7d5a", "#c9a227", "#86a262", "#dff0c2", "#e0b04a"];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="success-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="status"
          aria-live="polite"
        >
          {confetti.map((color, index) => (
            <i
              key={color}
              className="confetti"
              style={{
                left: `${24 + index * 13}%`,
                backgroundColor: color,
                animationDelay: `${index * 0.07}s`,
              }}
            />
          ))}
          <motion.div
            className="success-card"
            initial={{ opacity: 0, scale: 0.62 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 340, damping: 21 }}
          >
            <span className="success-ring" />
            <span className="success-emoji">{emoji}</span>
            <strong>Əla! Davam et 🔥</strong>
            <small>+1 minimal tamamlandı</small>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
