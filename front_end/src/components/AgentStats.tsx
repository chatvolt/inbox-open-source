"use client"

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, MessageCircle, TrendingUp } from 'lucide-react'
import { type Agent } from '@/hooks/useAgentDetails'
import { type Conversation } from './CardConversation/types'

interface AgentStatsProps {
  agents: Record<string, Agent>
  conversations: Conversation[]
}

export function AgentStats({ agents, conversations }: AgentStatsProps) {
  // Calcular estatísticas por agente
  const agentStats = React.useMemo(() => {
    const stats: Record<string, {
      agent: Agent
      totalConversations: number
      activeConversations: number
      unreadMessages: number
      avgResponseTime?: number
    }> = {}

    Object.entries(agents).forEach(([agentId, agent]) => {
      const agentConversations = conversations.filter(conv => conv.agentId === agentId)
      
      stats[agentId] = {
        agent,
        totalConversations: agentConversations.length,
        activeConversations: agentConversations.filter(conv => conv.status === 'UNRESOLVED').length,
        unreadMessages: agentConversations.reduce((sum, conv) => sum + (conv.unreadMessagesCount || 0), 0),
      }
    })

    return stats
  }, [agents, conversations])

  const sortedStats = Object.entries(agentStats).sort(([, a], [, b]) => 
    b.totalConversations - a.totalConversations
  )

  if (sortedStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Estatísticas dos Agentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhum agente encontrado
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Bot className="h-4 w-4" />
          Estatísticas dos Agentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedStats.map(([agentId, stats]) => (
          <div key={agentId} className="flex items-center gap-3 p-2 rounded-lg border bg-card/50">
            {stats.agent.iconUrl ? (
              <img 
                src={stats.agent.iconUrl} 
                alt={stats.agent.name}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium">
                  {stats.agent.name?.charAt(0) || 'A'}
                </span>
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm truncate">
                  {stats.agent.interfaceConfig?.displayName || stats.agent.name}
                </span>
                {stats.unreadMessages > 0 && (
                  <Badge variant="destructive" className="text-xs h-4 px-1">
                    {stats.unreadMessages}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  <span>{stats.totalConversations}</span>
                </div>
                
                {stats.activeConversations > 0 && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>{stats.activeConversations} ativas</span>
                  </div>
                )}
                
                <Badge variant="outline" className="text-xs h-4 px-1">
                  {stats.agent.modelName}
                </Badge>
              </div>
            </div>
          </div>
        ))}
        
        {/* Resumo geral */}
        <div className="pt-2 border-t text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Total de agentes:</span>
            <span className="font-medium">{sortedStats.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Conversas ativas:</span>
            <span className="font-medium">
              {sortedStats.reduce((sum, [, stats]) => sum + stats.activeConversations, 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Mensagens não lidas:</span>
            <span className="font-medium">
              {sortedStats.reduce((sum, [, stats]) => sum + stats.unreadMessages, 0)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AgentStats