export interface Conversation {
    "id": string,
    "title": string,
    "isAiEnabled": true,
    "channel": string,
    "status": string,
    "metadata": any,
    "aiUserIdentifier": string,
    "channelExternalId": string,
    "channelCredentialsId": string,
    "organizationId": string,
    "mailInboxId": string,
    "priority": string,
    "formId": string,
    "agentId": string,
    "userId": string,
    "visitorId": string,
    "frustration": number,
    "unreadMessagesCount": number,
    "createdAt": string,
    "updatedAt": string,
    "participantsContacts": [
        {
            "firstName": string
        }
    ],
    "conversationVariables": [
        {
            "conversationId": string,
            "varName": string,
            "varValue": string
        }
    ],
    "conversationContexts": [
        {
            "context": string,
            "updatedAt": string
        }
    ]
}

export interface MessageSource {
    "text": string,
    "score": number,
    "source": string,
    "datasource_id": string,
    "datasource_name": string,
    "custom_id": string,
    "tags": string[]
}

export interface Message {
    "id": string,
    "text": string,
    "html": string,
    "from": "human" | "assistant" | "system",
    "conversationId": string,
    "sources": MessageSource[],
    "usage": any,
    "externalId": string,
    "userId": string,
    "contactId": string,
    "visitorId": string,
    "agentId": string,
    "metadata": any,
    "inputId": string,
    "eval": "good" | "bad" | "neutral",
    "read": boolean,
    "agentModel": string,
    "usageCredits": number,
    "createdAt": string,
    "updatedAt": string
}

export interface ConversationMessagesResponse {
    "status": string,
    "isAiEnabled": boolean,
    "userId": string,
    "organizationId": string,
    "messages": Message[]
}

export interface SendMessageRequest {
    "message": string,
    "from": "human" | "assistant" | "system"
}

export interface SendMessageResponse {
    "success": boolean,
    "message": Message
}

export interface SetPriorityRequest {
    "priority": "LOW" | "MEDIUM" | "HIGH"
}

export interface SetPriorityResponse {
    "success": boolean,
    "conversation": Conversation
}

export interface SetAiEnabledRequest {
    "enabled": boolean
}

export interface SetAiEnabledResponse {
    "success": boolean,
    "message": string
}

export interface SetStatusRequest {
    "status": "RESOLVED" | "UNRESOLVED" | "HUMAN_REQUESTED"
}

export interface SetStatusResponse {
    "success": boolean,
    "message": string
}