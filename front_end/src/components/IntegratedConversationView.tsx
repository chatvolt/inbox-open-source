"use client"

import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { 
  MessageCircle, 
  User, 
  Bot, 
  Send, 
  Loader2, 
  ChevronDown, 
  Wifi, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  UserCheck,
  Clock,
  Eye,
  Settings
} from 'lucide-react'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { AgentCard } from '@/components/AgentCard'
import { ConversationVariables } from '@/components/ConversationVariables'
import { ConversationStats } from '@/components/ConversationStats'
import { useAgentDetails } from '@/hooks/useAgentDetails'

interface Message {
  id: string
  text: string
  from: 'human' | 'agent' | 'system'
  read: boolean
  eval: 'good' | 'bad' | 'neutral' | null
  attachments: any[]
  createdAt: string
}

interface ConversationData {
  status: 'RESOLVED' | 'UNRESOLVED' | 'HUMAN_REQUESTED'
  isAiEnabled: boolean
  userId: string
  organizationId: string
  messages: Message[]
  // Dados adicionais que podem vir da API
  id?: string
  agentId?: string
  channel?: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'
  unreadMessagesCount?: number
  participantsContacts?: Array<{ firstName?: string }>
  aiUserIdentifier?: string
  conversationContexts?: Array<{ context: string }>
}

interface IntegratedConversationViewProps {
  conversationData: ConversationData
  agentId?: string
  conversationId?: string
}

function formatMessageTime(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

function formatMessageDate(dateString: string) {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) {
    return 'Hoje'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Ontem'
  } else {
    return date.toLocaleDateString('pt-BR')
  }
}

function getMessageIcon(from: string) {
  switch (from) {
    case 'human':
      return User
    case 'agent':
      return Bot
    case 'system':
      return Settings
    default:
      return MessageCircle
  }
}

function getMessageTypeLabel(from: string) {
  switch (from) {
    case 'human':
      return 'Cliente'
    case 'agent':
      return 'Assistente'
    case 'system':
      return 'Sistema'
    default:
      return from
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'RESOLVED':
      return 'border-green-500 text-green-700 bg-green-50'
    case 'UNRESOLVED':
      return 'border-red-500 text-red-700 bg-red-50'
    case 'HUMAN_REQUESTED':
      return 'border-blue-500 text-blue-700 bg-blue-50'
    default:
      return 'border-gray-500 text-gray-700 bg-gray-50'
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'RESOLVED':
      return 'Resolvida'
    case 'UNRESOLVED':
      return 'Pendente'
    case 'HUMAN_REQUESTED':
      return 'Humano Solicitado'
    default:
      return status
  }
}

function extractProtocol(text: string): string | null {
  const protocolMatch = text.match(/Protocolo\s+([a-zA-Z0-9]+)/);
  return protocolMatch ? protocolMatch[1] : null;
}

export function IntegratedConversationView({ 
  conversationData, 
  agentId = "cmebitq6200ksfze3iohanh8l", // ID do Jorginho como padrão
  conversationId 
}: IntegratedConversationViewProps) {
  const { data: agentData, isLoading: isLoadingAgent } = useAgentDetails(agentId)
  const [messageText, setMessageText] = useState('')
  const [isSendingMessage, setIsSendingMessage] = useState(false)

  // Extrair protocolo da primeira mensagem do agente
  const protocol = conversationData.messages.find(msg => msg.from === 'agent')?.text
    ? extractProtocol(conversationData.messages.find(msg => msg.from === 'agent')!.text)
    : null

  // Agrupar mensagens por data
  const messagesByDate = conversationData.messages.reduce((acc: Record<string, Message[]>, message) => {
    const date = formatMessageDate(message.createdAt)
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(message)
    return acc
  }, {})

  // Ordenar mensagens por data dentro de cada grupo
  Object.keys(messagesByDate).forEach(date => {
    messagesByDate[date].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  })

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || isSendingMessage) return

    setIsSendingMessage(true)
    // Aqui você implementaria o envio da mensagem
    console.log('Enviando mensagem:', messageText)
    
    // Simular delay de envio
    setTimeout(() => {
      setMessageText('')
      setIsSendingMessage(false)
    }, 1000)
  }

  return (
    <div className="flex flex-1 flex-col h-full">
      {/* Header da conversa */}
      <div className="border-b p-4 bg-background flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="space-y-3">
              {/* Título e protocolo */}
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">
                  Conversa com Cliente
                </h2>
                {protocol && (
                  <Badge variant="outline" className="font-mono text-xs">
                    #{protocol}
                  </Badge>
                )}
              </div>
              
              {/* Informações do agente */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-pointer">
                      <AgentCard 
                        agentId={agentId} 
                        variant="compact" 
                        showModel={true}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="p-0">
                    <div className="p-3 max-w-sm">
                      <AgentCard 
                        agentId={agentId} 
                        variant="default" 
                        showModel={true}
                        showDescription={true}
                      />
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Status e controles */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`text-xs ${getStatusColor(conversationData.status)}`}>
                  {getStatusLabel(conversationData.status)}
                </Badge>
                
                <div className="flex items-center gap-2 p-1 rounded-md border">
                  <div className={`w-2 h-2 rounded-full ${conversationData.isAiEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <Label className="text-xs font-medium">
                    IA {conversationData.isAiEnabled ? 'Ativada' : 'Desativada'}
                  </Label>
                  <Switch
                    checked={conversationData.isAiEnabled}
                    className="scale-75"
                    disabled
                  />
                </div>

                <Badge variant="secondary" className="text-xs">
                  {conversationData.messages.length} mensagens
                </Badge>
              </div>

              {/* Estatísticas da conversa */}
              <div className="mt-4">
                <ConversationStats 
                  messages={conversationData.messages}
                  status={conversationData.status}
                  isAiEnabled={conversationData.isAiEnabled}
                />
              </div>

              {/* Variáveis da conversa */}
              {conversationId && (
                <div className="mt-3">
                  <ConversationVariables conversationId={conversationId} compact />
                </div>
              )}
            </div>
          </div>
          
          {/* Info lateral */}
          <div className="text-right text-sm text-muted-foreground flex-shrink-0">
            <div className="flex items-center gap-2 mb-1 justify-end">
              <Wifi className="h-3 w-3 text-green-500" />
              <span className="text-xs">Online</span>
            </div>
            <p className="text-xs">Mensagens: {conversationData.messages.length}</p>
            <p className="text-xs">
              Última: {formatMessageTime(conversationData.messages[conversationData.messages.length - 1]?.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Lista de mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {Object.entries(messagesByDate).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Separador de data */}
            <div className="flex items-center justify-center mb-4">
              <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                {date}
              </div>
            </div>
            
            {/* Mensagens do dia */}
            <div className="space-y-4">
              {dateMessages.map((message) => {
                const MessageIcon = getMessageIcon(message.from)
                const isClient = message.from === 'human'
                const isBot = message.from === 'agent'
                
                return (
                  <div key={message.id} className="flex flex-col gap-2">
                    {/* Mensagem do cliente */}
                    {isClient && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center flex-shrink-0 font-medium text-sm">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm border max-w-md">
                            <div className="text-sm text-gray-900">
                              {message.text}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 text-right">
                              {formatMessageTime(message.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Mensagem do bot/agente */}
                    {isBot && (
                      <div className="flex items-end justify-end gap-3">
                        <div className="flex-1 flex justify-end">
                          <div className="bg-purple-100 rounded-2xl rounded-br-sm p-3 shadow-sm border max-w-md">
                            <div className="text-sm text-purple-900">
                              <MarkdownRenderer content={message.text} className="text-sm" />
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-purple-200">
                              <div className="flex items-center gap-2">
                                {agentData?.iconUrl ? (
                                  <img 
                                    src={agentData.iconUrl} 
                                    alt={agentData.name}
                                    className="w-5 h-5 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                                    <span className="text-xs text-white font-medium">J</span>
                                  </div>
                                )}
                                <span className="text-xs text-purple-700 font-medium">
                                  {agentData?.interfaceConfig?.displayName || agentData?.name || 'Jorginho'}
                                </span>
                              </div>
                              <div className="text-xs text-purple-600">
                                {formatMessageTime(message.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Mensagem do sistema */}
                    {message.from === 'system' && (
                      <div className="flex justify-center">
                        <div className="bg-gray-100 rounded-lg p-2 text-xs text-gray-600 max-w-md text-center">
                          {message.text}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Campo de input para responder */}
      <div className="border-t p-4 bg-background flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Digite sua resposta..."
            disabled={isSendingMessage}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage(e)
              }
            }}
          />
          <Button 
            type="submit" 
            disabled={!messageText.trim() || isSendingMessage}
            size="sm"
          >
            {isSendingMessage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>Pressione Enter para enviar, Shift+Enter para nova linha</span>
          {isSendingMessage && <span>Enviando mensagem...</span>}
        </div>
      </div>
    </div>
  )
}

export default IntegratedConversationView