"use client"

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  MessageCircle, 
  User, 
  Bot, 
  Clock, 
  TrendingUp, 
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface Message {
  id: string
  text: string
  from: 'human' | 'agent' | 'system'
  read: boolean
  eval: 'good' | 'bad' | 'neutral' | null
  attachments: any[]
  createdAt: string
}

interface ConversationStatsProps {
  messages: Message[]
  status: 'RESOLVED' | 'UNRESOLVED' | 'HUMAN_REQUESTED'
  isAiEnabled: boolean
}

export function ConversationStats({ messages, status, isAiEnabled }: ConversationStatsProps) {
  // Calcular estatísticas
  const stats = React.useMemo(() => {
    const totalMessages = messages.length
    const humanMessages = messages.filter(m => m.from === 'human').length
    const agentMessages = messages.filter(m => m.from === 'agent').length
    const systemMessages = messages.filter(m => m.from === 'system').length
    const unreadMessages = messages.filter(m => !m.read).length
    
    // Calcular tempo de resposta médio (simplificado)
    const responseTimes: number[] = []
    for (let i = 1; i < messages.length; i++) {
      const current = messages[i]
      const previous = messages[i - 1]
      
      if (previous.from === 'human' && current.from === 'agent') {
        const responseTime = new Date(current.createdAt).getTime() - new Date(previous.createdAt).getTime()
        responseTimes.push(responseTime)
      }
    }
    
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0

    // Primeira e última mensagem
    const firstMessage = messages[0]
    const lastMessage = messages[messages.length - 1]
    
    const conversationDuration = firstMessage && lastMessage
      ? new Date(lastMessage.createdAt).getTime() - new Date(firstMessage.createdAt).getTime()
      : 0

    return {
      totalMessages,
      humanMessages,
      agentMessages,
      systemMessages,
      unreadMessages,
      avgResponseTime,
      conversationDuration,
      firstMessage,
      lastMessage
    }
  }, [messages])

  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  const formatResponseTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)

    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total de mensagens */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Mensagens</CardTitle>
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalMessages}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{stats.humanMessages}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bot className="h-3 w-3" />
              <span>{stats.agentMessages}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status da conversa */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status</CardTitle>
          {status === 'RESOLVED' ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {status === 'RESOLVED' ? 'Resolvida' : 
             status === 'UNRESOLVED' ? 'Pendente' : 
             'Humano Solicitado'}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <div className={`w-2 h-2 rounded-full ${isAiEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span>IA {isAiEnabled ? 'Ativada' : 'Desativada'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Tempo de resposta médio */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo de Resposta</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.avgResponseTime > 0 ? formatResponseTime(stats.avgResponseTime) : 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground">
            Tempo médio de resposta
          </p>
        </CardContent>
      </Card>

      {/* Duração da conversa */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Duração</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.conversationDuration > 0 ? formatDuration(stats.conversationDuration) : 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground">
            Duração total da conversa
          </p>
        </CardContent>
      </Card>

      {/* Mensagens não lidas */}
      {stats.unreadMessages > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Não Lidas</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">
              Mensagens não lidas
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ConversationStats