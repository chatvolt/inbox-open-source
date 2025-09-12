"use client"

import React, { useState } from 'react'
import { useConversationMessages } from '@/hooks/useConversationMessages'
import { useConversationActions } from '@/hooks/useConversationActions'
import { useConversationUpdates } from '@/hooks/useConversationUpdates'
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates'
import { useAgentDetails } from '@/hooks/useAgentDetails'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { hasMarkdownSyntax } from '@/utils/markdown'
import { MessageCircle, User, Bot, Settings, Send, Loader2, ChevronDown, Wifi, RefreshCw, CheckCircle, AlertCircle, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { AgentInfo } from '@/components/AgentInfo'
import { AgentCard } from '@/components/AgentCard'
import { ConversationVariables } from '@/components/ConversationVariables'
import { IntegratedConversationView } from '@/components/IntegratedConversationView'

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
    case 'assistant':
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
    case 'assistant':
      return 'Você (Bot)'
    case 'system':
      return 'Sistema'
    default:
      return from
  }
}

export function ConversationMessages() {
  const { messages, isLoadingMessages, selectedConversation } = useConversationMessages()
  const { sendMessage, setPriority, setAiEnabled, setStatus, isSendingMessage, isUpdatingPriority, isUpdatingAiStatus, isUpdatingStatus } = useConversationActions()
  const { isMonitoring } = useConversationUpdates() // Monitorar mudanças na conversa
  const { forceUpdate } = useRealTimeUpdates() // Atualizações em tempo real
  const { data: agentData, isLoading: isLoadingAgent } = useAgentDetails(selectedConversation?.agentId)
  const [messageText, setMessageText] = useState('')

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || isSendingMessage) return

    // Enviamos como 'assistant' pois somos o bot respondendo
    sendMessage(messageText, 'assistant')
    setMessageText('')
  }

  const handleSetPriority = (priority: "LOW" | "MEDIUM" | "HIGH") => {
    setPriority(priority)
  }

  const handleToggleAi = () => {
    if (selectedConversation) {
      setAiEnabled(!selectedConversation.isAiEnabled)
    }
  }

  const handleSetStatus = (status: "RESOLVED" | "UNRESOLVED" | "HUMAN_REQUESTED") => {
    setStatus(status)
  }

  const getStatusColor = (status: string) => {
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

  const getStatusLabel = (status: string) => {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'border-red-500 text-red-700 bg-red-50'
      case 'MEDIUM':
        return 'border-yellow-500 text-yellow-700 bg-yellow-50'
      case 'LOW':
        return 'border-green-500 text-green-700 bg-green-50'
      default:
        return 'border-gray-500 text-gray-700 bg-gray-50'
    }
  }

  if (!selectedConversation) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">
            Selecione uma conversa
          </h3>
          <p className="text-sm text-muted-foreground">
            Escolha uma conversa no sidebar para ver as mensagens
          </p>
        </div>
      </div>
    )
  }

  if (isLoadingMessages) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="border-b pb-4">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Agrupar mensagens por data (já ordenadas cronologicamente)
  const messagesByDate = messages.reduce((acc: Record<string, typeof messages>, message) => {
    const date = formatMessageDate(message.createdAt)
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(message)
    return acc
  }, {} as Record<string, typeof messages>)

  return (
    <div className="flex flex-1 flex-col">
      {/* Header da conversa */}
      <div className="border-b p-2 sm:p-4 bg-background">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="space-y-2">
              {/* Nome do cliente */}
              <h2 className="text-base sm:text-lg font-semibold truncate">
                {selectedConversation.participantsContacts?.[0]?.firstName || 
                 selectedConversation.aiUserIdentifier || 
                 `${selectedConversation.channel} User`}
              </h2>
              
              {/* Informações do agente */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-pointer hover:bg-muted/70 transition-colors rounded-lg">
                      <AgentCard 
                        agentId={selectedConversation.agentId} 
                        variant="compact" 
                        showModel={true}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="p-0">
                    <AgentInfo agentId={selectedConversation.agentId!} compact />
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            {/* Controles principais - linha 1 */}
            <div className="flex items-center gap-1 sm:gap-2 mt-2 flex-wrap">
              <Badge variant="secondary" className="text-xs flex-shrink-0">
                {selectedConversation.channel}
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`text-xs h-6 px-1 sm:px-2 ${getStatusColor(selectedConversation.status)} flex-shrink-0`}
                    disabled={isUpdatingStatus}
                  >
                    {isUpdatingStatus ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : null}
                    <span className="hidden sm:inline">{getStatusLabel(selectedConversation.status)}</span>
                    <span className="sm:hidden">{selectedConversation.status}</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => handleSetStatus('RESOLVED')}>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Resolvida
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSetStatus('UNRESOLVED')}>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      Pendente
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSetStatus('HUMAN_REQUESTED')}>
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-blue-500" />
                      Humano Solicitado
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`text-xs h-6 px-1 sm:px-2 ${getPriorityColor(selectedConversation.priority)} flex-shrink-0`}
                    disabled={isUpdatingPriority}
                  >
                    {isUpdatingPriority ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : null}
                    {selectedConversation.priority}
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => handleSetPriority('HIGH')}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      HIGH
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSetPriority('MEDIUM')}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      MEDIUM
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSetPriority('LOW')}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      LOW
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {selectedConversation.unreadMessagesCount > 0 && (
                <Badge variant="destructive" className="text-xs flex-shrink-0">
                  {selectedConversation.unreadMessagesCount}
                </Badge>
              )}
            </div>
            
            {/* Toggle de IA - linha 2 */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 rounded-md border flex-shrink-0">
                <div className={`w-2 h-2 rounded-full ${selectedConversation.isAiEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                <Label htmlFor="ai-toggle" className="text-xs font-medium">
                  <span className="hidden sm:inline">IA {selectedConversation.isAiEnabled ? 'Ativada' : 'Desativada'}</span>
                  <span className="sm:hidden">IA</span>
                </Label>
                <Switch
                  id="ai-toggle"
                  checked={selectedConversation.isAiEnabled}
                  onCheckedChange={handleToggleAi}
                  disabled={isUpdatingAiStatus}
                  className="scale-75"
                />
                {isUpdatingAiStatus && (
                  <Loader2 className="h-3 w-3 animate-spin ml-1" />
                )}
              </div>
            </div>
            
            {/* Contexto da conversa */}
            {selectedConversation.conversationContexts && selectedConversation.conversationContexts.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {selectedConversation.conversationContexts[0].context}
              </p>
            )}
            
            {/* Variáveis da conversa */}
            <div className="mt-3">
              <ConversationVariables conversationId={selectedConversation.id} compact />
            </div>
          </div>
          
          {/* Info lateral - oculta em mobile */}
          <div className="hidden lg:block text-right text-sm text-muted-foreground flex-shrink-0">
            <div className="flex items-center gap-2 mb-1 justify-end">
              <Wifi className={`h-3 w-3 ${isMonitoring ? 'text-green-500' : 'text-gray-400'}`} />
              <span className="text-xs">
                {isMonitoring ? 'Monitorando' : 'Offline'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={forceUpdate}
                className="h-5 w-5 p-0 ml-2"
                title="Forçar atualização"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs">Mensagens: {messages.length}</p>
            <p className="text-xs">Atualizada: {formatMessageDate(selectedConversation.updatedAt)}</p>
          </div>
        </div>
      </div>

      {/* Lista de mensagens */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4 sm:space-y-6">
        {Object.keys(messagesByDate).length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhuma mensagem encontrada nesta conversa
            </p>
          </div>
        ) : (
          Object.entries(messagesByDate).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Separador de data */}
              <div className="flex items-center justify-center mb-4">
                <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                  {date}
                </div>
              </div>
              
              {/* Mensagens do dia */}
              <div className="space-y-4">
                {(dateMessages as typeof messages).map((message) => {
                  const MessageIcon = getMessageIcon(message.from)
                  const isClient = message.from === 'human'
                  const isBot = message.from === 'agent'
                  
                  return (
                    <div key={message.id} className="flex flex-col gap-2">
                      {/* Mensagem do cliente */}
                      {isClient && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center flex-shrink-0 font-medium text-sm">
                            {getMessageTypeLabel(message.from).charAt(0)}
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
                                {message.html ? (
                                  <div dangerouslySetInnerHTML={{ __html: message.html }} />
                                ) : (
                                  <MarkdownRenderer content={message.text || ''} className="text-sm" />
                                )}
                              </div>
                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-purple-200">
                                <div className="flex items-center gap-2">
                                  {agentData?.iconUrl ? (
                                    <img 
                                      src={agentData.iconUrl} 
                                      alt={agentData.name}
                                      className="w-5 h-5 rounded-full object-cover"
                                      onError={(e) => {
                                        // Fallback para avatar com inicial se a imagem falhar
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        target.nextElementSibling?.classList.remove('hidden');
                                      }}
                                    />
                                  ) : null}
                                  <div className={`w-5 h-5 rounded-full bg-red-500 flex items-center justify-center ${agentData?.iconUrl ? 'hidden' : ''}`}>
                                    <span className="text-xs text-white font-medium">
                                      {agentData?.name?.charAt(0) || agentData?.interfaceConfig?.displayName?.charAt(0) || 'A'}
                                    </span>
                                  </div>
                                  <span className="text-xs text-purple-700 font-medium">
                                    {agentData?.interfaceConfig?.displayName || agentData?.name || 'Agente'}
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
          ))
        )}
      </div>

      {/* Campo de input para responder */}
      <div className="border-t p-4 bg-background">
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