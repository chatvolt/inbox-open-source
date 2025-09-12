"use client"

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Bot, Globe, Lock, Thermometer, Brain } from 'lucide-react'
import { useAgentDetails, type Agent } from '@/hooks/useAgentDetails'

interface AgentInfoProps {
  agentId: string
  compact?: boolean
}

interface AgentCardProps {
  agent: Agent
  compact?: boolean
}

function AgentCard({ agent, compact = false }: AgentCardProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
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
          <h3 className="font-medium text-sm truncate">
            {agent.interfaceConfig?.displayName || agent.name}
          </h3>
          {agent.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {agent.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {agent.modelName}
            </Badge>
            <Badge variant={agent.visibility === 'public' ? 'default' : 'secondary'} className="text-xs">
              {agent.visibility === 'public' ? (
                <><Globe className="h-3 w-3 mr-1" />Público</>
              ) : (
                <><Lock className="h-3 w-3 mr-1" />Privado</>
              )}
            </Badge>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          {agent.iconUrl ? (
            <img 
              src={agent.iconUrl} 
              alt={agent.name}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
              <Bot className="h-6 w-6" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">
              {agent.interfaceConfig?.displayName || agent.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={agent.visibility === 'public' ? 'default' : 'secondary'} className="text-xs">
                {agent.visibility === 'public' ? (
                  <><Globe className="h-3 w-3 mr-1" />Público</>
                ) : (
                  <><Lock className="h-3 w-3 mr-1" />Privado</>
                )}
              </Badge>
            </div>
          </div>
        </div>
        {agent.description && (
          <CardDescription className="mt-2">
            {agent.description}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Configurações do modelo */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Configurações
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Modelo:</span>
              <Badge variant="outline" className="ml-2 text-xs">
                {agent.modelName}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Temperatura:</span>
              <div className="flex items-center gap-1">
                <Thermometer className="h-3 w-3" />
                <span className="font-mono text-xs">{agent.temperature}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ferramentas */}
        {agent.tools && agent.tools.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Ferramentas ({agent.tools.length})</h4>
            <div className="flex flex-wrap gap-1">
              {agent.tools.slice(0, 5).map((tool, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tool.type || 'Ferramenta'}
                </Badge>
              ))}
              {agent.tools.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{agent.tools.length - 5} mais
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Links sociais */}
        {agent.interfaceConfig && Object.entries(agent.interfaceConfig).some(([key, value]) => 
          key.includes('URL') && value
        ) && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Links</h4>
            <div className="flex flex-wrap gap-1">
              {Object.entries(agent.interfaceConfig).map(([key, value]) => {
                if (!key.includes('URL') || !value) return null
                const platform = key.replace('URL', '').toLowerCase()
                return (
                  <Badge key={key} variant="outline" className="text-xs">
                    {platform}
                  </Badge>
                )
              })}
            </div>
          </div>
        )}

        {/* Data de criação */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Criado em {new Date(agent.createdAt).toLocaleDateString('pt-BR')}
        </div>
      </CardContent>
    </Card>
  )
}

export function AgentInfo({ agentId, compact = false }: AgentInfoProps) {
  const { data: agent, isLoading, error } = useAgentDetails(agentId)

  if (isLoading) {
    return (
      <div className={`${compact ? 'flex items-center gap-3 p-3' : 'space-y-3 p-4'}`}>
        <Skeleton className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} rounded-full flex-shrink-0`} />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
          {!compact && (
            <>
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-36" />
            </>
          )}
        </div>
      </div>
    )
  }

  if (error || !agent) {
    return (
      <div className="flex items-center gap-3 p-3 text-muted-foreground">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <Bot className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm">Agente não encontrado</p>
          <p className="text-xs">ID: {agentId}</p>
        </div>
      </div>
    )
  }

  return <AgentCard agent={agent} compact={compact} />
}

export default AgentInfo