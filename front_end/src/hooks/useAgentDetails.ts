import { useQuery } from '@tanstack/react-query'

export interface Agent {
  id: string
  name: string
  description: string | null
  iconUrl?: string
  modelName: string
  temperature: number
  visibility: 'public' | 'private'
  systemPrompt: string | null
  enableInactiveHours: boolean | null
  inactiveHours: Record<string, any> | null
  interfaceConfig: {
    displayName?: string
    initialMessages?: string[]
    githubURL?: string
    tiktokURL?: string
    twitterURL?: string
    websiteURL?: string
    youtubeURL?: string
    instagramURL?: string
    isBrandingDisabled?: boolean
    isInitMessagePopupDisabled?: boolean
  }
  tools: Array<Record<string, any>>
  organizationId: string
  createdAt: string
  updatedAt: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function fetchAgentDetails(agentId: string): Promise<Agent> {
  const response = await fetch(`${API_BASE_URL}/agents/${agentId}`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch agent details: ${response.statusText}`)
  }
  
  return response.json()
}

export function useAgentDetails(agentId: string | null | undefined) {
  return useQuery({
    queryKey: ['agent', agentId],
    queryFn: () => fetchAgentDetails(agentId!),
    enabled: !!agentId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

// Hook para buscar múltiplos agentes
export function useAgentsDetails(agentIds: string[]) {
  return useQuery({
    queryKey: ['agents', agentIds],
    queryFn: async () => {
      const promises = agentIds.map(id => fetchAgentDetails(id))
      const results = await Promise.allSettled(promises)
      
      return results.reduce((acc, result, index) => {
        if (result.status === 'fulfilled') {
          acc[agentIds[index]] = result.value
        }
        return acc
      }, {} as Record<string, Agent>)
    },
    enabled: agentIds.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}