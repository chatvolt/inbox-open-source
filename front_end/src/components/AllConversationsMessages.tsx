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
  Download
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

export function AllConversationsMessages() {
  const { allMessages, isLoading, conversations } = useAllConversationsMessages()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messageTypeFilter, setMessageTypeFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'conversation'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Buscar informações dos agentes únicos
  const uniqueAgentIds = useMemo(() => {
    if (!allMessages) return []
    const agentIds = allMessages
      .map(msg => msg.conversationInfo.agentId)
      .filter((id): id is string => !!id)
    return [...new Set(agentIds)]
  }, [allMessages])

  const { data: agentsData } = useAgentsDetails(uniqueAgentIds)

  // Filtrar e ordenar mensagens
  const filteredMessages = useMemo(() => {
    let filtered = allMessages

    // Filtro por conversa específica
    if (selectedConversation) {
      filtered = filtered.filter(msg => msg.conversationInfo.id === selectedConversation)
    }

    // Filtro por tipo de mensagem
    if (messageTypeFilter !== 'all') {
      filtered = filtered.filter(msg => msg.from === messageTypeFilter)
    }

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(msg => 
        msg.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getContactName(msg.conversationInfo).toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Ordenação
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
      } else {
        const nameA = getContactName(a.conversationInfo)
        const nameB = getContactName(b.conversationInfo)
        const comparison = nameA.localeCompare(nameB)
        return sortOrder === 'desc' ? -comparison : comparison
      }
    })

    return filtered
  }, [allMessages, selectedConversation, messageTypeFilter, searchTerm, sortBy, sortOrder])

  const exportMessages = () => {
    const csvContent = [
      ['Data', 'Conversa', 'Tipo', 'Remetente', 'Mensagem', 'Canal', 'Status'].join(','),
      ...filteredMessages.map(msg => {
        const agentInfo = msg.conversationInfo.agentId ? agentsData?.[msg.conversationInfo.agentId] : null
        return [
          formatMessageTime(msg.createdAt),
          getContactName(msg.conversationInfo),
          getMessageTypeLabel(msg.from),
          msg.from === 'human' ? getContactName(msg.conversationInfo) : (agentInfo?.interfaceConfig?.displayName || agentInfo?.name || 'Sistema'),
          `"${msg.text.replace(/"/g, '""')}"`,
          msg.conversationInfo.channel,
          msg.conversationInfo.status
        ].join(',')
      })
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `mensagens_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="h-6 w-6" />
            Todas as Mensagens
          </h1>
          <p className="text-muted-foreground">
            {filteredMessages.length} mensagens encontradas
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={exportMessages} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
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

            {/* Conversa específica */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Conversa</label>
              <Select value={selectedConversation || 'all'} onValueChange={(value) => setSelectedConversation(value === 'all' ? null : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as conversas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as conversas</SelectItem>
                  {conversations?.map(conv => (
                    <SelectItem key={conv.id} value={conv.id}>
                      {getContactName(conv)} ({conv.channel})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de mensagem */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={messageTypeFilter} onValueChange={setMessageTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="human">Cliente</SelectItem>
                  <SelectItem value="assistant">Assistente</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ordenação */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Ordenar por</label>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={(value: 'date' | 'conversation') => setSortBy(value)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Data</SelectItem>
                    <SelectItem value="conversation">Conversa</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de mensagens */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
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
          filteredMessages.map((message) => {
            const MessageIcon = getMessageIcon(message.from)
            const isClient = message.from === 'human'
            const isBot = message.from === 'assistant'
            const contactName = getContactName(message.conversationInfo)

            return (
              <Card key={message.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Sidebar com informações da conversa */}
                    <div className="w-64 bg-muted/30 p-4 border-r">
                      <div className="space-y-3">
                        <div>
                          <p className="font-medium text-sm">{contactName}</p>
                          <p className="text-xs text-muted-foreground">
                            {message.conversationInfo.channel}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {message.conversationInfo.status === 'RESOLVED' ? 'Resolvida' : 'Pendente'}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {message.conversationInfo.priority}
                          </Badge>
                        </div>

                        {message.conversationInfo.agentId && agentsData?.[message.conversationInfo.agentId] && (
                          <div className="flex items-center gap-2">
                            {agentsData[message.conversationInfo.agentId].iconUrl ? (
                              <img 
                                src={agentsData[message.conversationInfo.agentId].iconUrl} 
                                alt={agentsData[message.conversationInfo.agentId].name}
                                className="w-4 h-4 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                <span className="text-xs font-medium">
                                  {agentsData[message.conversationInfo.agentId].name?.charAt(0) || 'A'}
                                </span>
                              </div>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {agentsData[message.conversationInfo.agentId].interfaceConfig?.displayName || agentsData[message.conversationInfo.agentId].name}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatMessageTime(message.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Conteúdo da mensagem */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isClient 
                            ? 'bg-orange-500 text-white' 
                            : isBot
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-500 text-white'
                        }`}>
                          <MessageIcon className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-sm">
                              {getMessageTypeLabel(message.from)}
                            </span>
                            {message.eval && (
                              <Badge 
                                variant={message.eval === 'good' ? 'default' : message.eval === 'bad' ? 'destructive' : 'secondary'} 
                                className="text-xs"
                              >
                                {message.eval}
                              </Badge>
                            )}
                            {!message.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                          
                          <div className="prose prose-sm max-w-none">
                            {message.html ? (
                              <div dangerouslySetInnerHTML={{ __html: message.html }} />
                            ) : (
                              <MarkdownRenderer content={message.text} className="text-sm" />
                            )}
                          </div>

                          {message.usageCredits > 0 && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              {message.usageCredits} créditos utilizados
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

export default AllConversationsMessages