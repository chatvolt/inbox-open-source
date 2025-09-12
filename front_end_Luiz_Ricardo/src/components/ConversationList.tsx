import {
  Alert,
  Box,
  CircularProgress,
  List,
  Typography,
} from "@mui/material";
import { Conversation } from "@/types/conversation";
import ConversationListItem from "./ConversationListItem";

interface ConversationListProps {
  data?: Conversation[];
  error: Error | null;
  loading: boolean;
  onSelectConversation: (id: string) => void;
  selectedConversationId: string | null;
}

function ConversationList({
  data,
  error,
  loading,
  onSelectConversation,
  selectedConversationId,
}: ConversationListProps) {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error.message}
      </Alert>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Typography variant="body1" sx={{ mt: 4, textAlign: "center" }}>
        Nenhuma conversa encontrada.
      </Typography>
    );
  }

  return (
    <List sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1 }}>
      {data.map((conversation) => (
        <ConversationListItem
          key={conversation.id}
          conversation={conversation}
          onSelect={onSelectConversation}
          selected={selectedConversationId === conversation.id}
        />
      ))}
    </List>
  );
}

export default ConversationList;