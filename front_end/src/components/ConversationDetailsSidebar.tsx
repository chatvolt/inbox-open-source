import { useState, useEffect } from 'react';
import { Conversation } from '@/types/conversation';
import {
  Box,
  Typography,
  MenuItem,
  Paper,
  Button,
  IconButton,
  SelectChangeEvent,
  useTheme,
  TextField,
  Chip,
  InputAdornment,
  Divider,
  Collapse,
  Menu,
} from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import DeleteIcon from '@mui/icons-material/Delete';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import React from 'react';

import { useTagStore } from '@/store/tagStore';

interface ConversationDetailsSidebarProps {
  conversation: Conversation;
  onConversationUpdate: (
    conversationId: string,
    updates: Partial<Conversation>
  ) => void;
  onClose?: () => void;
}

// Estruturas de dados para os seletores
interface SelectorOption {
  value: string;
  label: string;
  color: string;
}

const statusOptions: SelectorOption[] = [
  { value: 'UNRESOLVED', label: 'Não Resolvida', color: 'error.main' },
  { value: 'RESOLVED', label: 'Resolvida', color: 'success.main' },
  { value: 'HUMAN_REQUESTED', label: 'Solicitação Humana', color: 'warning.main' },
];

const priorityOptions: SelectorOption[] = [
  { value: 'LOW', label: 'Baixa', color: 'info.main' },
  { value: 'MEDIUM', label: 'Média', color: 'warning.main' },
  { value: 'HIGH', label: 'Alta', color: 'error.main' },
];

// Componente reutilizável e moderno para seleção
interface StatusSelectorProps {
  label: string;
  value: string;
  options: SelectorOption[];
  onChange: (newValue: string) => void;
}

const StatusSelector: React.FC<StatusSelectorProps> = ({ label, value, options, onChange }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const selectedOption = options.find(opt => opt.value === value) || options[0];

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (newValue: string) => {
    onChange(newValue);
    handleClose();
  };

  return (
    <Box>
      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1, color: 'text.secondary' }}>
        {label}
      </Typography>
      <Button
        fullWidth
        variant="outlined"
        onClick={handleClick}
        endIcon={<UnfoldMoreIcon />}
        sx={{
          justifyContent: 'flex-start',
          textTransform: 'none',
          borderColor: theme.palette.divider,
          color: 'text.primary',
          '&:hover': {
            borderColor: theme.palette.text.secondary,
            backgroundColor: theme.palette.action.hover,
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircleIcon sx={{ fontSize: 14, color: selectedOption.color }} />
          <Typography variant="body2">{selectedOption.label}</Typography>
        </Box>
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose} MenuListProps={{ sx: { width: anchorEl?.clientWidth } }}>
        {options.map(option => (
          <MenuItem key={option.value} onClick={() => handleSelect(option.value)}>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircleIcon sx={{ fontSize: 14, color: option.color }} />
                <Typography variant="body2">{option.label}</Typography>
              </Box>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};


const ConversationDetailsSidebar = ({
  conversation,
  onConversationUpdate,
  onClose,
}: ConversationDetailsSidebarProps) => {
  const [status, setStatus] = useState(conversation.status);
  const [priority, setPriority] = useState(conversation.priority);
  const [isAiEnabled, setIsAiEnabled] = useState(conversation.isAiEnabled);
  const theme = useTheme();
  const { tagsByConversationId, addTag, removeTag } = useTagStore();
  const tags = tagsByConversationId[conversation.id] || [];
  const [newTag, setNewTag] = useState('');
  const [expandedVariable, setExpandedVariable] = useState<string | null>(null);

  useEffect(() => {
    setStatus(conversation.status);
    setPriority(conversation.priority);
    setIsAiEnabled(conversation.isAiEnabled);
  }, [conversation]);

  const handleToggleExpand = (varName: string) => {
    setExpandedVariable(prev => (prev === varName ? null : varName));
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      addTag(conversation.id, newTag.trim());
      setNewTag('');
    }
  };

  const handleTagKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleAddTag();
    }
  };

  const handleToggleAi = async () => {
    const originalAiStatus = isAiEnabled;
    const newAiStatus = !originalAiStatus;
    setIsAiEnabled(newAiStatus);

    try {
      const response = await fetch(
        `http://localhost:3001/conversations/${conversation.id}/set-ai-enabled`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled: newAiStatus }),
        }
      );
      if (!response.ok) throw new Error('Failed to update AI status');
      onConversationUpdate(conversation.id, { isAiEnabled: newAiStatus }); 
    } catch (error) {
      console.error("Failed to toggle AI status:", error);
      setIsAiEnabled(originalAiStatus);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    const originalStatus = status;
    setStatus(newStatus as any);
    try {
      const response = await fetch(
        `http://localhost:3001/conversations/${conversation.id}/set-status`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!response.ok) throw new Error('Failed to update status');
      onConversationUpdate(conversation.id, { status: newStatus as any });
    } catch (error) {
      console.error(error);
      setStatus(originalStatus);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    const originalPriority = priority;
    setPriority(newPriority as any);
    try {
      const response = await fetch(
        `http://localhost:3001/conversations/${conversation.id}/set-priority`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priority: newPriority }),
        }
      );
      if (!response.ok) throw new Error('Failed to update priority');
      onConversationUpdate(conversation.id, { priority: newPriority as any });
    } catch (error) {
      console.error(error);
      setPriority(originalPriority);
    }
  };

  const handleVariableDelete = async (varName: string) => {
    const originalVariables = conversation.conversationVariables || [];
    const newVariables = originalVariables.filter((v) => v.varName !== varName);
    onConversationUpdate(conversation.id, {
      conversationVariables: newVariables,
    });

    try {
      const response = await fetch(
        `http://localhost:3001/variables/${conversation.id}/${varName}`,
        {
          method: 'DELETE',
        }
      );
      if (!response.ok) throw new Error('Failed to delete variable');
    } catch (error) {
      console.error(error);
      onConversationUpdate(conversation.id, {
        conversationVariables: originalVariables,
      });
    }
  };

  const SectionTitle = ({ children, sx = {} }: { children: React.ReactNode, sx?: object }) => (
    <Typography variant="body2" fontWeight="medium" sx={{ mb: 1, color: 'text.secondary', px: 2, pt: 1.5, ...sx }}>
      {children}
    </Typography>
  );

  return (
    <Paper
      elevation={0}
      sx={{
        width: 322,
        flexShrink: 0,
        height: '100%',
        borderLeft: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        gap: 3,
        // ALTERADO: Cor de fundo agora usa 'background.paper'
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, flexGrow: 1, overflowY: 'auto', pr: 1 }}>
        {onClose && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Detalhes</Typography>
            <IconButton onClick={onClose} aria-label="Fechar detalhes">
              <CloseIcon />
            </IconButton>
          </Box>
        )}

        <Button
          fullWidth
          variant="contained"
          onClick={handleToggleAi}
          startIcon={isAiEnabled ? <ForumOutlinedIcon /> : <SmartToyOutlinedIcon />}
          sx={isAiEnabled ? (
            theme.palette.mode === 'dark' ? {
              backgroundColor: '#441414', color: '#F4A7A7', border: '1px solid #732424',
              '&:hover': { backgroundColor: '#5C1A1A', borderColor: '#8B2D2D' },
            } : {
              backgroundColor: '#ffebee', color: '#c62828',
              '&:hover': { backgroundColor: '#ffcdd2' },
            }
          ) : {
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': { backgroundColor: 'primary.dark' },
          }}
        >
          {isAiEnabled ? 'Intervir' : 'Reativar IA'}
        </Button>

        {/* --- SEÇÃO DE ETIQUETAS --- */}
        <Box>
          <SectionTitle sx={{ px: 0 }}>Etiquetas</SectionTitle>
          {tags.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Não possui etiqueta.
            </Typography>
          )}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {tags.map((tag) => (
              <Chip key={tag} label={tag} onDelete={() => removeTag(conversation.id, tag)} size="small" />
            ))}
          </Box>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Adicionar ou pesquisar etiquetas..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleTagKeyDown}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleAddTag} edge="end">
                    <AddCircleOutlineIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* --- SEÇÃO DE STATUS E PRIORIDADE --- */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: '150px' }}>
                <StatusSelector 
                    label="Status"
                    value={status}
                    options={statusOptions}
                    onChange={handleStatusChange}
                />
            </Box>
            <Box sx={{ flex: 1, minWidth: '120px' }}>
                <StatusSelector 
                    label="Prioridade"
                    value={priority}
                    options={priorityOptions}
                    onChange={handlePriorityChange}
                />
            </Box>
        </Box>
        
        {/* --- SEÇÃO DE VARIÁVEIS --- */}
        {conversation.conversationVariables && conversation.conversationVariables.length > 0 && (
          <Paper variant="outlined" sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
              <SectionTitle>Variáveis da Conversa</SectionTitle>
              {conversation.conversationVariables.map((variable, index) => {
                const isExpanded = expandedVariable === variable.varName;
                return (
                  <React.Fragment key={variable.varName}>
                      <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          py: 1,
                          px: 2,
                      }}>
                          <Box 
                            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', overflow: 'hidden', flexGrow: 1, mr: 1 }}
                            onClick={() => handleToggleExpand(variable.varName)}
                          >
                              <Typography variant="body2" color="text.secondary" noWrap sx={{ mr: 0.5 }}>
                                {variable.varName}
                              </Typography>
                              {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowUpIcon />}
                          </Box>
                          <IconButton size="small" onClick={() => handleVariableDelete(variable.varName)} title={`Deletar ${variable.varName}`}>
                              <DeleteIcon sx={{ fontSize: '1.2rem', color: 'error.main' }} />
                          </IconButton>
                      </Box>
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ px: 2, pb: 1.5 }}>
                              <Typography 
                                variant="body1" 
                                sx={{ wordBreak: 'break-word' }}
                              >
                                {variable.varValue || "não tem"}
                              </Typography>
                          </Box>
                      </Collapse>
                      {conversation.conversationVariables && index < conversation.conversationVariables.length - 1 && <Divider />}
                  </React.Fragment>
                )
              })}
          </Paper>
        )}
      </Box>
    </Paper>
  );
};

export default ConversationDetailsSidebar;