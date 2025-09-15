import {
  Avatar,
  Box,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Typography,
  Tooltip,
} from "@mui/material";
import { Conversation } from "@/types/conversation";
import { Globe, User, Info, MessageSquare, Code } from 'lucide-react'; 
import Image from 'next/image';

const channelIcons: { [key: string]: React.ReactNode } = {
  whatsapp: <Image src="/icons-whatsapp.svg" alt="WhatsApp Icon" width={24} height={24} />,
  zapi: <Image src="/z-api-icon.png" alt="Z-API Icon" width={24} height={24} />,
  instagram: <Image src="/instagram-icon.svg" alt="Instagram Icon" width={24} height={24} />,
  instagramDm: <Image src="/instagram-dm-icon.webp" alt="Instagram DM Icon" width={24} height={24} />,
  telegram: <Image src="/telegram-icon.svg" alt="Telegram Icon" width={24} height={24} />,
  api: <Code size={24} />,
  dashboard: <MessageSquare size={24} />, 
  website: <Globe size={24} />, 
  default: <User size={24} />,
};

interface ConversationListItemProps {
  conversation: Conversation;
  onSelect: (id: string) => void;
  selected: boolean;
}

function ConversationListItem({ conversation, onSelect, selected }: ConversationListItemProps) {
  // Lógica de identificação do usuário atualizada
  const userIdentifier = () => {
    // 1. Tenta usar o identificador da IA primeiro.
    if (conversation.aiUserIdentifier) {
      return conversation.aiUserIdentifier;
    }
    // 2. Se não houver, tenta usar o nome do primeiro participante.
    if (conversation.participantsContacts?.[0]?.firstName) {
      return conversation.participantsContacts[0].firstName;
    }
    // 3. Como último recurso, gera um ID genérico.
    const channelName = conversation.channel ? conversation.channel.toUpperCase() : 'USER';
    return `${channelName} #${conversation.id.slice(-4).toUpperCase()}`;
  };

  const hasContext = 
    conversation.conversationContexts && 
    conversation.conversationContexts.length > 0 && 
    conversation.conversationContexts[0].context;

  const contextText = hasContext ? conversation.conversationContexts?.[0]?.context : "";

  return (
    <ListItem disablePadding>
      <ListItemButton
        selected={selected}
        onClick={() => onSelect(conversation.id)}
      >
        <ListItemAvatar>
          <Avatar sx={{ bgcolor: 'transparent', color: 'primary.main' }}>
            {channelIcons[conversation.channel] || channelIcons.default}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography component="span" variant="body1" color="text.primary" noWrap>
                {userIdentifier()}
              </Typography>
              {hasContext && (
                <Tooltip 
                  title={contextText}
                  arrow
                  componentsProps={{
                    tooltip: { sx: { whiteSpace: 'pre-line' } },
                  }}
                >
                  <Info size={16} style={{ color: 'var(--mui-palette-text-secondary)', cursor: 'pointer' }} />
                </Tooltip>
              )}
            </Box>
          }
          secondary={
            <Typography
              sx={{ display: "inline" }}
              component="span"
              variant="body2"
              color="text.secondary"
            >
              {new Date(conversation.createdAt).toLocaleString()}
            </Typography>
          }
        />
      </ListItemButton>
    </ListItem>
  );
}

export default ConversationListItem;