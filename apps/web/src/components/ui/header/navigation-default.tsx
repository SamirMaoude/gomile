"use client";

import { useEffect, useState } from "react";
import Navigation from "./navigation";

type ThemeMode = "light" | "dark";

export default function NavigationDefault() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const storedTheme = window.localStorage.getItem("dashboardTheme");
    return storedTheme === "light" || storedTheme === "dark"
      ? storedTheme
      : "light";
  });

  useEffect(() => {
    window.localStorage.setItem("dashboardTheme", theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  return (
    <Navigation
      theme={theme}
      isDarkMode={theme === "dark"}
      onChange={setTheme}
    />
  );
}
