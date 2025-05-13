
import { useEffect, useState } from "react";

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return "dark";
    }
    
    return "light";
  });

  useEffect(() => {
    // Apply theme to document
    const root = window.document.documentElement;
    
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    
    // Save theme preference
    localStorage.setItem("theme", theme);
  }, [theme]);

  return {
    theme,
    setTheme,
    isDark: theme === "dark",
    toggleTheme: () => setTheme(prev => prev === "dark" ? "light" : "dark")
  };
}
