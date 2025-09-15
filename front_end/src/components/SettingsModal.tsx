import { useThemeConfigStore } from "@/store/themeConfigStore";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Save, Check, Trash2 } from 'lucide-react'; // Ícones para ações

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const SettingsModal = ({ open, onClose }: SettingsModalProps) => {
  const {
    appName: globalAppName,
    logoUrl: globalLogoUrl,
    colors: globalColors,
    savedThemes, 
    setAppName,
    setLogoUrl,
    setColors,
    resetToDefaults,
    saveCurrentTheme,  
    applySavedTheme,
    deleteSavedTheme,
  } = useThemeConfigStore();

  const [localAppName, setLocalAppName] = useState(globalAppName);
  const [localLogoUrl, setLocalLogoUrl] = useState(globalLogoUrl);
  const [localColors, setLocalColors] = useState(globalColors);
  const [newThemeName, setNewThemeName] = useState(""); 
  
  const [colorInputKey, setColorInputKey] = useState(0);

  useEffect(() => {
    if (open) {
      setLocalAppName(globalAppName);
      setLocalLogoUrl(globalLogoUrl);
      setLocalColors(globalColors);
      setColorInputKey(prev => prev + 1);
    }
  }, [open, globalAppName, globalLogoUrl, globalColors]);

  const handleApplyChanges = () => {
    setAppName(localAppName);
    setLogoUrl(localLogoUrl);
    setColors(localColors);
  };
  
  const handleColorChange = (mode: 'light' | 'dark', key: string, value: string) => {
    setLocalColors(prev => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        [key]: value,
      },
    }));
  };

  const handleReset = () => {
    resetToDefaults();
    const defaults = useThemeConfigStore.getState();
    setLocalAppName(defaults.appName);
    setLocalLogoUrl(defaults.logoUrl);
    setLocalColors(defaults.colors);
    setColorInputKey(prev => prev + 1);
  };

  // ALTERADO: Garante que os valores locais de nome e logo sejam aplicados antes de salvar
  const handleSaveTheme = () => {
    if (newThemeName.trim()) {
      // Primeiro, aplica todas as mudanças locais ao estado global
      setAppName(localAppName);
      setLogoUrl(localLogoUrl);
      setColors(localColors);
      
      // Então, salva o estado global (agora atualizado) como um novo tema
      saveCurrentTheme(newThemeName.trim());
      setNewThemeName(""); // Limpa o campo
    }
  };

  // ALTERADO: Ao aplicar um tema, os estados locais também são atualizados para refletir a mudança
  const handleApplyTheme = (name: string) => {
    applySavedTheme(name);
    const appliedTheme = useThemeConfigStore.getState().savedThemes.find(t => t.name === name);
    if (appliedTheme) {
      setLocalAppName(appliedTheme.appName);
      setLocalLogoUrl(appliedTheme.logoUrl);
      setLocalColors(appliedTheme.colors);
    }
  };
  
  const renderColorInputs = (mode: 'light' | 'dark') => {
    return Object.entries(localColors[mode]).map(([key, value]) => (
      <Grid item xs={6} sm={4} key={`${mode}-${key}-${colorInputKey}`}>
        <TextField
          fullWidth
          label={`${key.charAt(0).toUpperCase() + key.slice(1)}`}
          type="color"
          defaultValue={value}
          onBlur={(e) => handleColorChange(mode, key, e.target.value)}
          variant="filled"
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
    ));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Personalizar Aparência</DialogTitle>
      <DialogContent dividers>
        {/* Seção de Identidade */}
        <Typography variant="h6" gutterBottom>Identidade</Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nome da Aplicação"
              value={localAppName}
              onChange={(e) => setLocalAppName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="URL do Logo (opcional)"
              value={localLogoUrl}
              onChange={(e) => setLocalLogoUrl(e.target.value)}
            />
          </Grid>
        </Grid>
        
        {/* Seção de Gerenciamento de Temas */}
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>Gerenciar Temas</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            label="Nome do Novo Tema"
            value={newThemeName}
            onChange={(e) => setNewThemeName(e.target.value)}
            variant="outlined"
            size="small"
          />
          <Button
            variant="contained"
            onClick={handleSaveTheme}
            disabled={!newThemeName.trim()}
            startIcon={<Save />}
          >
            Salvar
          </Button>
        </Box>
        <List dense>
          {savedThemes.map((theme) => (
            <ListItem key={theme.name} divider>
              <ListItemText primary={theme.name} secondary={`App: ${theme.appName}`} />
              <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="apply" onClick={() => handleApplyTheme(theme.name)} title="Aplicar Tema">
                  <Check />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => deleteSavedTheme(theme.name)} title="Deletar Tema">
                  <Trash2 />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 2 }} />

        {/* Seção de Edição de Cores */}
        <Typography variant="h6" gutterBottom>Cores do Tema Claro</Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {renderColorInputs('light')}
        </Grid>

        <Typography variant="h6" gutterBottom>Cores do Tema Escuro</Typography>
        <Grid container spacing={2}>
          {renderColorInputs('dark')}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset} color="error">
          Restaurar Padrões
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={handleApplyChanges} variant="outlined">
          Aplicar
        </Button>
        <Button onClick={onClose} variant="contained">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsModal;