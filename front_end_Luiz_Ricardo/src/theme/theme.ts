import { createTheme, PaletteMode } from "@mui/material";

declare module '@mui/material/styles' {
  interface Palette {
    userBubble: Palette['primary'];
    agentBubble: Palette['primary'];
  }
  interface PaletteOptions {
    userBubble?: PaletteOptions['primary'];
    agentBubble?: PaletteOptions['primary'];
  }
}

const shadows: any = [
  "none",
  "0px 2px 4px -1px rgba(0,0,0,0.06), 0px 4px 5px 0px rgba(0,0,0,0.04), 0px 1px 10px 0px rgba(0,0,0,0.03)",
  "0px 3px 5px -1px rgba(0,0,0,0.06), 0px 5px 8px 0px rgba(0,0,0,0.04), 0px 1px 14px 0px rgba(0,0,0,0.03)",
  "0px 3px 5px -1px rgba(0,0,0,0.06), 0px 6px 10px 0px rgba(0,0,0,0.04), 0px 1px 18px 0px rgba(0,0,0,0.03)",
  "0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)",
  "0px 3px 5px -1px rgba(0,0,0,0.2), 0px 5px 8px 0px rgba(0,0,0,0.14), 0px 1px 14px 0px rgba(0,0,0,0.12)",
  "0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12)",
  "0px 4px 5px -2px rgba(0,0,0,0.2), 0px 7px 10px 1px rgba(0,0,0,0.14), 0px 2px 16px 1px rgba(0,0,0,0.12)",
  "0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)",
  "0px 5px 6px -3px rgba(0,0,0,0.2), 0px 9px 12px 1px rgba(0,0,0,0.14), 0px 3px 16px 2px rgba(0,0,0,0.12)",
  "0px 6px 6px -3px rgba(0,0,0,0.2), 0px 10px 14px 1px rgba(0,0,0,0.14), 0px 4px 18px 3px rgba(0,0,0,0.12)",
  "0px 6px 7px -4px rgba(0,0,0,0.2), 0px 11px 15px 1px rgba(0,0,0,0.14), 0px 4px 20px 3px rgba(0,0,0,0.12)",
  "0px 7px 8px -4px rgba(0,0,0,0.2), 0px 12px 17px 2px rgba(0,0,0,0.14), 0px 5px 22px 4px rgba(0,0,0,0.12)",
  "0px 7px 8px -4px rgba(0,0,0,0.2), 0px 13px 19px 2px rgba(0,0,0,0.14), 0px 5px 24px 4px rgba(0,0,0,0.12)",
  "0px 7px 9px -4px rgba(0,0,0,0.2), 0px 14px 21px 2px rgba(0,0,0,0.14), 0px 5px 26px 4px rgba(0,0,0,0.12)",
  "0px 8px 9px -5px rgba(0,0,0,0.2), 0px 15px 22px 2px rgba(0,0,0,0.14), 0px 6px 28px 5px rgba(0,0,0,0.12)",
  "0px 8px 10px -5px rgba(0,0,0,0.2), 0px 16px 24px 2px rgba(0,0,0,0.14), 0px 6px 30px 5px rgba(0,0,0,0.12)",
  "0px 8px 11px -5px rgba(0,0,0,0.2), 0px 17px 26px 2px rgba(0,0,0,0.14), 0px 6px 32px 5px rgba(0,0,0,0.12)",
  "0px 9px 11px -5px rgba(0,0,0,0.2), 0px 18px 28px 2px rgba(0,0,0,0.14), 0px 7px 34px 6px rgba(0,0,0,0.12)",
  "0px 9px 12px -6px rgba(0,0,0,0.2), 0px 19px 29px 2px rgba(0,0,0,0.14), 0px 7px 36px 6px rgba(0,0,0,0.12)",
  "0px 10px 13px -6px rgba(0,0,0,0.2), 0px 20px 31px 3px rgba(0,0,0,0.14), 0px 8px 38px 7px rgba(0,0,0,0.12)",
  "0px 10px 13px -6px rgba(0,0,0,0.2), 0px 21px 33px 3px rgba(0,0,0,0.14), 0px 8px 40px 7px rgba(0,0,0,0.12)",
  "0px 10px 14px -6px rgba(0,0,0,0.2), 0px 22px 35px 3px rgba(0,0,0,0.14), 0px 8px 42px 7px rgba(0,0,0,0.12)",
  "0px 11px 14px -7px rgba(0,0,0,0.2), 0px 23px 36px 3px rgba(0,0,0,0.14), 0px 9px 44px 8px rgba(0,0,0,0.12)",
  "0px 11px 15px -7px rgba(0,0,0,0.2), 0px 24px 38px 3px rgba(0,0,0,0.14), 0px 9px 46px 8px rgba(0,0,0,0.12)"
];

export const getCustomTheme = (mode: PaletteMode, colors: any) => {
  const currentColors = colors[mode]; 

  return createTheme({
    shadows: shadows,
    palette: {
      mode,
      ...(mode === 'dark' ? {
        primary: { main: currentColors.primary },
        background: { default: currentColors.background, paper: currentColors.paper },
        text: { primary: currentColors.textPrimary, secondary: currentColors.textSecondary },
        userBubble: { main: currentColors.userBubbleBg, contrastText: currentColors.userBubbleText },
        agentBubble: { main: currentColors.agentBubbleBg, contrastText: currentColors.agentBubbleText },
        divider: 'rgba(127, 90, 240, 0.2)',
      } : {
        primary: { main: currentColors.primary },
        background: { default: currentColors.background, paper: currentColors.paper },
        text: { primary: currentColors.textPrimary, secondary: currentColors.textSecondary },
        userBubble: { main: currentColors.userBubbleBg, contrastText: currentColors.userBubbleText },
        agentBubble: { main: currentColors.agentBubbleBg, contrastText: currentColors.agentBubbleText },
        divider: 'rgba(0, 0, 0, 0.12)',
      }),
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      ...(mode === 'dark' && {
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundColor: currentColors.paper,
              boxShadow: 'none',
            }
          }
        },
        MuiListItemButton: {
          styleOverrides: {
            root: {
              '&.Mui-selected': {
                backgroundColor: `${currentColors.primary}1A`, // Fundo sutil
                // Borda com gradiente para replicar o "glow" da imagem
                borderLeft: `3px solid transparent`,
                borderImage: `linear-gradient(to bottom, ${currentColors.primary}, transparent) 1`,
                '&:hover': {
                  backgroundColor: `${currentColors.primary}26`,
                },
              },
            },
          },
        },
        MuiToggleButton: {
          styleOverrides: {
            root: {
              border: 'none',
              textTransform: 'none',
              // Estilo do botão de filtro selecionado como na imagem
              '&.Mui-selected': {
                backgroundColor: currentColors.primary,
                color: currentColors.textPrimary,
                '&:hover': {
                  backgroundColor: `${currentColors.primary}CC`,
                },
              },
            },
          },
        },
      }),
    },
  });
};