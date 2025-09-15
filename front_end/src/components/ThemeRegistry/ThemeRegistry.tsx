"use client";
import * as React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import NextAppDirEmotionCacheProvider from "./EmotionCache";
import { getCustomTheme } from "@/theme/theme";
import { useThemeStore } from "@/store/themeStore";
import { useThemeConfigStore } from "@/store/themeConfigStore";

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();
  const { colors } = useThemeConfigStore();
  
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // O tema agora é recriado sempre que o modo (theme) ou as cores (colors) mudam.
  const muiTheme = React.useMemo(() => getCustomTheme(theme, colors), [theme, colors]);
  
  if (!isMounted) {
    return null;
  }

  // A 'key' no ThemeProvider não é mais necessária com o useMemo,
  // pois a recriação do muiTheme já dispara a atualização necessária.
  return (
    <NextAppDirEmotionCacheProvider options={{ key: "mui" }}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </NextAppDirEmotionCacheProvider>
  );
}