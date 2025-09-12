import {
  Badge,
  Box,
  IconButton,
  InputAdornment,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Typography,
  useTheme,
  LinearProgress, // Importado para a barra de carregamento
} from "@mui/material";
import { Search, Filter } from 'lucide-react';
import { useState } from "react"; 

export interface FiltersState {
  sortBy: 'newest' | 'oldest';
  channel: string;
  priority: 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'ALL' | 'UNRESOLVED' | 'RESOLVED' | 'HUMAN_REQUESTED';
  tag: string;
}

interface ConversationFiltersProps {
  filters: FiltersState;
  onFiltersChange: (newFilters: Partial<FiltersState>) => void;
  onSearchSubmit: (searchTerm: string) => void;
  channelOptions: string[];
  tagOptions: string[];
  isAdvancedFilterActive: boolean;
  isFiltering: boolean; // Nova propriedade para o estado de carregamento
  counts?: {
    HUMAN_REQUESTED: number;
    UNRESOLVED: number;
  };
}

const priorityLabels: Record<string, string> = {
  ALL: 'Todas',
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
};

const ConversationFilters = ({
  filters,
  onFiltersChange,
  onSearchSubmit,
  channelOptions,
  tagOptions,
  isAdvancedFilterActive,
  isFiltering, // Desestruturada
  counts
}: ConversationFiltersProps) => {
  const [searchText, setSearchText] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();

  const toggleButtonSx = {
    py: 0.25,
    px: 1.5,
    fontSize: '0.875rem',
    height: '30px',
    borderRadius: '16px !important',
    textTransform: 'none',
    border: `1px solid ${theme.palette.divider} !important`,
    color: 'text.secondary',
    backgroundColor: 'transparent',
    marginLeft: '0 !important',
    '&:not(.Mui-selected):hover': {
      backgroundColor: 'action.hover',
    },
    '&.Mui-selected': {
      color: 'primary.main',
      borderColor: `${theme.palette.primary.main} !important`,
      backgroundColor: `${theme.palette.primary.main}1A`,
      '&:hover': {
        backgroundColor: `${theme.palette.primary.main}26`,
      }
    },
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      onSearchSubmit(searchText);
    }
  };

  const handleSubmitClick = () => {
    onSearchSubmit(searchText);
  };

  const handleStatusFilterChange = (event: React.MouseEvent<HTMLElement>, newValue: string | null) => {
    if (newValue) {
      onFiltersChange({ status: newValue as FiltersState['status'] });
    }
  };
  
  const handleResetFilters = () => {
    onFiltersChange({
      sortBy: 'newest',
      channel: 'ALL',
      priority: 'ALL',
      tag: 'ALL',
    });
    handleCloseMenu();
  };

  return (
    <Box sx={{ p: 2, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', position: 'relative' }}>
       {isFiltering && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, width: '100%' }} />}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Pesquisar"
          value={searchText}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconButton onClick={handleSubmitClick} edge="start">
                  <Search size={20} />
                </IconButton>
              </InputAdornment>
            ),
            sx: { 
              borderRadius: '8px', 
              bgcolor: 'background.default',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'divider',
              },
            }
          }}
        />
        <IconButton onClick={handleOpenMenu} color={isAdvancedFilterActive ? 'primary' : 'default'}>
          <Badge color="primary" variant="dot" invisible={!isAdvancedFilterActive}>
            <Filter size={24} />
          </Badge>
        </IconButton>
      </Box>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        MenuListProps={{ 'aria-labelledby': 'basic-button' }}
        PaperProps={{ sx: { p: 2, width: 300 } }}
      >
        <Typography variant="subtitle1" sx={{ mb: 2 }}>Filtros Avançados</Typography>
        <MenuItem>
          <FormControl fullWidth size="small">
            <InputLabel>Ordenar por</InputLabel>
            <Select
              value={filters.sortBy}
              label="Ordenar por"
              onChange={(e) => onFiltersChange({ sortBy: e.target.value as FiltersState['sortBy'] })}
            >
              <MenuItem value="newest">Mais Recentes</MenuItem>
              <MenuItem value="oldest">Mais Antigas</MenuItem>
            </Select>
          </FormControl>
        </MenuItem>
        <MenuItem>
          <FormControl fullWidth size="small">
            <InputLabel>Canal</InputLabel>
            <Select
              value={filters.channel}
              label="Canal"
              onChange={(e) => onFiltersChange({ channel: e.target.value })}
            >
              <MenuItem value="ALL">Todos os Canais</MenuItem>
              {channelOptions.map(channel => (
                <MenuItem key={channel} value={channel}>{channel}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </MenuItem>
        <MenuItem>
          <FormControl fullWidth size="small">
            <InputLabel>Prioridade</InputLabel>
            <Select
              value={filters.priority}
              label="Prioridade"
              onChange={(e) => onFiltersChange({ priority: e.target.value as FiltersState['priority'] })}
            >
              {Object.entries(priorityLabels).map(([key, label]) => (
                <MenuItem key={key} value={key}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </MenuItem>
        <MenuItem>
          <FormControl fullWidth size="small">
            <InputLabel>Etiqueta</InputLabel>
            <Select
              value={filters.tag}
              label="Etiqueta"
              onChange={(e) => onFiltersChange({ tag: e.target.value })}
            >
              <MenuItem value="ALL">Todas as Etiquetas</MenuItem>
              {tagOptions.map(tag => (
                <MenuItem key={tag} value={tag}>{tag}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </MenuItem>
        <Box sx={{ mt: 2, textAlign: 'right' }}>
          <Button onClick={handleResetFilters}>Limpar Filtros</Button>
        </Box>
      </Menu>

      <ToggleButtonGroup
        value={filters.status}
        exclusive
        onChange={handleStatusFilterChange}
        aria-label="Filtros de conversa"
        sx={{ mt: 2, width: '100%', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}
      >
        <ToggleButton value="ALL" aria-label="todas" sx={toggleButtonSx}>
          Todas
        </ToggleButton>
        <ToggleButton value="UNRESOLVED" aria-label="não resolvidas" sx={toggleButtonSx}>
          <Badge badgeContent={counts ? counts.UNRESOLVED : 0} color="error">
            Não Resolvidas
          </Badge>
        </ToggleButton>
        <ToggleButton value="HUMAN_REQUESTED" aria-label="humano solicitado" sx={toggleButtonSx}>
          <Badge badgeContent={counts ? counts.HUMAN_REQUESTED : 0} color="warning">
            Humano Solicitado
          </Badge>
        </ToggleButton>
        <ToggleButton value="RESOLVED" aria-label="resolvidas" sx={toggleButtonSx}>
          Resolvidas
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default ConversationFilters;