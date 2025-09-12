import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useConversationStore } from '@/stores/conversationStore'
import {
  type SendMessageRequest,
  type SetAiEnabledRequest,
  type SetAiEnabledResponse,
  type SetStatusRequest,
  type SetStatusResponse
} from '@/components/CardConversation/types'

// Função para enviar mensagem
async function sendMessageToAPI(conversationId: string, messageData: SendMessageRequest): Promise<any> {
  const response = await fetch(`http://localhost:3001/conversations/${conversationId}/message-register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messageData)
  })
  console.log(response)
  if (!response.ok) throw new Error('Failed to send message')
  return response.json()
}

// Função para definir prioridade
async function setPriorityAPI(conversationId: string, priority: "LOW" | "MEDIUM" | "HIGH"): Promise<void> {
  const response = await fetch(`http://localhost:3001/conversations/${conversationId}/set-priority`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ priority })
  })

  if (!response.ok) throw new Error('Failed to set priority')
}

// Função para habilitar/desabilitar IA
async function setAiEnabledAPI(conversationId: string, enabled: boolean): Promise<SetAiEnabledResponse> {
  const response = await fetch(`http://localhost:3001/conversations/${conversationId}/set-ai-enabled`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ enabled })
  })

  if (!response.ok) throw new Error('Failed to set AI enabled status')
  return response.json()
}

// Função para definir status da conversa
async function setStatusAPI(conversationId: string, status: "RESOLVED" | "UNRESOLVED" | "HUMAN_REQUESTED"): Promise<SetStatusResponse> {
  const response = await fetch(`http://localhost:3001/conversations/${conversationId}/set-status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status })
  })

  if (!response.ok) throw new Error('Failed to set conversation status')
  return response.json()
}

export function useConversationActions() {
  const queryClient = useQueryClient()
  const {
    selectedConversation,
    isSendingMessage,
    isUpdatingPriority,
    setIsSendingMessage,
    setIsUpdatingPriority,
    updateConversationPriority,
    updateConversationAiEnabled,
    updateConversationStatus
  } = useConversationStore()

  // Mutation para enviar mensagem
  const sendMessageMutation = useMutation({
    mutationFn: async ({ messageText, from }: { messageText: string, from: "human" | "assistant" | "system" }) => {
      if (!selectedConversation || !messageText.trim()) {
        throw new Error('No conversation selected or empty message')
      }

      const messageData: SendMessageRequest = {
        message: messageText,
        from: 'agent'
      }

      return sendMessageToAPI(selectedConversation.id, messageData)
    },
    onMutate: () => {
      setIsSendingMessage(true)
    },
    onSuccess: () => {
      // Invalidar e refetch das mensagens para mostrar a nova mensagem
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation?.id] })
    },
    onError: (error) => {
      console.error('Erro ao enviar mensagem:', error)
    },
    onSettled: () => {
      setIsSendingMessage(false)
    }
  })

  // Mutation para definir prioridade
  const setPriorityMutation = useMutation({
    mutationFn: async (priority: "LOW" | "MEDIUM" | "HIGH") => {
      if (!selectedConversation) {
        throw new Error('No conversation selected')
      }
      return setPriorityAPI(selectedConversation.id, priority)
    },
    onMutate: () => {
      setIsUpdatingPriority(true)
    },
    onSuccess: (_, priority) => {
      // Atualizar o estado local da conversa
      updateConversationPriority(priority)
      
      // Invalidar cache das conversas para atualizar o sidebar
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
    onError: (error) => {
      console.error('Erro ao definir prioridade:', error)
    },
    onSettled: () => {
      setIsUpdatingPriority(false)
    }
  })

  // Mutation para habilitar/desabilitar IA
  const setAiEnabledMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!selectedConversation) {
        throw new Error('No conversation selected')
      }
      return setAiEnabledAPI(selectedConversation.id, enabled)
    },
    onSuccess: (_, enabled) => {
      // Atualizar o estado local da conversa
      updateConversationAiEnabled(enabled)
      
      // Invalidar cache das conversas para atualizar o sidebar
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
    onError: (error) => {
      console.error('Erro ao definir status da IA:', error)
    }
  })

  // Mutation para definir status da conversa
  const setStatusMutation = useMutation({
    mutationFn: async (status: "RESOLVED" | "UNRESOLVED" | "HUMAN_REQUESTED") => {
      if (!selectedConversation) {
        throw new Error('No conversation selected')
      }
      return setStatusAPI(selectedConversation.id, status)
    },
    onSuccess: (_, status) => {
      // Atualizar o estado local da conversa
      updateConversationStatus(status)
      
      // Invalidar cache das conversas para atualizar o sidebar
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
    onError: (error) => {
      console.error('Erro ao definir status da conversa:', error)
    }
  })

  return {
    sendMessage: (messageText: string, from: "human" | "assistant" | "system" = 'assistant') =>
      sendMessageMutation.mutate({ messageText, from }),
    setPriority: (priority: "LOW" | "MEDIUM" | "HIGH") =>
      setPriorityMutation.mutate(priority),
    setAiEnabled: (enabled: boolean) =>
      setAiEnabledMutation.mutate(enabled),
    setStatus: (status: "RESOLVED" | "UNRESOLVED" | "HUMAN_REQUESTED") =>
      setStatusMutation.mutate(status),
    isSendingMessage,
    isUpdatingPriority,
    isUpdatingAiStatus: setAiEnabledMutation.isPending,
    isUpdatingStatus: setStatusMutation.isPending,
    sendMessageError: sendMessageMutation.error,
    setPriorityError: setPriorityMutation.error,
    setAiEnabledError: setAiEnabledMutation.error,
    setStatusError: setStatusMutation.error
  }
}