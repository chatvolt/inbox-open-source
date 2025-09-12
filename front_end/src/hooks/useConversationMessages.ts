import { useQuery } from '@tanstack/react-query'
import { useConversationStore } from '@/stores/conversationStore'
import { type Message, type ConversationMessagesResponse } from '@/components/CardConversation/types'

// Função para buscar mensagens da API
async function fetchMessages(conversationId: string, count: number = 50): Promise<Message[]> {
  const response = await fetch(`http://localhost:3001/conversation/${conversationId}/messages/${count}`)
  if (!response.ok) throw new Error('Failed to fetch messages')
  const data: ConversationMessagesResponse = await response.json()
  
  // Ordenar mensagens por data de criação (mais antigas primeiro, mais recentes por último)
  return data.messages.sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
}

export function useConversationMessages() {
  const { 
    selectedConversation, 
    lastMessageTimestamp, 
    setLastMessageTimestamp 
  } = useConversationStore()

  const {
    data: messages = [],
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
    error
  } = useQuery<Message[]>({
    queryKey: ['messages', selectedConversation?.id],
    queryFn: () => selectedConversation ? fetchMessages(selectedConversation.id) : Promise.resolve([]),
    enabled: !!selectedConversation,
    staleTime: 1000 * 10, // 10 segundos
    refetchInterval: 1000 * 5, // Refetch a cada 5 segundos para verificar novas mensagens
    refetchOnWindowFocus: true,
    onSuccess: (data: Message[]) => {
      // Atualizar timestamp da última mensagem
      if (data.length > 0) {
        const latestMessage = data[data.length - 1]
        setLastMessageTimestamp(latestMessage.createdAt)
      }
    }
  })

  return {
    messages,
    isLoadingMessages,
    refetchMessages,
    error,
    selectedConversation,
    lastMessageTimestamp
  }
}