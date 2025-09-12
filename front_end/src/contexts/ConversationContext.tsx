"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { type Conversation, type Message, type ConversationMessagesResponse, type SendMessageRequest, type SendMessageResponse, type SetPriorityRequest, type SetPriorityResponse } from '@/components/CardConversation/types'
import { useQuery } from '@tanstack/react-query'

interface ConversationContextType {
  selectedConversation: Conversation | null
  messages: Message[]
  isLoadingMessages: boolean
  isSendingMessage: boolean
  isUpdatingPriority: boolean
  selectConversation: (conversation: Conversation) => void
  refetchMessages: () => void
  sendMessage: (messageText: string, agentId: string) => Promise<void>
  setPriority: (priority: "LOW" | "MEDIUM" | "HIGH") => Promise<void>
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined)

// Função para buscar mensagens da API
async function fetchMessages(conversationId: string, count: number = 50): Promise<Message[]> {
  const response = await fetch(`http://localhost:3001/conversation/${conversationId}/messages/${count}`)
  if (!response.ok) throw new Error('Failed to fetch messages')
  const data: ConversationMessagesResponse = await response.json()
  return data.messages
}

// Função para enviar mensagem
async function sendMessageToAPI(conversationId: string, messageData: SendMessageRequest): Promise<Message> {
  const response = await fetch(`http://localhost:3001/conversation/message/conversationId/${conversationId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messageData)
  })
  
  if (!response.ok) throw new Error('Failed to send message')
  const data: SendMessageResponse = await response.json()
  
  if (!data.success) throw new Error('Message sending failed')
  return data.message
}

// Função para definir prioridade
async function setPriorityAPI(conversationId: string, priority: "LOW" | "MEDIUM" | "HIGH"): Promise<Conversation> {
  const response = await fetch(`http://localhost:3001/conversations/${conversationId}/set-priority`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ priority })
  })
  
  if (!response.ok) throw new Error('Failed to set priority')
  const data: SetPriorityResponse = await response.json()
  
  if (!data.success) throw new Error('Priority update failed')
  return data.conversation
}

interface ConversationProviderProps {
  children: ReactNode
}

export function ConversationProvider({ children }: ConversationProviderProps) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [isUpdatingPriority, setIsUpdatingPriority] = useState(false)

  const {
    data: messages = [],
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
  } = useQuery<Message[]>({
    queryKey: ['messages', selectedConversation?.id],
    queryFn: () => selectedConversation ? fetchMessages(selectedConversation.id) : Promise.resolve([]),
    enabled: !!selectedConversation,
    staleTime: 1000 * 30, // 30 segundos
    refetchOnWindowFocus: false,
  })

  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
  }

  const sendMessage = async (messageText: string, agentId: string) => {
    if (!selectedConversation || !messageText.trim()) return

    setIsSendingMessage(true)
    try {
      const messageData: SendMessageRequest = {
        message: messageText,
        agentId: agentId,
        channel: selectedConversation.channel || 'website',
        attachments: [],
        visitorId: selectedConversation.visitorId || '',
        contactId: selectedConversation.participantsContacts?.[0]?.firstName || ''
      }

      await sendMessageToAPI(selectedConversation.id, messageData)
      
      // Refetch messages para mostrar a nova mensagem
      await refetchMessages()
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      throw error
    } finally {
      setIsSendingMessage(false)
    }
  }

  const setPriority = async (priority: "LOW" | "MEDIUM" | "HIGH") => {
    if (!selectedConversation) return

    setIsUpdatingPriority(true)
    try {
      const updatedConversation = await setPriorityAPI(selectedConversation.id, priority)
      
      // Atualizar a conversa selecionada com a nova prioridade
      setSelectedConversation(updatedConversation)
    } catch (error) {
      console.error('Erro ao definir prioridade:', error)
      throw error
    } finally {
      setIsUpdatingPriority(false)
    }
  }

  return (
    <ConversationContext.Provider
      value={{
        selectedConversation,
        messages,
        isLoadingMessages,
        isSendingMessage,
        isUpdatingPriority,
        selectConversation,
        refetchMessages,
        sendMessage,
        setPriority,
      }}
    >
      {children}
    </ConversationContext.Provider>
  )
}

export function useConversation() {
  const context = useContext(ConversationContext)
  if (context === undefined) {
    throw new Error('useConversation must be used within a ConversationProvider')
  }
  return context
}