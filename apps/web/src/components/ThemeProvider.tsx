import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

export type AccentColor = {
  name: string;
  value: string;
  hsl: string;
};

export const ACCENT_COLORS: AccentColor[] = [
  { name: "Rose", value: "#e11d48", hsl: "342 85% 52%" },
  { name: "Orange", value: "#ea580c", hsl: "21 90% 48%" },
  { name: "Amber", value: "#d97706", hsl: "38 92% 44%" },
  { name: "Emerald", value: "#059669", hsl: "160 84% 31%" },
  { name: "Teal", value: "#0d9488", hsl: "174 72% 31%" },
  { name: "Cyan", value: "#0891b2", hsl: "189 94% 37%" },
  { name: "Blue", value: "#2563eb", hsl: "221 83% 53%" },
  { name: "Indigo", value: "#4f46e5", hsl: "243 75% 59%" },
  { name: "Violet", value: "#7c3aed", hsl: "262 83% 58%" },
  { name: "Purple", value: "#9333ea", hsl: "271 81% 56%" },
  { name: "Fuchsia", value: "#c026d3", hsl: "292 84% 48%" },
  { name: "Pink", value: "#db2777", hsl: "330 81% 50%" },
];

type ThemeProviderContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
};

const ThemeProviderContext = createContext<ThemeProviderContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "nexusai-theme",
  accentStorageKey = "nexusai-accent",
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  accentStorageKey?: string;
}) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    const stored = localStorage.getItem(accentStorageKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return ACCENT_COLORS[0];
      }
    }
    return ACCENT_COLORS[0];
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.style.setProperty("--primary", accentColor.hsl);
    root.style.setProperty("--ring", accentColor.hsl);
    root.style.setProperty("--sidebar-primary", accentColor.hsl);
    root.style.setProperty("--sidebar-ring", accentColor.hsl);
  }, [accentColor]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    accentColor,
    setAccentColor: (color: AccentColor) => {
      localStorage.setItem(accentStorageKey, JSON.stringify(color));
      setAccentColorState(color);
    },
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
