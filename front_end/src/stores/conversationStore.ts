import { create } from 'zustand'
import { type Conversation, type Message } from '@/components/CardConversation/types'

interface ConversationState {
  selectedConversation: Conversation | null
  isSendingMessage: boolean
  isUpdatingPriority: boolean
  lastMessageTimestamp: string | null
  
  // Actions
  setSelectedConversation: (conversation: Conversation | null) => void
  setIsSendingMessage: (loading: boolean) => void
  setIsUpdatingPriority: (loading: boolean) => void
  setLastMessageTimestamp: (timestamp: string | null) => void
  updateConversationPriority: (priority: "LOW" | "MEDIUM" | "HIGH") => void
  updateConversationAiEnabled: (enabled: boolean) => void
  updateConversationStatus: (status: "RESOLVED" | "UNRESOLVED" | "HUMAN_REQUESTED") => void
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  selectedConversation: null,
  isSendingMessage: false,
  isUpdatingPriority: false,
  lastMessageTimestamp: null,

  setSelectedConversation: (conversation) => {
    set({ 
      selectedConversation: conversation,
      lastMessageTimestamp: null // Reset timestamp when changing conversation
    })
  },

  setIsSendingMessage: (loading) => set({ isSendingMessage: loading }),
  
  setIsUpdatingPriority: (loading) => set({ isUpdatingPriority: loading }),
  
  setLastMessageTimestamp: (timestamp) => set({ lastMessageTimestamp: timestamp }),

  updateConversationPriority: (priority) => {
    const { selectedConversation } = get()
    if (selectedConversation) {
      set({
        selectedConversation: {
          ...selectedConversation,
          priority
        }
      })
    }
  },

  updateConversationAiEnabled: (enabled) => {
    const { selectedConversation } = get()
    if (selectedConversation) {
      set({
        selectedConversation: {
          ...selectedConversation,
          isAiEnabled: enabled
        }
      })
    }
  },

  updateConversationStatus: (status) => {
    const { selectedConversation } = get()
    if (selectedConversation) {
      set({
        selectedConversation: {
          ...selectedConversation,
          status
        }
      })
    }
  }
}))