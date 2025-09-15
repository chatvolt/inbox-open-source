import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define a estrutura do nosso estado: um mapa de conversationId para um array de tags
type TagState = {
  tagsByConversationId: Record<string, string[]>;
  addTag: (conversationId: string, tag: string) => void;
  removeTag: (conversationId: string, tag: string) => void;
  getAllUniqueTags: () => string[];
};

export const useTagStore = create<TagState>()(
  persist(
    (set, get) => ({
      tagsByConversationId: {},

      // Ação para adicionar uma nova etiqueta a uma conversa
      addTag: (conversationId, tag) => {
        const cleanTag = tag.trim();
        if (!cleanTag) return;

        set((state) => {
          const currentTags = state.tagsByConversationId[conversationId] || [];
          // Evita adicionar etiquetas duplicadas
          if (currentTags.includes(cleanTag)) {
            return state;
          }
          return {
            tagsByConversationId: {
              ...state.tagsByConversationId,
              [conversationId]: [...currentTags, cleanTag],
            },
          };
        });
      },

      // Ação para remover uma etiqueta de uma conversa
      removeTag: (conversationId, tag) => {
        set((state) => {
          const currentTags = state.tagsByConversationId[conversationId] || [];
          return {
            tagsByConversationId: {
              ...state.tagsByConversationId,
              [conversationId]: currentTags.filter((t) => t !== tag),
            },
          };
        });
      },
      
      // Seletor para obter todas as etiquetas únicas para o dropdown de filtro
      getAllUniqueTags: () => {
        const { tagsByConversationId } = get();
        const allTags = Object.values(tagsByConversationId).flat();
        return [...new Set(allTags)].sort(); // Retorna um array ordenado de tags únicas
      }
    }),
    {
      name: 'conversation-tags-storage', // Nome da chave no localStorage
    }
  )
);