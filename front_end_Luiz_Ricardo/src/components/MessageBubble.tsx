import { Box, Paper, Typography, useTheme } from "@mui/material";
import { Message } from "@/types/message";

interface MessageBubbleProps {
  message: Message;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isAgent = message.from === "agent";
  const theme = useTheme();

  const bubbleColor = isAgent ? theme.palette.agentBubble : theme.palette.userBubble;

  const borderColor = () => {
    if (isAgent) {
      return theme.palette.mode === 'light' ? '#D9D1FF' : theme.palette.agentBubble.main;
    }
    
    if (theme.palette.mode === 'dark') {
      return '#2E2F30'; 
    } else {
      return theme.palette.divider;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        // ALTERADO: Invertida a lógica de alinhamento
        justifyContent: isAgent ? "flex-end" : "flex-start",
        mb: 2,
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          backgroundColor: bubbleColor.main,
          color: bubbleColor.contrastText,
          maxWidth: "75%",
          boxShadow: 'none',
          border: '1px solid',
          borderColor: borderColor(),
          // ALTERADO: Invertida a lógica do borderRadius para corresponder ao alinhamento
          borderRadius: isAgent 
            ? "20px 4px 20px 20px" // Estilo para a direita
            : "4px 20px 20px 20px", // Estilo para a esquerda
        }}
      >
        <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
          {message.text}
        </Typography>
        <Typography
          variant="caption"
          sx={{ 
            display: "block", 
            textAlign: "right", 
            mt: 0.5, 
            opacity: 0.7 
          }}
        >
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Typography>
      </Paper>
    </Box>
  );
}

export default MessageBubble;