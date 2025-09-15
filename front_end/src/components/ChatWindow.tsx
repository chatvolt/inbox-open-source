import { Alert, Box, CircularProgress, Typography, TextField, IconButton, Chip, useTheme, Paper } from "@mui/material";
import { useEffect, useMemo, useRef, useState, UIEvent } from "react";
import useQuery from "@/hooks/useQuery";
import { Message } from "@/types/message";
import { Conversation } from "@/types/conversation";
import MessageBubble from "./MessageBubble";
import SendIcon from '@mui/icons-material/Send';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

interface ChatWindowProps {
  conversation: Conversation | null;
  isLoading: boolean;
  onMessagesLoaded: () => void;
}

interface MessagesApiResponse {
  messages: Message[];
}

const MESSAGES_PER_PAGE = 30;

function ChatWindow({ conversation, isLoading, onMessagesLoaded }: ChatWindowProps) {
  // Referências para controle de scroll
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  // Referência para o container de mensagens
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const theme = useTheme();

  const [data, error, loading, refetchMessages] = useQuery<MessagesApiResponse>(
    `messages-${conversation?.id}`,
    conversation?.id
      ? `http://localhost:3001/conversation/${conversation.id}/messages/10000`
      : "",
    { method: "GET" }
  );
  
  const messages = data?.messages;

  const [displayedMessagesCount, setDisplayedMessagesCount] = useState(MESSAGES_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [prevScrollHeight, setPrevScrollHeight] = useState<number | null>(null);

  // Chama onMessagesLoaded quando as mensagens terminam de carregar
  useEffect(() => {
    if (!loading) {
      onMessagesLoaded();
    }
  }, [loading, onMessagesLoaded]);

  const userIdentifier = () => {
    if (!conversation) return "";
    if (conversation.channel === "dashboard") {
      return conversation.aiUserIdentifier
        ? conversation.aiUserIdentifier
        : `VISITOR #${conversation.id.slice(-4).toUpperCase()}`;
    } else if (conversation.channel === "telegram") {
      return conversation.participantsContacts?.[0]?.firstName
        ? conversation.participantsContacts[0].firstName
        : `TELEGRAM USER #${conversation.id.slice(-4).toUpperCase()}`;
    }
    return `User ${conversation.id.slice(-4)}`;
  };

  const sortedMessages = useMemo(() => {
    if (!messages) {
      return [];
    }
    return [...messages].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messages]);

  const visibleMessages = useMemo(() => {
    if (sortedMessages.length === 0) return [];
    const startIndex = Math.max(0, sortedMessages.length - displayedMessagesCount);
    return sortedMessages.slice(startIndex);
  }, [sortedMessages, displayedMessagesCount]);

  // quando o ID da conversa muda. Isso garante que, ao abrir uma conversa diferente, a tela role automaticamente para a mensagem mais recente.
  useEffect(() => {
    setDisplayedMessagesCount(MESSAGES_PER_PAGE);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView();
    }, 100);
  }, [conversation?.id]);

  // Mantém a posição do scroll ao carregar mais mensagens antigas
  useEffect(() => {
    if (prevScrollHeight && scrollContainerRef.current) {
      const newScrollHeight = scrollContainerRef.current.scrollHeight;
      scrollContainerRef.current.scrollTop = newScrollHeight - prevScrollHeight;
      setPrevScrollHeight(null);
    }
  }, [prevScrollHeight, visibleMessages]);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const hasMoreMessages = displayedMessagesCount < sortedMessages.length;
    
    if (target.scrollTop === 0 && !loading && !isLoadingMore && hasMoreMessages) {
      setIsLoadingMore(true);
      setPrevScrollHeight(target.scrollHeight);

      setTimeout(() => {
        setDisplayedMessagesCount(prevCount => Math.min(prevCount + MESSAGES_PER_PAGE, sortedMessages.length));
        setIsLoadingMore(false);
      }, 500);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversation) return;
    try {
      await fetch(`http://localhost:3001/conversation/message/conversationId/${conversation.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newMessage,
          channel: conversation.channel, 
          agentId: conversation.agentId || undefined
        }),
      });
      setNewMessage('');
      setShowEmojiPicker(false);
      await refetchMessages();
      
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

    } catch (err) {
      console.error(err);
    }
  };
  
  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(prevInput => prevInput + emojiData.emoji);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // Renderiza o indicador de carregamento limpo e centralizado
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!conversation) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <Typography variant="h5" color="text.secondary">Selecione uma conversa para começar</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: 'hidden' }}>
      
      <Paper
        square
        elevation={0}
        sx={{
          py: 1.5,
          px: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          flexShrink: 0,
          textAlign: 'center',
        }}
      >
        <Typography variant="body1" fontWeight="bold">
          {userIdentifier()}
        </Typography>
      </Paper>

      <Box 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        sx={{ flexGrow: 1, overflowY: "auto", p: 2, position: 'relative' }}
      >
        {isLoadingMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {!conversation.isAiEnabled && (
          <Box sx={{ position: 'sticky', top: 8, zIndex: 10, textAlign: 'center', mb: 1 }}>
            <Chip
              icon={<SmartToyOutlinedIcon sx={{ color: 'inherit !important' }} />}
              label="AI OFF"
              size="small"
              sx={{
                fontWeight: 600,
                ...(theme.palette.mode === 'dark' ? {
                  backgroundColor: '#441414',
                  color: '#F4A7A7',
                  border: '1px solid #732424',
                } : {
                  backgroundColor: '#ffebee',
                  color: '#c62828',
                  border: '1px solid #ffcdd2',
                })
              }}
            />
          </Box>
        )}
        
        {error ? (
          <Alert severity="error">Falha ao carregar as mensagens: {error.message}</Alert>
        ) : visibleMessages && visibleMessages.length > 0 ? (
          visibleMessages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        ) : (
          <Typography sx={{ textAlign: "center", mt: 4 }}>Nenhuma mensagem nesta conversa ainda.</Typography>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {!conversation.isAiEnabled && (
        <Box sx={{ p: 1.5, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', position: 'relative', flexShrink: 0 }}>
          {showEmojiPicker && (
            <Box sx={{ position: 'absolute', bottom: '100%', mb: 1 }}>
              <EmojiPicker onEmojiClick={onEmojiClick} theme={theme.palette.mode} />
            </Box>
          )}
          <Paper
            elevation={2}
            sx={{ display: 'flex', alignItems: 'center', borderRadius: '99px', p: '4px 8px', bgcolor: 'background.paper' }}
          >
            <IconButton color="primary" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
              <SentimentSatisfiedAltIcon />
            </IconButton>
            <TextField
              fullWidth
              variant="standard"
              placeholder="Digite sua mensagem como agente..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              multiline
              maxRows={5}
              sx={{ mx: 1 }}
              InputProps={{ disableUnderline: true }}
            />
            <IconButton onClick={handleSendMessage} disabled={!newMessage.trim()} color="primary" aria-label="Enviar mensagem">
              <SendIcon />
            </IconButton>
          </Paper>
        </Box>
      )}
    </Box>
  );
}

export default ChatWindow;