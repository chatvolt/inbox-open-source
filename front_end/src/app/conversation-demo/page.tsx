"use client"

import { IntegratedConversationView } from '@/components/IntegratedConversationView'
import { ConversationAnalysis } from '@/components/ConversationAnalysis'

// Dados de exemplo baseados no JSON fornecido
const conversationData = {
  status: "UNRESOLVED" as const,
  isAiEnabled: true,
  userId: "cme70tjgr0n59i3jr7txsp2yu",
  organizationId: "cme70tjgs0n5bi3jr8cljrxff",
  messages: [
    {
      id: "cmerunwxz0d33tlp52d8bg78y",
      text: "ola",
      from: "human" as const,
      read: true,
      eval: null,
      attachments: [],
      createdAt: "2025-08-26T01:10:53.835Z"
    },
    {
      id: "cmerunyy30d35tlp54h8c235r",
      text: "Protocolo cmerunzgo00003570i5nhledd — Opa! Eu sou o Jorginho, o mestre da Chatvolt — prazer! 😊\n\nComo posso te ajudar hoje? Quer falar sobre integrações, agendamento, cadastrar seus dados ou outra coisa?",
      from: "agent" as const,
      read: true,
      eval: null,
      attachments: [],
      createdAt: "2025-08-26T01:10:56.434Z"
    },
    {
      id: "cmffu07420a4gu4qrcbm87s3k",
      text: "oal",
      from: "human" as const,
      read: true,
      eval: null,
      attachments: [],
      createdAt: "2025-09-11T19:58:55.494Z"
    },
    {
      id: "cmffu0a8v0a4hu4qr3hho2vlu",
      text: "Protocolo cmerunzgo00003570i5nhledd — Eita, você digitou \"oal\"? Quis dizer \"olá\"? 😄\n\nMe confirma aí como posso ajudar: integrações, agendamento, cadastrar seus dados (nome, estado, rua e PIX) ou outra coisa? Estou aqui pra conectar tudo! 🔌✨",
      from: "agent" as const,
      read: true,
      eval: null,
      attachments: [],
      createdAt: "2025-09-11T19:58:59.561Z"
    }
  ]
}

export default function ConversationDemoPage() {
  return (
    <div className="h-screen flex">
      {/* Conversa principal */}
      <div className="flex-1 flex flex-col">
        <div className="border-b p-4 bg-background">
          <h1 className="text-xl font-bold">Visualização Integrada da Conversa</h1>
          <p className="text-sm text-muted-foreground">
            Demonstração da conversa com dados reais do Jorginho
          </p>
        </div>
        
        <IntegratedConversationView 
          conversationData={conversationData}
          agentId="cmebitq6200ksfze3iohanh8l"
          conversationId="cmerunzgo00003570i5nhledd"
        />
      </div>
      
      {/* Painel lateral com análise */}
      <div className="w-80 border-l bg-muted/30 p-4 overflow-y-auto">
        <ConversationAnalysis messages={conversationData.messages} />
      </div>
    </div>
  )
}