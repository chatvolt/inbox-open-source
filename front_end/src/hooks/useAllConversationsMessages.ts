import { useQuery } from '@tanstack/react-query'
import { useConversationsList } from './useConversationsList'
import { type Message, type ConversationMessagesResponse } from '@/components/CardConversation/types'

interface MessageWithConversation extends Message {
  conversationInfo: {
    id: string
    channel: string
    status: string
    priority: string
    agentId: string
    participantsContacts?: Array<{ firstName: string }>
    aiUserIdentifier?: string
  }
}

// Função para buscar mensagens de uma conversa específica
async function fetchConversationMessages(conversationId: string): Promise<Message[]> {
  const response = await fetch(`http://localhost:3001/conversation/${conversationId}/messages/50`)
  if (!response.ok) {
    console.warn(`Failed to fetch messages for conversation ${conversationId}`)
    return []
  }
  const data: ConversationMessagesResponse = await response.json()
  return data.messages || []
}

// Função para buscar todas as mensagens de todas as conversas
async function fetchAllConversationsMessages(conversations: any[]): Promise<MessageWithConversation[]> {
  if (!conversations || conversations.length === 0) return []

  const allMessages: MessageWithConversation[] = []

  // Buscar mensagens de cada conversa em paralelo
  const messagePromises = conversations.map(async (conversation) => {
    try {
      const messages = await fetchConversationMessages(conversation.id)
      return messages.map(message => ({
        ...message,
        conversationInfo: {
          id: conversation.id,
          channel: conversation.channel,
          status: conversation.status,
          priority: conversation.priority,
          agentId: conversation.agentId,
          participantsContacts: conversation.participantsContacts,
          aiUserIdentifier: conversation.aiUserIdentifier
        }
      }))
    } catch (error) {
      console.error(`Error fetching messages for conversation ${conversation.id}:`, error)
      return []
    }
  })

  const conversationMessages = await Promise.all(messagePromises)
  
  // Flatten todas as mensagens em um único array
  conversationMessages.forEach(messages => {
    allMessages.push(...messages)
  })

  // Ordenar por data de criação (mais recentes primeiro)
  return allMessages.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function useAllConversationsMessages() {
  const { conversations, isLoading: isLoadingConversations } = useConversationsList()

  const {
    data: allMessages = [],
    isLoading: isLoadingMessages,
    refetch: refetchAllMessages,
    error
  } = useQuery<MessageWithConversation[]>({
    queryKey: ['all-conversations-messages', conversations?.length],
    queryFn: () => fetchAllConversationsMessages(conversations || []),
    enabled: !!conversations && conversations.length > 0,
    staleTime: 1000 * 30, // 30 segundos
    refetchInterval: 1000 * 60, // Refetch a cada 1 minuto
    refetchOnWindowFocus: true,
  })

  return {
    allMessages,
    isLoading: isLoadingConversations || isLoadingMessages,
    refetchAllMessages,
    error,
    conversations
  }
}