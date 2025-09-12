"use client";
import { useState, useMemo, useEffect, useRef, useTransition } from "react";
import ConversationList from "@/components/ConversationList";
import type { Conversation } from "@/types/conversation";
import { AppBar, Box, Toolbar, Typography, IconButton, useTheme, useMediaQuery, Drawer, CircularProgress } from "@mui/material";
import { Settings, Sun, Moon, ArrowLeft, Info } from 'lucide-react';
import Image from 'next/image';
import defaultLogo from './logo.webp';
import ChatWindow from "@/components/ChatWindow";
import { useThemeStore } from "@/store/themeStore";
import { useThemeConfigStore } from "@/store/themeConfigStore";
import ConversationFilters, { FiltersState } from "@/components/ConversationFilters";
import SettingsModal from "@/components/SettingsModal";
import ConversationDetailsSidebar from "@/components/ConversationDetailsSidebar";
import { useTagStore } from "@/store/tagStore";
import { isEqual } from 'lodash';

const CONVERSATIONS_PER_PAGE = 20; // Número de conversas a carregar por vez

export default function Home() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false); 
  const [isPending, startTransition] = useTransition();
  const [isChatLoading, setIsChatLoading] = useState(false); // Estado para o carregamento do chat

  const [filters, setFilters] = useState<FiltersState>({
    sortBy: 'newest',
    channel: 'ALL',
    priority: 'ALL',
    status: 'ALL',
    tag: 'ALL',
  });

  const { theme, toggleTheme } = useThemeStore();
  const { appName, logoUrl } = useThemeConfigStore();

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const isLargeScreen = useMediaQuery(muiTheme.breakpoints.up('lg'));

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const isInitialLoad = useRef(true);
  const conversationListContainerRef = useRef<HTMLDivElement | null>(null);

  // Estados para o scroll infinito da lista de conversas
  const [visibleCount, setVisibleCount] = useState(CONVERSATIONS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);


  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch("http://localhost:3001/conversation");
        if (!response.ok) {
          throw new Error('Failed to fetch conversations');
        }
        const data: Conversation[] = await response.json();
        
        setConversations(prev => {
            if (isEqual(prev, data)) {
                return prev;
            }
            return data;
        });

      } catch (err) {
        setError(err as Error);
      } finally {
        if (isInitialLoad.current) {
          setLoading(false);
          isInitialLoad.current = false;
        }
      }
    };
    
    fetchConversations(); 

    const intervalId = setInterval(fetchConversations, 5000); 

    return () => clearInterval(intervalId); 
  }, []);

  const { tagsByConversationId, getAllUniqueTags } = useTagStore();
  const allUniqueTags = getAllUniqueTags();

  const handleSelectConversation = (id: string) => {
    // Apenas ativa o loader se for uma conversa diferente da atual
    if (id !== selectedConversationId) {
      setIsChatLoading(true);
      setSelectedConversationId(id);
    }
  };
  
  const handleFiltersChange = (newFilters: Partial<FiltersState>) => {
    startTransition(() => {
      setFilters(prev => ({ ...prev, ...newFilters }));
      // Reseta a contagem de conversas visíveis e rola para o topo
      setVisibleCount(CONVERSATIONS_PER_PAGE);
      if (conversationListContainerRef.current) {
        conversationListContainerRef.current.scrollTop = 0;
      }
    });
  };

  const handleSearchSubmit = (searchTerm: string) => {
    startTransition(() => {
      setSubmittedSearch(searchTerm);
       // Reseta a contagem de conversas visíveis e rola para o topo
      setVisibleCount(CONVERSATIONS_PER_PAGE);
      if (conversationListContainerRef.current) {
        conversationListContainerRef.current.scrollTop = 0;
      }
    });
  };

  const handleGoBack = () => {
    setSelectedConversationId(null);
  };

  const handleConversationUpdate = (conversationId: string, updates: Partial<Conversation>) => {
    setConversations(prev =>
      prev.map(c =>
        c.id === conversationId ? { ...c, ...updates } : c
      )
    );
  };

  // Cálculo dos counts para os filtros de status, useMemo para otimização guardando o resultado em cache
  const counts = useMemo(() => {
    if (!conversations) return { HUMAN_REQUESTED: 0, UNRESOLVED: 0 };
    return conversations.reduce((acc, conv) => {
      if (conv.status === 'HUMAN_REQUESTED') acc.HUMAN_REQUESTED++;
      if (conv.status === 'UNRESOLVED') acc.UNRESOLVED++;
      return acc;
    }, { HUMAN_REQUESTED: 0, UNRESOLVED: 0 });
  }, [conversations]);

  // INÍCIO DAS NOVAS FUNÇÕES AUXILIARES
  const normalizeText = (text: string | null | undefined): string => {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize("NFD") // Separa os acentos das letras
      .replace(/[\u0300-\u036f]/g, ""); // Remove os acentos
  };

  const getUserIdentifier = (conv: Conversation): string => {
    if (conv.aiUserIdentifier) {
      return conv.aiUserIdentifier;
    }
    if (conv.participantsContacts?.[0]?.firstName) {
      return conv.participantsContacts[0].firstName;
    }
    const channelName = conv.channel ? conv.channel.toUpperCase() : 'USER';
    return `${channelName} #${conv.id.slice(-4).toUpperCase()}`;
  };
  // FIM DAS NOVAS FUNÇÕES AUXILIARES

  // Filtra as conversas com base nos critérios selecionados
  const filteredConversations = useMemo(() => {
    if (!conversations) return [];
    
    const sorted = [...conversations].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return filters.sortBy === 'newest' ? dateB - dateA : dateA - b;
    });

    // Normaliza o termo da busca apenas uma vez
    const normalizedSearch = normalizeText(submittedSearch);

    return sorted.filter(conv => {
      const statusFilter = filters.status === 'ALL' || conv.status === filters.status;
      const channelFilter = filters.channel === 'ALL' || conv.channel === filters.channel;
      const priorityFilter = filters.priority === 'ALL' || conv.priority === filters.priority;
      
      const tagFilter = filters.tag === 'ALL' || 
                        (tagsByConversationId[conv.id] && tagsByConversationId[conv.id].includes(filters.tag));

      // LÓGICA DE BUSCA ATUALIZADA
      const textFilter = 
        normalizedSearch === '' ||
        // Busca no nome de usuário que é exibido no card
        normalizeText(getUserIdentifier(conv)).includes(normalizedSearch) ||
        // Busca no contexto da conversa
        normalizeText(conv.conversationContexts?.[0]?.context).includes(normalizedSearch);
      
      return statusFilter && channelFilter && priorityFilter && textFilter && tagFilter;
    });
  }, [conversations, filters, submittedSearch, tagsByConversationId]);

  // Conversas visíveis após aplicar o scroll infinito
  const visibleConversations = useMemo(() => {
    return filteredConversations.slice(0, visibleCount);
  }, [filteredConversations, visibleCount]);

  // Função para lidar com o scroll e carregar mais conversas quando próximo do fim
  const handleScroll = (event: React.UIEvent<HTMLElement>) => {
    if (isLoadingMore) return;
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    const hasMore = visibleCount < filteredConversations.length;

    if (isNearBottom && hasMore) {
      setIsLoadingMore(true);
      // Simula um delay para o carregamento parecer mais natural
      setTimeout(() => {
        setVisibleCount(prevCount => prevCount + CONVERSATIONS_PER_PAGE);
        setIsLoadingMore(false);
      }, 400);
    }
  };

  const selectedConversation = useMemo(() => {
    return conversations.find(c => c.id === selectedConversationId);
  }, [conversations, selectedConversationId]);
  
  const channelOptions = useMemo(() => {
    if (!conversations) return [];
    const channels = conversations.map(c => c.channel);
    return [...new Set(channels)];
  }, [conversations]);

  const isAdvancedFilterActive = useMemo(() => {
    return filters.sortBy !== 'newest' || filters.channel !== 'ALL' || filters.priority !== 'ALL' || filters.tag !== 'ALL';
  }, [filters]);

  return (
    <>
      <Box sx={{ display: "flex", height: "100vh", flexDirection: "column" }}>
        <AppBar position="static" sx={{ bgcolor: "background.paper", borderBottom: 1, borderColor: 'divider', color: "text.primary" }}>
          <Toolbar>
            {isMobile && selectedConversationId ? (
              <IconButton onClick={handleGoBack} color="inherit" edge="start" sx={{ mr: 1 }}>
                <ArrowLeft size={24} />
              </IconButton>
            ) : logoUrl ? (
              <img src={logoUrl} alt={appName} style={{ height: '32px', marginRight: '16px' }} />
            ) : (
              <Image 
                src={defaultLogo} 
                alt={appName} 
                width={32} 
                height={32} 
                style={{ marginRight: '16px' }} 
              />
            )}
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              {appName}
            </Typography>
            
            {!isLargeScreen && selectedConversation && (
              <IconButton onClick={() => setDetailsOpen(true)} color="inherit">
                <Info size={24} />
              </IconButton>
            )}

            <IconButton onClick={() => setSettingsOpen(true)} color="inherit"><Settings size={24} /></IconButton>
            <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
              {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
          <Box
            component="aside"
            sx={{
              width: { xs: '100%', sm: 480 },
              flexShrink: 0,
              bgcolor: "background.paper",
              borderRight: { xs: 0, sm: 1 },
              borderColor: "divider",
              height: "100%",
              display: isMobile && selectedConversationId ? 'none' : 'flex',
              flexDirection: 'column',
            }}
          >
            <ConversationFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onSearchSubmit={handleSearchSubmit}
              channelOptions={channelOptions}
              tagOptions={allUniqueTags}
              counts={counts}
              isAdvancedFilterActive={isAdvancedFilterActive}
              isFiltering={isPending}
            />
            <Box 
              ref={conversationListContainerRef} 
              onScroll={handleScroll}
              sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}
            >
              <ConversationList
                data={visibleConversations}
                error={error}
                loading={loading}
                onSelectConversation={handleSelectConversation}
                selectedConversationId={selectedConversationId}
              />
              {isLoadingMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}
            </Box>
          </Box>
          
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              height: "100%",
              display: isMobile && !selectedConversationId ? 'none' : 'flex',
              flexDirection: "row",
              bgcolor: "background.default",
              minWidth: 0, 
            }}
          >
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <ChatWindow 
                conversation={selectedConversation || null} 
                isLoading={isChatLoading}
                onMessagesLoaded={() => setIsChatLoading(false)}
              />
            </Box>

            {selectedConversation && isLargeScreen && (
              <ConversationDetailsSidebar
                conversation={selectedConversation}
                onConversationUpdate={handleConversationUpdate}
              />
            )}
          </Box>
        </Box>
      </Box>

      {selectedConversation && (
        <Drawer
          anchor="right"
          open={!isLargeScreen && detailsOpen}
          onClose={() => setDetailsOpen(false)}
        >
          <ConversationDetailsSidebar
            conversation={selectedConversation}
            onConversationUpdate={handleConversationUpdate}
            onClose={() => setDetailsOpen(false)}
          />
        </Drawer>
      )}

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}