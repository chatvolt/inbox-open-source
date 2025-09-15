export interface Conversation {
    id: string;
    title: string | null;
    isAiEnabled: boolean;
    channel: string;
    status: "RESOLVED" | "UNRESOLVED" | "HUMAN_REQUESTED";
    aiUserIdentifier: string | null;
    priority: "LOW" | "MEDIUM" | "HIGH";
    createdAt: string;
    participantsContacts: {
        firstName: string;
    }[];
    // ADICIONADO: Define a estrutura do contexto da conversa
    conversationContexts?: {
        context: string;
        updatedAt: string;
    }[];
    // ADICIONADO: Define a estrutura das variáveis da conversa
    conversationVariables?: {
        conversationId: string;
        varName: string;
        varValue: string;
    }[];
    // ADICIONADO: ID do agente responsável
    agentId?: string | null;
}