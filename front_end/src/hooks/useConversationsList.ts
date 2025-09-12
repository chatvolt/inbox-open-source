import { useQuery } from '@tanstack/react-query'
import { type Conversation } from '@/components/CardConversation/types'

// Função para buscar conversas da API
async function fetchConversations(): Promise<Conversation[]> {
  const response = await fetch("http://localhost:3001/conversation")
  if (!response.ok) throw new Error("Failed to fetch conversations")
  return response.json()
}

export function useConversationsList() {
  const {
    data: conversations = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
    staleTime: 1000 * 30, // 30 segundos
    refetchOnWindowFocus: false,
    refetchInterval: 1000 * 20, // Refetch a cada 20 segundos para updates em tempo real
  })

  return {
    conversations,
    isLoading,
    isError,
    error,
    refetch
  }
}