"use client"

import * as React from "react"
import { Inbox, Send, MessageCircle, AlertCircle, CheckCircle2, Mail, User, List } from "lucide-react"
import { type Conversation as ConversationType } from "./CardConversation/types"

import { NavUser } from "@/components/nav-user"
import { ThemeToggle } from "@/components/theme-toggle"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarInput,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useConversationsList } from "@/hooks/useConversationsList"
import { useConversationStore } from "@/stores/conversationStore"
import { useAgentsDetails } from "@/hooks/useAgentDetails"
import { AgentCard } from "@/components/AgentCard"
import "@/styles/sidebar.css"

// Navigation items personalizados para conversas
const navMain = [
    {
        title: "Todas conversas",
        url: "#",
        icon: Inbox,
        isActive: true,
        filter: null,
        description: "Todas as conversas"
    },
    {
        title: "Não Resolvidas",
        url: "#",
        icon: AlertCircle,
        isActive: false,
        filter: "UNRESOLVED",
        description: "Conversas pendentes"
    },
    {
        title: "Não Lidas",
        url: "#",
        icon: Mail,
        isActive: false,
        filter: "UNREAD",
        description: "Mensagens não lidas"
    },
    {
        title: "Humano Solicitado",
        url: "#",
        icon: User,
        isActive: false,
        filter: "HUMAN_REQUESTED",
        description: "Aguardando atendimento humano"
    },
    {
        title: "Resolvidas",
        url: "#",
        icon: CheckCircle2,
        isActive: false,
        filter: "RESOLVED",
        description: "Conversas finalizadas"
    },
    {
        title: "Dashboard",
        url: "#",
        icon: MessageCircle,
        isActive: false,
        filter: "dashboard",
        description: "Canal Dashboard"
    },
    {
        title: "Telegram",
        url: "#",
        icon: Send,
        isActive: false,
        filter: "telegram",
        description: "Canal Telegram"
    },
    {
        title: "Todas Mensagens",
        url: "/messages",
        icon: List,
        isActive: false,
        filter: "all_messages",
        description: "Ver todas as mensagens"
    },
    {
        title: "Demo Conversa",
        url: "/conversation-demo",
        icon: MessageCircle,
        isActive: false,
        filter: "demo",
        description: "Demonstração da conversa integrada"
    },
];

const user = {
    name: "Agent User",
    email: "agent@example.com",
    avatar: "/avatars/agent.jpg",
};



// Função para formatar data
function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
        return "há poucos minutos";
    } else if (diffInHours < 24) {
        return `há ${diffInHours}h`;
    } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `há ${diffInDays} dias`;
    }
}

// Função para obter ícone do canal
function getChannelIcon(channel: string) {
    switch (channel.toLowerCase()) {
        case 'telegram':
            return Send;
        case 'dashboard':
            return MessageCircle;
        case 'whatsapp':
            return MessageCircle;
        default:
            return MessageCircle;
    }
}

// Função para obter cor da prioridade
function getPriorityColor(priority: string) {
    switch (priority) {
        case 'HIGH':
            return 'bg-red-100 text-red-800';
        case 'MEDIUM':
            return 'bg-yellow-100 text-yellow-800';
        case 'LOW':
            return 'bg-green-100 text-green-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

// Função para obter nome do contato ou identificador
function getContactName(conversation: ConversationType): string {
    // Primeiro tenta pegar do participantsContacts
    if (conversation.participantsContacts && conversation.participantsContacts.length > 0) {
        const firstName = conversation.participantsContacts[0].firstName;
        if (firstName) return firstName;
    }

    // Depois tenta pegar do aiUserIdentifier
    if (conversation.aiUserIdentifier) {
        return conversation.aiUserIdentifier;
    }

    // Se não tiver nome, usa os 3 últimos caracteres do ID da conversa
    const lastThreeChars = conversation.id.slice(-3).toUpperCase();
    return `Visitante #${lastThreeChars}`;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { conversations, isLoading, isError, error, refetch } = useConversationsList()
    const { selectedConversation, setSelectedConversation } = useConversationStore()
    const [activeItem, setActiveItem] = React.useState(navMain[0])
    const [searchTerm, setSearchTerm] = React.useState("")
    const [showUnreadsOnly, setShowUnreadsOnly] = React.useState(false)
    const { setOpen } = useSidebar()

    // Buscar informações dos agentes únicos das conversas
    const uniqueAgentIds = React.useMemo(() => {
        if (!conversations) return []
        const agentIds = conversations
            .map(conv => conv.agentId)
            .filter((id): id is string => !!id)
        return [...new Set(agentIds)]
    }, [conversations])

    const { data: agentsData } = useAgentsDetails(uniqueAgentIds)

    const handleConversationClick = (conversation: ConversationType) => {
        setSelectedConversation(conversation)
    }

    // Filtrar conversas baseado no item ativo e termo de busca
    const filteredConversations = React.useMemo(() => {
        if (!conversations) return [];

        let filtered = conversations;

        // Aplicar filtro do item ativo
        if (activeItem.filter) {
            switch (activeItem.filter) {
                case "UNRESOLVED":
                case "RESOLVED":
                    filtered = filtered.filter(conv => conv.status === activeItem.filter);
                    break;
                case "UNREAD":
                    filtered = filtered.filter(conv => conv.unreadMessagesCount > 0);
                    break;
                case "HUMAN_REQUESTED":
                    // Assumindo que existe um campo para indicar solicitação humana
                    // ou usando prioridade HIGH como indicador
                    filtered = filtered.filter(conv =>
                        conv.priority === 'HIGH' ||
                        conv.status === 'UNRESOLVED' && conv.unreadMessagesCount > 0
                    );
                    break;
                case "dashboard":
                case "telegram":
                    filtered = filtered.filter(conv => conv.channel === activeItem.filter);
                    break;
                default:
                    // Para "Todas conversas" não aplica filtro
                    break;
            }
        }

        // Aplicar filtro de busca
        if (searchTerm) {
            filtered = filtered.filter(conv => {
                const contactName = getContactName(conv).toLowerCase();
                const channel = conv.channel.toLowerCase();
                const agentId = conv.agentId?.toLowerCase() || '';

                return contactName.includes(searchTerm.toLowerCase()) ||
                    channel.includes(searchTerm.toLowerCase()) ||
                    agentId.includes(searchTerm.toLowerCase());
            });
        }

        // Aplicar filtro de não lidas (switch adicional)
        if (showUnreadsOnly) {
            filtered = filtered.filter(conv => conv.unreadMessagesCount > 0);
        }

        // Ordenar por data de atualização (mais recentes primeiro)
        return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }, [conversations, activeItem, searchTerm, showUnreadsOnly]);

    // Calcular total de mensagens não lidas de clientes
    // Assumindo que unreadMessagesCount já representa mensagens de clientes não lidas
    const totalUnreadCount = conversations?.reduce((acc, conv) => {
        // Apenas contar mensagens não lidas se a conversa tem mensagens de clientes pendentes
        return acc + (conv.unreadMessagesCount || 0);
    }, 0) || 0;

    // TODO: Se necessário, implementar lógica mais específica para contar apenas mensagens de clientes:
    // const totalUnreadCount = conversations?.reduce(async (accPromise, conv) => {
    //     const acc = await accPromise;
    //     if (conv.unreadMessagesCount > 0) {
    //         // Buscar mensagens da conversa e contar apenas as do tipo 'human' não lidas
    //         const messages = await fetchMessages(conv.id);
    //         const clientUnreadCount = messages.filter(msg => 
    //             msg.from === 'human' && !msg.read
    //         ).length;
    //         return acc + clientUnreadCount;
    //     }
    //     return acc;
    // }, Promise.resolve(0)) || 0;

    return (
        <Sidebar
            collapsible="icon"
            className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
            {...props}
        >
            <Sidebar
                collapsible="none"
                className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
            >
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                                <a href="#">
                                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                        <MessageCircle className="size-4" />
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">Chat System</span>
                                        <span className="truncate text-xs">Conversas</span>
                                    </div>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent className="px-1.5 md:px-0">
                            <SidebarMenu>
                                {navMain.map((item) => {
                                    // Calcular contador para cada categoria
                                    let count = 0;
                                    if (conversations) {
                                        switch (item.filter) {
                                            case "UNRESOLVED":
                                                count = conversations.filter(conv => conv.status === "UNRESOLVED").length;
                                                break;
                                            case "UNREAD":
                                                count = conversations.filter(conv => conv.unreadMessagesCount > 0).length;
                                                break;
                                            case "HUMAN_REQUESTED":
                                                count = conversations.filter(conv =>
                                                    conv.priority === 'HIGH' ||
                                                    (conv.status === 'UNRESOLVED' && conv.unreadMessagesCount > 0)
                                                ).length;
                                                break;
                                            case "RESOLVED":
                                                count = conversations.filter(conv => conv.status === "RESOLVED").length;
                                                break;
                                            case "dashboard":
                                            case "telegram":
                                                count = conversations.filter(conv => conv.channel === item.filter).length;
                                                break;
                                            default:
                                                count = conversations.length;
                                                break;
                                        }
                                    }

                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                tooltip={{
                                                    children: item.description || item.title,
                                                    hidden: false,
                                                }}
                                                onClick={() => {
                                                    if (item.url && item.url !== '#') {
                                                        window.location.href = item.url
                                                    } else {
                                                        setActiveItem(item)
                                                        setOpen(true)
                                                    }
                                                }}
                                                isActive={activeItem?.title === item.title}
                                                className="px-2.5 md:px-2 justify-between"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <item.icon className="h-4 w-4" />
                                                    <span className="truncate">{item.title}</span>
                                                </div>
                                                {count > 0 && (
                                                    <Badge
                                                        variant={item.filter === "UNREAD" || item.filter === "HUMAN_REQUESTED" ? "destructive" : "secondary"}
                                                        className="h-5 px-1.5 text-xs font-medium"
                                                    >
                                                        {count}
                                                    </Badge>
                                                )}
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>
                    <div className="flex items-center justify-center pb-2">
                        <ThemeToggle />
                    </div>
                    {/* <NavUser user={user} /> */}
                </SidebarFooter>
            </Sidebar>

            {/* Segunda sidebar - Lista de conversas */}
            <Sidebar collapsible="none" className="hidden flex-1 md:flex flex-col">
                <SidebarHeader className="sidebar-header gap-3.5 border-b p-4 flex w-full relative flex-shrink-0">
                    <div className="flex-1 flex max-w-full items-center justify-between min-h-[2rem]">
                        <div className="text-foreground text-base font-medium flex items-center gap-2 min-w-0">
                            <span className="truncate">{activeItem?.title}</span>
                            {totalUnreadCount > 0 && (
                                <Badge variant="destructive" className="text-xs flex-shrink-0">
                                    {totalUnreadCount}
                                </Badge>
                            )}
                        </div>
                        <div className="unread-switch-container">
                            <span className="unread-switch-label">Não lidas</span>
                            <Switch
                                className="shadow-none scale-75"
                                checked={showUnreadsOnly}
                                onCheckedChange={setShowUnreadsOnly}
                            />
                        </div>
                    </div>
                    <SidebarInput
                        placeholder="Buscar conversas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                    />
                </SidebarHeader>
                <SidebarContent className="flex-1 overflow-y-auto">
                    <SidebarGroup className="px-0">
                        <SidebarGroupContent className="space-y-0">
                            {isLoading && (
                                <div className="p-4 text-sm text-muted-foreground text-center">
                                    Carregando conversas...
                                </div>
                            )}
                            {isError && (
                                <div className="p-4 text-sm text-red-600 text-center">
                                    Erro ao carregar: {error?.message}
                                </div>
                            )}
                            {filteredConversations?.length === 0 && !isLoading && (
                                <div className="p-4 text-sm text-muted-foreground text-center">
                                    Nenhuma conversa encontrada
                                </div>
                            )}
                            {filteredConversations?.map((conversation) => {
                                const ChannelIcon = getChannelIcon(conversation.channel);
                                const contactName = getContactName(conversation);

                                return (
                                    <button
                                        key={conversation.id}
                                        onClick={() => handleConversationClick(conversation)}
                                        className={`conversation-item w-full text-left leading-tight last:border-b-0 relative ${selectedConversation?.id === conversation.id
                                            ? 'selected'
                                            : ''
                                            }`}
                                    >
                                        {/* Header com ícone, nome e badge de não lidas */}
                                        <div className="conversation-header">
                                            <ChannelIcon className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="conversation-title font-medium text-base">
                                                        {contactName}
                                                    </span>
                                                    {conversation.unreadMessagesCount > 0 && (
                                                        <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-medium">
                                                            {conversation.unreadMessagesCount}
                                                        </Badge>
                                                    )}
                                                </div>
                                                {/* Nome do agente */}
                                                {conversation.agentId && (
                                                    <div className="mt-1">
                                                        <div className="text-xs text-muted-foreground mb-1">Atendido por:</div>
                                                        <AgentCard 
                                                            agentId={conversation.agentId} 
                                                            variant="minimal" 
                                                            showModel={false}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Contexto da conversa se disponível */}
                                        {conversation.conversationContexts && conversation.conversationContexts.length > 0 && (
                                            <div className="conversation-context text-sm text-muted-foreground line-clamp-2 mt-1">
                                                {conversation.conversationContexts[0].context}
                                            </div>
                                        )}

                                        {/* Footer com avatar do agente e data */}
                                        <div className="conversation-footer">
                                            <div className="flex items-center gap-2">
                                                {(() => {
                                                    const agent = conversation.agentId ? agentsData?.[conversation.agentId] : null;
                                                    return (
                                                        <>
                                                            {agent?.iconUrl ? (
                                                                <img
                                                                    src={agent.iconUrl}
                                                                    alt={agent.name}
                                                                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                                                                    onError={(e) => {
                                                                        // Fallback para avatar com inicial se a imagem falhar
                                                                        const target = e.target as HTMLImageElement;
                                                                        target.style.display = 'none';
                                                                        target.nextElementSibling?.classList.remove('hidden');
                                                                    }}
                                                                />
                                                            ) : null}
                                                            <div className={`w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ${agent?.iconUrl ? 'hidden' : ''}`}>
                                                                <span className="text-xs font-medium">
                                                                    {agent?.name?.charAt(0) || agent?.interfaceConfig?.displayName?.charAt(0) || 'A'}
                                                                </span>
                                                            </div>
                                                            <span className="text-sm font-medium text-foreground">
                                                                {agent?.interfaceConfig?.displayName || agent?.name || 'Agente'}
                                                            </span>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(conversation.updatedAt)}
                                            </span>
                                        </div>

                                        {/* Indicador de frustração se > 0 */}
                                        {conversation.frustration > 0 && (
                                            <div className="absolute top-2 right-2">
                                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
        </Sidebar>
    )
}