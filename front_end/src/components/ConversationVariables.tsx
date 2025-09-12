"use client"

import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Variable, Plus, Trash2, Copy, Check } from 'lucide-react'
import { 
  useConversationVariables, 
  useCreateConversationVariable, 
  useDeleteConversationVariable
} from '@/hooks/useConversationVariables'
// Função simples de toast (pode ser substituída por uma biblioteca como sonner)
const toast = {
  success: (message: string) => console.log('✅', message),
  error: (message: string) => console.error('❌', message),
}

interface ConversationVariablesProps {
  conversationId: string
  compact?: boolean
}

export function ConversationVariables({ conversationId, compact = false }: ConversationVariablesProps) {
  const { data: variables, isLoading, error } = useConversationVariables(conversationId)
  const createVariable = useCreateConversationVariable()
  const deleteVariable = useDeleteConversationVariable()
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newVarName, setNewVarName] = useState('')
  const [newVarValue, setNewVarValue] = useState('')
  const [copiedVar, setCopiedVar] = useState<string | null>(null)

  const handleCreateVariable = async () => {
    if (!newVarName.trim() || !newVarValue.trim()) {
      toast.error('Nome e valor da variável são obrigatórios')
      return
    }

    try {
      await createVariable.mutateAsync({
        conversationId,
        varName: newVarName.trim(),
        varValue: newVarValue.trim(),
      })
      
      setNewVarName('')
      setNewVarValue('')
      setIsCreateDialogOpen(false)
      toast.success('Variável criada com sucesso')
    } catch (error) {
      toast.error('Erro ao criar variável')
    }
  }

  const handleDeleteVariable = async (varName: string) => {
    try {
      await deleteVariable.mutateAsync({ conversationId, varName })
      toast.success('Variável deletada com sucesso')
    } catch (error) {
      toast.error('Erro ao deletar variável')
    }
  }

  const handleCopyValue = async (value: string, varName: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedVar(varName)
      setTimeout(() => setCopiedVar(null), 2000)
      toast.success('Valor copiado para a área de transferência')
    } catch (error) {
      toast.error('Erro ao copiar valor')
    }
  }

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Variable className="h-4 w-4" />
            <span className="text-sm font-medium">Variáveis ({variables?.length || 0})</span>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Variável</DialogTitle>
                <DialogDescription>
                  Criar uma nova variável customizada para esta conversa
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="varName">Nome da Variável</Label>
                  <Input
                    id="varName"
                    value={newVarName}
                    onChange={(e) => setNewVarName(e.target.value)}
                    placeholder="Ex: nome, email, telefone"
                  />
                </div>
                <div>
                  <Label htmlFor="varValue">Valor</Label>
                  <Input
                    id="varValue"
                    value={newVarValue}
                    onChange={(e) => setNewVarValue(e.target.value)}
                    placeholder="Valor da variável"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleCreateVariable}
                  disabled={createVariable.isPending}
                >
                  {createVariable.isPending ? 'Criando...' : 'Criar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        )}
        
        {variables && variables.length > 0 && (
          <div className="space-y-1">
            {variables.map((variable) => (
              <div key={variable.varName} className="flex items-center justify-between p-2 bg-muted rounded text-xs">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Badge variant="outline" className="text-xs">
                    {variable.varName}
                  </Badge>
                  <span className="truncate">{variable.varValue}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleCopyValue(variable.varValue, variable.varName)}
                  >
                    {copiedVar === variable.varName ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Deletar Variável</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja deletar a variável "{variable.varName}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteVariable(variable.varName)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Deletar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {variables && variables.length === 0 && (
          <p className="text-xs text-muted-foreground">Nenhuma variável definida</p>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Variable className="h-5 w-5" />
              Variáveis da Conversa
            </CardTitle>
            <CardDescription>
              Variáveis customizadas armazenadas para esta conversa
            </CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Variável
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Variável</DialogTitle>
                <DialogDescription>
                  Criar uma nova variável customizada para esta conversa
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="varName">Nome da Variável</Label>
                  <Input
                    id="varName"
                    value={newVarName}
                    onChange={(e) => setNewVarName(e.target.value)}
                    placeholder="Ex: nome, email, telefone"
                  />
                </div>
                <div>
                  <Label htmlFor="varValue">Valor</Label>
                  <Input
                    id="varValue"
                    value={newVarValue}
                    onChange={(e) => setNewVarValue(e.target.value)}
                    placeholder="Valor da variável"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleCreateVariable}
                  disabled={createVariable.isPending}
                >
                  {createVariable.isPending ? 'Criando...' : 'Criar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        )}
        
        {error && (
          <div className="text-center py-8">
            <p className="text-sm text-destructive">Erro ao carregar variáveis</p>
          </div>
        )}
        
        {variables && variables.length === 0 && (
          <div className="text-center py-8">
            <Variable className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              Nenhuma variável definida para esta conversa
            </p>
          </div>
        )}
        
        {variables && variables.length > 0 && (
          <div className="space-y-3">
            {variables.map((variable) => (
              <div key={variable.varName} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">
                      {variable.varName}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground break-all">
                    {variable.varValue}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyValue(variable.varValue, variable.varName)}
                  >
                    {copiedVar === variable.varName ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Deletar Variável</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja deletar a variável "{variable.varName}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteVariable(variable.varName)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Deletar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ConversationVariables