import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useConversationStore } from '@/stores/conversationStore'

export function useRealTimeUpdates() {
  const queryClient = useQueryClient()
  const { selectedConversation } = useConversationStore()

  useEffect(() => {
    // Função para invalidar caches quando há mudanças
    const handleConversationUpdate = () => {
      // Invalidar cache das conversas (sidebar)
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      
      // Se há uma conversa selecionada, invalidar seu cache também
      if (selectedConversation) {
        queryClient.invalidateQueries({ queryKey: ['conversation', selectedConversation.id] })
        queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation.id] })
      }
    }

    // Simular atualizações em tempo real
    // Em um cenário real, isso seria substituído por WebSocket ou Server-Sent Events
    const interval = setInterval(() => {
      handleConversationUpdate()
    }, 1000 * 30) // A cada 30 segundos

    return () => clearInterval(interval)
  }, [queryClient, selectedConversation])

  // Função para forçar atualização manual
  const forceUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['conversations'] })
    if (selectedConversation) {
      queryClient.invalidateQueries({ queryKey: ['conversation', selectedConversation.id] })
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation.id] })
    }
  }

  return { forceUpdate }
}