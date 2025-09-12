import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useConversationStore } from '@/stores/conversationStore'
import { type Conversation } from '@/components/CardConversation/types'

// Função para buscar uma conversa específica
async function fetchConversation(conversationId: string): Promise<Conversation> {
  const response = await fetch(`http://localhost:3001/conversation/${conversationId}`)
  if (!response.ok) throw new Error('Failed to fetch conversation')
  return response.json()
}

export function useConversationUpdates() {
  const { selectedConversation, setSelectedConversation } = useConversationStore()
  const queryClient = useQueryClient()

  // Query para monitorar mudanças na conversa selecionada
  const { data: updatedConversation } = useQuery<Conversation>({
    queryKey: ['conversation', selectedConversation?.id],
    queryFn: () => selectedConversation ? fetchConversation(selectedConversation.id) : Promise.reject('No conversation'),
    enabled: !!selectedConversation,
    staleTime: 1000 * 10, // 10 segundos
    refetchInterval: 1000 * 15, // Verificar mudanças a cada 15 segundos
    refetchOnWindowFocus: true,
    onSuccess: (data) => {
      // Se a conversa foi atualizada, atualizar o estado local
      if (selectedConversation && (
        data.priority !== selectedConversation.priority ||
        data.status !== selectedConversation.status ||
        data.unreadMessagesCount !== selectedConversation.unreadMessagesCount
      )) {
        setSelectedConversation(data)
        
        // Invalidar cache das conversas para atualizar o sidebar
        queryClient.invalidateQueries({ queryKey: ['conversations'] })
      }
    }
  })

  return {
    updatedConversation,
    isMonitoring: !!selectedConversation
  }
}