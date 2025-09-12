"use client"

import React, { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  MessageCircle, 
  User, 
  Bot, 
  Settings, 
  Search, 
  Filter,
  Clock,
  ArrowUpDown,
  Download,
  Calendar,
  Users,
  TrendingUp
} from 'lucide-react'
import { useAllConversationsMessages } from '@/hooks/useAllConversationsMessages'
import { useAgentsDetails } from '@/hooks/useAgentDetails'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'

function formatMessageTime(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleString('pt-BR', { 
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
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
      return 'Assistente'
    case 'system':
      return 'Sistema'
    default:
      return from
  }
}
function getContactName(conversationInfo: any): string {
  if (!conversationInfo) return 'Usuário Desconhecido';
  
  if (conversationInfo.participantsContacts && conversationInfo.participantsContacts.length > 0) {
    const firstName = conversationInfo.participantsContacts[0].firstName;
    if (firstName) return firstName;
  }

  if (conversationInfo.aiUserIdentifier) {
    return conversationInfo.aiUserIdentifier;
  }

  if (conversationInfo.id) {
    const lastThreeChars = conversationInfo.id.slice(-3).toUpperCase();
    return `Visitante #${lastThreeChars}`;
  }

  return 'Usuário Desconhecido';
}

export function ConversationTimeline() {
  const { allMessages, isLoading, conversations } = useAllConversationsMessages()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState<string>('all')

  // Buscar informações dos agentes únicos
  const uniqueAgentIds = useMemo(() => {
    if (!allMessages) return []
    const agentIds = allMessages
      .map(msg => msg.conversationInfo.agentId)
      .filter((id): id is string => !!id)
    return [...new Set(agentIds)]
  }, [allMessages])

  const { data: agentsData } = useAgentsDetails(uniqueAgentIds)

  // Estatísticas gerais
  const stats = useMemo(() => {
    if (!allMessages) return { total: 0, clients: 0, agents: 0, today: 0 }
    
    const today = new Date().toDateString()
    const todayMessages = allMessages.filter(msg => 
      new Date(msg.createdAt).toDateString() === today
    )
    
    return {
      total: allMessages.length,
      clients: allMessages.filter(msg => msg.from === 'human').length,
      agents: allMessages.filter(msg => msg.from === 'assistant').length,
      today: todayMessages.length
    }
  }, [allMessages])

  // Canais únicos
  const uniqueChannels = useMemo(() => {
    if (!allMessages) return []
    const channels = allMessages
      .map(msg => msg.conversationInfo.channel)
      .filter(Boolean)
    return [...new Set(channels)]
  }, [allMessages])

  // Filtrar mensagens
  const filteredMessages = useMemo(() => {
    let filtered = allMessages || []

    // Filtro por agente
    if (selectedAgent) {
      filtered = filtered.filter(msg => msg.conversationInfo.agentId === selectedAgent)
    }

    // Filtro por canal
    if (selectedChannel) {
      filtered = filtered.filter(msg => msg.conversationInfo.channel === selectedChannel)
    }

    // Filtro por data
    if (dateFilter !== 'all') {
      const now = new Date()
      let startDate = new Date()
      
      switch (dateFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          startDate.setDate(now.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(now.getMonth() - 1)
          break
      }
      
      filtered = filtered.filter(msg => 
        new Date(msg.createdAt) >= startDate
      )
    }

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(msg => 
        msg.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getContactName(msg.conversationInfo).toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [allMessages, selectedAgent, selectedChannel, dateFilter, searchTerm])

  // Agrupar mensagens por data
  const messagesByDate = useMemo(() => {
    const groups: Record<string, typeof filteredMessages> = {}
    
    filteredMessages.forEach(message => {
      const date = formatMessageDate(message.createdAt)
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })
    
    return groups
  }, [filteredMessages])

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header com estatísticas */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageCircle className="h-8 w-8" />
            Timeline de Conversas
          </h1>
          <p className="text-muted-foreground">
            Visualização cronológica de todas as mensagens
          </p>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Clientes</p>
                  <p className="text-2xl font-bold">{stats.clients}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Bot className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Agentes</p>
                  <p className="text-2xl font-bold">{stats.agents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hoje</p>
                  <p className="text-2xl font-bold">{stats.today}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar mensagens..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Agente */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Agente</label>
              <Select value={selectedAgent || 'all'} onValueChange={(value) => setSelectedAgent(value === 'all' ? null : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os agentes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os agentes</SelectItem>
                  {uniqueAgentIds.map(agentId => (
                    <SelectItem key={agentId} value={agentId}>
                      {agentsData?.[agentId]?.interfaceConfig?.displayName || agentsData?.[agentId]?.name || agentId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Canal */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Canal</label>
              <Select value={selectedChannel || 'all'} onValueChange={(value) => setSelectedChannel(value === 'all' ? null : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os canais" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os canais</SelectItem>
                  {uniqueChannels.map(channel => (
                    <SelectItem key={channel} value={channel}>
                      {channel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Período */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os períodos</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mês</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline de mensagens */}
      <div className="space-y-6">
        {Object.keys(messagesByDate).length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                Nenhuma mensagem encontrada
              </p>
              <p className="text-sm text-muted-foreground">
                Tente ajustar os filtros para ver mais resultados
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(messagesByDate).map(([date, dateMessages]) => (
            <div key={date} className="space-y-4">
              {/* Separador de data */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">{date}</span>
                  <Badge variant="secondary" className="ml-2">
                    {dateMessages.length} mensagens
                  </Badge>
                </div>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Mensagens do dia */}
              <div className="space-y-3 pl-4 border-l-2 border-muted">
                {dateMessages.map((message, index) => {
                  const MessageIcon = getMessageIcon(message.from)
                  const isClient = message.from === 'human'
                  const isBot = message.from === 'assistant'
                  const contactName = getContactName(message.conversationInfo)
                  const agentInfo = message.conversationInfo.agentId ? agentsData?.[message.conversationInfo.agentId] : null

                  return (
                    <div key={message.id} className="relative">
                      {/* Indicador na timeline */}
                      <div className="absolute -left-6 top-4 w-3 h-3 rounded-full bg-background border-2 border-primary" />
                      
                      <Card className="ml-4">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isClient 
                                ? 'bg-orange-500 text-white' 
                                : isBot
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-500 text-white'
                            }`}>
                              <MessageIcon className="h-5 w-5" />
                            </div>

                            {/* Conteúdo */}
                            <div className="flex-1 min-w-0">
                              {/* Header da mensagem */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {isClient ? contactName : (agentInfo?.interfaceConfig?.displayName || agentInfo?.name || 'Sistema')}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {getMessageTypeLabel(message.from)}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {message.conversationInfo.channel}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {formatMessageTime(message.createdAt)}
                                </div>
                              </div>

                              {/* Conteúdo da mensagem */}
                              <div className="prose prose-sm max-w-none">
                                {message.html ? (
                                  <div dangerouslySetInnerHTML={{ __html: message.html }} />
                                ) : (
                                  <MarkdownRenderer content={message.text} className="text-sm" />
                                )}
                              </div>

                              {/* Footer da mensagem */}
                              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                                <div className="flex items-center gap-2">
                                  {message.eval && (
                                    <Badge 
                                      variant={message.eval === 'good' ? 'default' : message.eval === 'bad' ? 'destructive' : 'secondary'} 
                                      className="text-xs"
                                    >
                                      {message.eval}
                                    </Badge>
                                  )}
                                  {!message.read && (
                                    <Badge variant="destructive" className="text-xs">
                                      Não lida
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {message.conversationInfo.status === 'RESOLVED' ? 'Resolvida' : 'Pendente'}
                                  </Badge>
                                </div>
                                {message.usageCredits > 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    {message.usageCredits} créditos
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ConversationTimeline