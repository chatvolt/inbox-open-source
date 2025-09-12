"use client"

import React, { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  TrendingUp,
  BarChart3
} from 'lucide-react'
import { useAllConversationsMessages } from '@/hooks/useAllConversationsMessages'
import { useAgentsDetails } from '@/hooks/useAgentDetails'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { ConversationTimeline } from '@/components/ConversationTimeline'
import { AllConversationsMessages } from '@/components/AllConversationsMessages'

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

export function AllConversationsView() {
  const { allMessages, isLoading, conversations } = useAllConversationsMessages()
  const [activeTab, setActiveTab] = useState('timeline')

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
    if (!allMessages) return { 
      total: 0, 
      clients: 0, 
      agents: 0, 
      today: 0,
      conversations: 0,
      avgPerConversation: 0
    }
    
    const today = new Date().toDateString()
    const todayMessages = allMessages.filter(msg => 
      new Date(msg.createdAt).toDateString() === today
    )
    
    const clientMessages = allMessages.filter(msg => msg.from === 'human').length
    const agentMessages = allMessages.filter(msg => msg.from === 'assistant').length
    const totalConversations = conversations?.length || 0
    
    return {
      total: allMessages.length,
      clients: clientMessages,
      agents: agentMessages,
      today: todayMessages.length,
      conversations: totalConversations,
      avgPerConversation: totalConversations > 0 ? Math.round(allMessages.length / totalConversations) : 0
    }
  }, [allMessages, conversations])

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
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
            Todas as Conversas
          </h1>
          <p className="text-muted-foreground">
            Visualização completa de todas as mensagens e conversas do sistema
          </p>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mensagens</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <User className="h-5 w-5 text-orange-600" />
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

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Users className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Conversas</p>
                  <p className="text-2xl font-bold">{stats.conversations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Média/Conv</p>
                  <p className="text-2xl font-bold">{stats.avgPerConversation}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs para diferentes visualizações */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Lista Detalhada
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="timeline" className="mt-6">
          <ConversationTimeline />
        </TabsContent>
        
        <TabsContent value="list" className="mt-6">
          <AllConversationsMessages />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AllConversationsView