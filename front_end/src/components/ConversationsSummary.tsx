"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  MessageCircle, 
  User, 
  Bot, 
  Users,
  TrendingUp,
  BarChart3,
  Clock
} from 'lucide-react'
import { useAllConversationsMessages } from '@/hooks/useAllConversationsMessages'

export function ConversationsSummary() {
  const { allMessages, isLoading, conversations } = useAllConversationsMessages()

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    )
  }

  const stats = {
    totalMessages: allMessages?.length || 0,
    clientMessages: allMessages?.filter(msg => msg.from === 'human').length || 0,
    agentMessages: allMessages?.filter(msg => msg.from === 'agent').length || 0,
    totalConversations: conversations?.length || 0,
    todayMessages: allMessages?.filter(msg => {
      const today = new Date().toDateString()
      return new Date(msg.createdAt).toDateString() === today
    }).length || 0,
    avgPerConversation: conversations?.length ? Math.round((allMessages?.length || 0) / conversations.length) : 0
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MessageCircle className="h-8 w-8" />
          Resumo das Conversas
        </h1>
        <p className="text-muted-foreground">
          Visão geral de todas as mensagens e conversas do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Mensagens</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMessages}</div>
            <p className="text-xs text-muted-foreground">
              Todas as mensagens do sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens de Clientes</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clientMessages}</div>
            <p className="text-xs text-muted-foreground">
              Mensagens enviadas pelos clientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens de Agentes</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.agentMessages}</div>
            <p className="text-xs text-muted-foreground">
              Respostas dos agentes/assistentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Conversas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConversations}</div>
            <p className="text-xs text-muted-foreground">
              Conversas ativas no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayMessages}</div>
            <p className="text-xs text-muted-foreground">
              Mensagens enviadas hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média por Conversa</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgPerConversation}</div>
            <p className="text-xs text-muted-foreground">
              Mensagens por conversa
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista simples das últimas mensagens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Últimas Mensagens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allMessages?.slice(0, 10).map((message) => (
              <div key={message.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.from === 'human' 
                    ? 'bg-orange-500 text-white' 
                    : message.from === 'assistant'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-500 text-white'
                }`}>
                  {message.from === 'human' ? (
                    <User className="h-4 w-4" />
                  ) : message.from === 'assistant' ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <MessageCircle className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {message.from === 'human' ? 'Cliente' : message.from === 'assistant' ? 'Agente' : 'Sistema'}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {message.conversationInfo.channel}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.createdAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm line-clamp-2">{message.text}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ConversationsSummary