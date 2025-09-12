"use client"

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
    Smile,
    Frown,
    Meh,
    TrendingUp,
    MessageSquare,
    Hash,
    Clock
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

interface ConversationAnalysisProps {
    messages: Message[]
}

// Função simples para análise de sentimento baseada em palavras-chave
function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['obrigado', 'obrigada', 'ótimo', 'excelente', 'bom', 'legal', 'perfeito', 'ajudou', 'resolveu', '😊', '😄', '👍', '✨']
    const negativeWords = ['problema', 'erro', 'ruim', 'péssimo', 'não funciona', 'bug', 'falha', 'irritado', '😞', '😠', '👎']

    const lowerText = text.toLowerCase()

    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length

    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
}

// Função para extrair palavras-chave
function extractKeywords(text: string): string[] {
    const commonWords = ['o', 'a', 'de', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não', 'uma', 'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'foi', 'ao', 'ele', 'das', 'tem', 'à', 'seu', 'sua', 'ou', 'ser', 'quando', 'muito', 'há', 'nos', 'já', 'está', 'eu', 'também', 'só', 'pelo', 'pela', 'até', 'isso', 'ela', 'entre', 'era', 'depois', 'sem', 'mesmo', 'aos', 'ter', 'seus', 'suas', 'numa', 'pelos', 'pelas', 'esse', 'eles', 'essa', 'num', 'nem', 'suas', 'meu', 'às', 'minha', 'têm', 'numa', 'pelos', 'pelas', 'sua', 'seu', 'dela', 'dele', 'outros', 'qual', 'nos', 'lhe', 'deles', 'essas', 'esses', 'pelas', 'este', 'fosse', 'dele', 'aí', 'este', 'aquela', 'aquele', 'foram', 'pode', 'quem', 'onde', 'bem', 'ela', 'seu', 'sua', 'aqui', 'sido', 'cada', 'vez', 'vocês', 'nós', 'te', 'você', 'me', 'mim', 'protocolo']

    const words = text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3 && !commonWords.includes(word))

    const wordCount: Record<string, number> = {}
    words.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1
    })

    return Object.entries(wordCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([word]) => word)
}

export function ConversationAnalysis({ messages }: ConversationAnalysisProps) {
    const analysis = React.useMemo(() => {
        const humanMessages = messages.filter(m => m.from === 'human')
        const agentMessages = messages.filter(m => m.from === 'agent')

        // Análise de sentimento
        const sentiments = messages.map(m => ({
            ...m,
            sentiment: analyzeSentiment(m.text)
        }))

        const sentimentCounts = {
            positive: sentiments.filter(m => m.sentiment === 'positive').length,
            negative: sentiments.filter(m => m.sentiment === 'negative').length,
            neutral: sentiments.filter(m => m.sentiment === 'neutral').length
        }

        // Palavras-chave mais frequentes
        const allText = messages.map(m => m.text).join(' ')
        const keywords = extractKeywords(allText)

        // Análise temporal
        const messagesByHour: Record<number, number> = {}
        messages.forEach(m => {
            const hour = new Date(m.createdAt).getHours()
            messagesByHour[hour] = (messagesByHour[hour] || 0) + 1
        })

        const peakHour = Object.entries(messagesByHour)
            .sort(([, a], [, b]) => b - a)[0]

        // Comprimento médio das mensagens
        const avgMessageLength = {
            human: humanMessages.length > 0
                ? humanMessages.reduce((sum, m) => sum + m.text.length, 0) / humanMessages.length
                : 0,
            agent: agentMessages.length > 0
                ? agentMessages.reduce((sum, m) => sum + m.text.length, 0) / agentMessages.length
                : 0
        }

        return {
            sentimentCounts,
            keywords,
            peakHour: peakHour ? { hour: parseInt(peakHour[0]), count: peakHour[1] } : null,
            avgMessageLength,
            totalCharacters: allText.length
        }
    }, [messages])

    const totalMessages = messages.length
    const sentimentTotal = analysis.sentimentCounts.positive + analysis.sentimentCounts.negative + analysis.sentimentCounts.neutral

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Análise da Conversa
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Análise de Sentimento */}
                    <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Análise de Sentimento
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Smile className="h-4 w-4 text-green-500" />
                                    <span className="text-sm">Positivo</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{analysis.sentimentCounts.positive}</span>
                                    <Progress
                                        value={sentimentTotal > 0 ? (analysis.sentimentCounts.positive / sentimentTotal) * 100 : 0}
                                        className="w-20 h-2"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Meh className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm">Neutro</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{analysis.sentimentCounts.neutral}</span>
                                    <Progress
                                        value={sentimentTotal > 0 ? (analysis.sentimentCounts.neutral / sentimentTotal) * 100 : 0}
                                        className="w-20 h-2"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Frown className="h-4 w-4 text-red-500" />
                                    <span className="text-sm">Negativo</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{analysis.sentimentCounts.negative}</span>
                                    <Progress
                                        value={sentimentTotal > 0 ? (analysis.sentimentCounts.negative / sentimentTotal) * 100 : 0}
                                        className="w-20 h-2"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Palavras-chave */}
                    <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Hash className="h-4 w-4" />
                            Palavras-chave Principais
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {analysis.keywords.map((keyword, index) => (
                                <Badge key={keyword} variant="outline" className="text-xs">
                                    #{keyword}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Estatísticas adicionais */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <div className="font-medium text-muted-foreground">Horário de Pico</div>
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {analysis.peakHour ? `${analysis.peakHour.hour}:00 (${analysis.peakHour.count} msgs)` : 'N/A'}
                            </div>
                        </div>

                        <div>
                            <div className="font-medium text-muted-foreground">Total de Caracteres</div>
                            <div>{analysis.totalCharacters.toLocaleString()}</div>
                        </div>

                        <div>
                            <div className="font-medium text-muted-foreground">Média Cliente</div>
                            <div>{Math.round(analysis.avgMessageLength.human)} chars/msg</div>
                        </div>

                        <div>
                            <div className="font-medium text-muted-foreground">Média Agente</div>
                            <div>{Math.round(analysis.avgMessageLength.agent)} chars/msg</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ConversationAnalysis