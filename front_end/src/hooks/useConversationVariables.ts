import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface ConversationVariable {
  conversationId: string
  varName: string
  varValue: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Listar todas as variáveis de uma conversa
async function fetchConversationVariables(conversationId: string): Promise<ConversationVariable[]> {
  const response = await fetch(`${API_BASE_URL}/variables/${conversationId}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch conversation variables: ${response.statusText}`)
  }

  return response.json()
}

// Obter uma variável específica
async function fetchConversationVariable(conversationId: string, varName: string): Promise<ConversationVariable> {
  const response = await fetch(`${API_BASE_URL}/variables/${conversationId}/${varName}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch conversation variable: ${response.statusText}`)
  }

  return response.json()
}

// Criar uma nova variável
async function createConversationVariable(data: ConversationVariable): Promise<ConversationVariable> {
  const response = await fetch(`${API_BASE_URL}/variables`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`Failed to create conversation variable: ${response.statusText}`)
  }

  return response.json()
}

// Deletar uma variável
async function deleteConversationVariable(conversationId: string, varName: string): Promise<{ message: string; deleted: ConversationVariable }> {
  const response = await fetch(`${API_BASE_URL}/variables/${conversationId}/${varName}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`Failed to delete conversation variable: ${response.statusText}`)
  }

  return response.json()
}

// Hook para listar todas as variáveis de uma conversa
export function useConversationVariables(conversationId: string | null | undefined) {
  return useQuery({
    queryKey: ['conversation-variables', conversationId],
    queryFn: () => fetchConversationVariables(conversationId!),
    enabled: !!conversationId,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Hook para obter uma variável específica
export function useConversationVariable(conversationId: string | null | undefined, varName: string | null | undefined) {
  return useQuery({
    queryKey: ['conversation-variable', conversationId, varName],
    queryFn: () => fetchConversationVariable(conversationId!, varName!),
    enabled: !!conversationId && !!varName,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

// Hook para criar uma nova variável
export function useCreateConversationVariable() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createConversationVariable,
    onSuccess: (data) => {
      // Invalidar e refetch as variáveis da conversa
      queryClient.invalidateQueries({
        queryKey: ['conversation-variables', data.conversationId]
      })
    },
  })
}

// Hook para deletar uma variável
export function useDeleteConversationVariable() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ conversationId, varName }: { conversationId: string; varName: string }) =>
      deleteConversationVariable(conversationId, varName),
    onSuccess: (data) => {
      // Invalidar e refetch as variáveis da conversa
      queryClient.invalidateQueries({
        queryKey: ['conversation-variables', data.deleted.conversationId]
      })
    },
  })
}