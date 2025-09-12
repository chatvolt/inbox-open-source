"use client"

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Bot, Zap, Brain } from 'lucide-react'
import { useAgentDetails, type Agent } from '@/hooks/useAgentDetails'

interface AgentCardProps {
  agentId: string | null | undefined
  variant?: 'default' | 'compact' | 'minimal'
  showModel?: boolean
  showDescription?: boolean
}

interface AgentDisplayProps {
  agent: Agent
  variant: 'default' | 'compact' | 'minimal'
  showModel: boolean
  showDescription: boolean
}

function AgentDisplay({ agent, variant, showModel, showDescription }: AgentDisplayProps) {
  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-2">
        {agent.iconUrl ? (
          <img 
            src={agent.iconUrl} 
            alt={agent.name}
            className="w-4 h-4 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium" style={{ fontSize: '10px' }}>
              {agent.name?.charAt(0) || 'A'}
            </span>
          </div>
        )}
        <span className="text-sm font-medium truncate">
          {agent.interfaceConfig?.displayName || agent.name}
        </span>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
        {agent.iconUrl ? (
          <img 
            src={agent.iconUrl} 
            alt={agent.name}
            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium">
              {agent.name?.charAt(0) || 'A'}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">
            {agent.interfaceConfig?.displayName || agent.name}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span>Assistente IA</span>
            {showModel && (
              <Badge variant="outline" className="text-xs h-4 px-1">
                {agent.modelName}
              </Badge>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className="flex items-start gap-3 p-3 bg-card rounded-lg border">
      {agent.iconUrl ? (
        <img 
          src={agent.iconUrl} 
          alt={agent.name}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
          <Bot className="h-5 w-5" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-base truncate">
            {agent.interfaceConfig?.displayName || agent.name}
          </h3>
          <Badge variant="secondary" className="text-xs">
            <Brain className="h-3 w-3 mr-1" />
            IA
          </Badge>
        </div>
        
        {showDescription && agent.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {agent.description}
          </p>
        )}
        
        <div className="flex items-center gap-2 flex-wrap">
          {showModel && (
            <Badge variant="outline" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              {agent.modelName}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            Temp: {agent.temperature}
          </Badge>
          {agent.tools && agent.tools.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {agent.tools.length} ferramentas
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

export function AgentCard({ 
  agentId, 
  variant = 'default', 
  showModel = true, 
  showDescription = false 
}: AgentCardProps) {
  const { data: agent, isLoading, error } = useAgentDetails(agentId)

  if (!agentId) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
          <Bot className="h-3 w-3" />
        </div>
        <span className="text-sm">Nenhum agente atribuído</span>
      </div>
    )
  }

  if (isLoading) {
    if (variant === 'minimal') {
      return (
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4 rounded-full" />
          <Skeleton className="w-20 h-4" />
        </div>
      )
    }

    if (variant === 'compact') {
      return (
        <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
          <Skeleton className="w-6 h-6 rounded-full" />
          <div className="flex-1">
            <Skeleton className="w-24 h-4 mb-1" />
            <Skeleton className="w-16 h-3" />
          </div>
        </div>
      )
    }

    return (
      <div className="flex items-start gap-3 p-3 bg-card rounded-lg border">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="w-32 h-5 mb-2" />
          <Skeleton className="w-48 h-4 mb-2" />
          <div className="flex gap-2">
            <Skeleton className="w-16 h-5" />
            <Skeleton className="w-20 h-5" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !agent) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
          <Bot className="h-3 w-3" />
        </div>
        <span className="text-sm">Agente não encontrado</span>
      </div>
    )
  }

  return (
    <AgentDisplay 
      agent={agent} 
      variant={variant} 
      showModel={showModel} 
      showDescription={showDescription} 
    />
  )
}

export default AgentCard