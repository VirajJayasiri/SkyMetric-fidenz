import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  theme: "light" | "dark";
  onToggle: () => void;
}

export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="theme-toggle-btn"
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <div className="theme-toggle-indicator">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="dark-sun"
              initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="theme-icon-wrap theme-icon-wrap--sun"
            >
              <Sun size={17} strokeWidth={2.4} />
            </motion.div>
          ) : (
            <motion.div
              key="light-moon"
              initial={{ rotate: 90, scale: 0.6, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="theme-icon-wrap theme-icon-wrap--moon"
            >
              <Moon size={17} strokeWidth={2.4} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <span className="theme-toggle-text">
        {isDark ? "Light Mode" : "Dark Mode"}
      </span>
    </button>
  );
}
