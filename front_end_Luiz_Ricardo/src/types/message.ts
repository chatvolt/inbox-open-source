export interface Message {
  id: string;
  text: string;
  from: "human" | "agent";
  createdAt: string;
  conversationId?: string; 
}