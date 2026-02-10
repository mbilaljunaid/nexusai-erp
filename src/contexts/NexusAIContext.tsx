import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { NexusAIState, NexusAIMessage, AIProviderConfig, AICapability, AIAgentMode } from "@/types/nexus-ai";
import { getCapabilitiesForRoute, AI_CAPABILITIES_REGISTRY } from "@/config/ai-capabilities";

interface ConversationSummary {
  id: string;
  title: string;
  moduleContext?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface NexusAIContextValue extends NexusAIState {
  toggle: () => void;
  open: () => void;
  close: () => void;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  currentCapabilities: AICapability[];
  executeTool: (toolName: string, parameters: Record<string, any>) => Promise<any>;
  // Conversation history
  conversations: ConversationSummary[];
  activeConversationId: string | null;
  loadConversation: (id: string) => Promise<void>;
  startNewConversation: () => void;
  deleteConversation: (id: string) => Promise<void>;
  // Multi-context & manual context
  additionalContextModules: string[];
  setAdditionalContextModules: React.Dispatch<React.SetStateAction<string[]>>;
  manualContext: string;
  setManualContext: (ctx: string) => void;
  // Page awareness & Agent modes
  agentMode: AIAgentMode;
  setAgentMode: (mode: AIAgentMode) => void;
  activePage: string;
  pageMetadata: any;
  // Nudges (HR/Global)
  nudges: any[];
}

const NexusAIContext = createContext<NexusAIContextValue | null>(null);

export function useNexusAI() {
  const ctx = useContext(NexusAIContext);
  if (!ctx) throw new Error("useNexusAI must be used within NexusAIProvider");
  return ctx;
}

// Debounced save helper
function useDebouncedSave(delay: number) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const save = useCallback((fn: () => void) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(fn, delay);
  }, [delay]);
  return save;
}

export function NexusAIProvider({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<NexusAIMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [additionalContextModules, setAdditionalContextModules] = useState<string[]>([]);
  const [manualContext, setManualContext] = useState("");
  const [agentMode, setAgentMode] = useState<AIAgentMode>("general");
  const [activePage, setActivePage] = useState(location);
  const [pageMetadata, setPageMetadata] = useState<any>(null);
  const debouncedSave = useDebouncedSave(1500);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const { data: activeProvider = null } = useQuery<AIProviderConfig | null>({
    queryKey: ["/api/nexus-ai/provider/active"],
    retry: false,
    staleTime: 60_000,
  });

  // Fetch conversation list
  const { data: conversations = [] } = useQuery<ConversationSummary[]>({
    queryKey: ["/api/nexus-ai/conversations"],
    retry: false,
    staleTime: 30_000,
  });

  // Fetch capabilities from API (dynamic registry)
  const { data: dynamicCapabilities = [], isLoading: isCapsLoading } = useQuery<AICapability[]>({
    queryKey: ["/api/nexus-ai/capabilities"],
    staleTime: 60_000,
  });

  // Use dynamic capabilities if available, otherwise fall back to static registry (handled by helper default)
  const availableCapabilities = dynamicCapabilities.length > 0 ? dynamicCapabilities : AI_CAPABILITIES_REGISTRY;

  // Merge route-based + manually selected module capabilities
  const currentCapabilities = useMemo(() => {
    // Pass available capabilities to the helper
    const routeCaps = getCapabilitiesForRoute(location, availableCapabilities);
    const additionalCaps = additionalContextModules
      .map(mod => availableCapabilities.find(c => c.module === mod))
      .filter((c): c is AICapability => !!c && !routeCaps.find(rc => rc.id === c.id));
    return [...routeCaps, ...additionalCaps];
  }, [location, additionalContextModules, availableCapabilities]);

  // Loading state for the AI input/chat window
  const [isAiLoading, setIsAiLoading] = useState(false);

  const currentModule = useMemo(() => {
    const primary = currentCapabilities.find(c => c.id !== "general");
    return primary?.module ?? "General";
  }, [currentCapabilities]);

  // Fetch Nudges (HR/Global)
  const { data: nudges = [] } = useQuery<any[]>({
    queryKey: ["/api/hr-self-service/me/ai/nudges"],
    enabled: currentModule === "Human Resources" || additionalContextModules.includes("Human Resources"),
    staleTime: 60_000,
  });

  // Sync activePage and detect page-level metadata
  useEffect(() => {
    setActivePage(location);
    setPageMetadata({
      path: location,
      title: document.title,
      timestamp: new Date().toISOString()
    });
  }, [location]);

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const persistMessages = useCallback(async (convoId: string, msgs: NexusAIMessage[], title?: string) => {
    const serialized = msgs.map(m => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
      toolCalls: m.toolCalls,
      moduleContext: m.moduleContext,
    }));

    await fetch(`/api/nexus-ai/conversations/${convoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: serialized, ...(title ? { title } : {}) }),
    });
    queryClient.invalidateQueries({ queryKey: ["/api/nexus-ai/conversations"] });
  }, [queryClient]);

  useEffect(() => {
    if (!activeConversationId || messages.length === 0) return;
    const convoId = activeConversationId;
    debouncedSave(() => {
      persistMessages(convoId, messagesRef.current);
    });
  }, [messages, activeConversationId, debouncedSave, persistMessages]);

  useEffect(() => {
    if (conversations.length > 0 && !activeConversationId && messages.length === 0) {
      const recent = conversations.find(c => c.isActive !== false);
      if (recent) {
        loadConversationInternal(recent.id);
      }
    }
  }, [conversations]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadConversationInternal = async (id: string) => {
    try {
      const resp = await fetch(`/api/nexus-ai/conversations/${id}`);
      if (!resp.ok) return;
      const data = await resp.json();
      const loadedMsgs: NexusAIMessage[] = (data.messages || []).map((m: any) => ({
        id: crypto.randomUUID(),
        role: m.role,
        content: m.content,
        timestamp: new Date(m.timestamp),
        toolCalls: m.toolCalls,
        moduleContext: m.moduleContext,
      }));
      setMessages(loadedMsgs);
      setActiveConversationId(id);
    } catch {
      // Silently fail
    }
  };

  const loadConversation = useCallback(async (id: string) => {
    await loadConversationInternal(id);
  }, []);

  const startNewConversation = useCallback(() => {
    setMessages([]);
    setActiveConversationId(null);
    setError(null);
  }, []);

  const clearMessages = useCallback(async () => {
    if (activeConversationId) {
      await fetch(`/api/nexus-ai/conversations/${activeConversationId}`, { method: "DELETE" });
      queryClient.invalidateQueries({ queryKey: ["/api/nexus-ai/conversations"] });
    }
    setMessages([]);
    setActiveConversationId(null);
    setError(null);
  }, [activeConversationId, queryClient]);

  const deleteConversation = useCallback(async (id: string) => {
    await fetch(`/api/nexus-ai/conversations/${id}`, { method: "DELETE" });
    if (activeConversationId === id) {
      setMessages([]);
      setActiveConversationId(null);
    }
    queryClient.invalidateQueries({ queryKey: ["/api/nexus-ai/conversations"] });
  }, [activeConversationId, queryClient]);

  const ensureConversation = useCallback(async (firstMessage: string): Promise<string> => {
    if (activeConversationId) return activeConversationId;
    const title = firstMessage.length > 50 ? firstMessage.substring(0, 47) + "..." : firstMessage;
    const resp = await fetch("/api/nexus-ai/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, moduleContext: currentModule, messages: [] }),
    });
    const data = await resp.json();
    setActiveConversationId(data.id);
    queryClient.invalidateQueries({ queryKey: ["/api/nexus-ai/conversations"] });
    return data.id;
  }, [activeConversationId, currentModule, queryClient]);

  const executeToolAction = useCallback(async (toolName: string, parameters: Record<string, any>) => {
    const resp = await fetch("/api/nexus-ai/tools/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolName, parameters }),
    });
    const data = await resp.json();
    if (!resp.ok || data.permissionDenied) {
      throw new Error(data.error || "Tool execution failed");
    }
    return data;
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!activeProvider) {
      setError("No AI provider configured. Go to Platform Admin → AI Configuration to set one up.");
      return;
    }
    const convoId = await ensureConversation(content);
    const userMsg: NexusAIMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
      moduleContext: currentModule,
    };
    setMessages(prev => [...prev, userMsg]);
    setMessages(prev => [...prev, userMsg]);
    setIsAiLoading(true);
    setError(null);

    try {
      const resp = await fetch("/api/nexus-ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
          moduleContext: currentModule,
          manualContext: manualContext || undefined,
          additionalModules: additionalContextModules.length > 0 ? additionalContextModules : undefined,
          agentMode,
          activePage,
          pageMetadata,
          capabilities: currentCapabilities.map(c => ({
            module: c.module,
            tools: c.tools.map(t => t.name),
            insights: c.insights,
          })),
          stream: true,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${resp.status})`);
      }

      const contentType = resp.headers.get("content-type") || "";
      if (contentType.includes("text/event-stream") && resp.body) {
        let assistantContent = "";
        const assistantId = crypto.randomUUID();
        setMessages(prev => [...prev, {
          id: assistantId,
          role: "assistant" as const,
          content: "",
          timestamp: new Date(),
          moduleContext: currentModule,
        }]);

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let nl: number;
          while ((nl = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, nl);
            buffer = buffer.slice(nl + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;
            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.type === "token" && parsed.content) {
                assistantContent += parsed.content;
                setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: assistantContent } : m));
              } else if (parsed.type === "tool_result") {
                setMessages(prev => prev.map(m => m.id === assistantId
                  ? { ...m, toolCalls: [...(m.toolCalls || []), { name: parsed.toolName, result: parsed.result }] }
                  : m
                ));
              } else if (parsed.type === "error") {
                throw new Error(parsed.content);
              }
            } catch (e: any) {
              if (e.message && !e.message.includes("JSON")) throw e;
              buffer = line + "\n" + buffer;
              break;
            }
          }
        }
        const toolCallMatch = assistantContent.match(/```tool_call\s*\n([\s\S]*?)\n```/);
        if (toolCallMatch) {
          try {
            const toolCall = JSON.parse(toolCallMatch[1]);
            const toolResult = await executeToolAction(toolCall.tool, toolCall.parameters);
            const toolMsg: NexusAIMessage = {
              id: crypto.randomUUID(),
              role: "assistant",
              content: toolResult.success
                ? `✅ **${toolCall.tool}** executed successfully:\n\`\`\`json\n${JSON.stringify(toolResult.result, null, 2)}\n\`\`\``
                : `❌ **${toolCall.tool}** failed: ${toolResult.error}`,
              timestamp: new Date(),
              toolCalls: [{ name: toolCall.tool, result: toolResult.result }],
              moduleContext: currentModule,
            };
            setMessages(prev => [...prev, toolMsg]);
          } catch (toolErr: any) {
            const errorMsg: NexusAIMessage = {
              id: crypto.randomUUID(),
              role: "assistant",
              content: `⚠️ Tool execution denied: ${toolErr.message}`,
              timestamp: new Date(),
              moduleContext: currentModule,
            };
            setMessages(prev => [...prev, errorMsg]);
          }
        }
        persistMessages(convoId, messagesRef.current);
      } else {
        const data = await resp.json();
        const assistantMsg: NexusAIMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.response || data.content || "No response received.",
          timestamp: new Date(),
          toolCalls: data.toolCalls,
          moduleContext: currentModule,
        };
        setMessages(prev => [...prev, assistantMsg]);
        setTimeout(() => persistMessages(convoId, messagesRef.current), 100);
      }
    } catch (err: any) {
      setError(err.message || "Failed to get AI response");
      const errorMsg: NexusAIMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `⚠️ ${err.message || "An error occurred. Please check your AI provider configuration."}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsAiLoading(false);
    }
  }, [activeProvider, messages, currentModule, currentCapabilities, executeToolAction, ensureConversation, persistMessages, agentMode, activePage, pageMetadata, additionalContextModules, manualContext]);

  const value: NexusAIContextValue = {
    isOpen,
    isLoading: isAiLoading || isCapsLoading,
    messages,
    currentModule,
    capabilities: currentCapabilities,
    currentCapabilities,
    activeProvider,
    error,
    toggle,
    open,
    close,
    sendMessage,
    clearMessages,
    executeTool: executeToolAction,
    conversations,
    activeConversationId,
    loadConversation,
    startNewConversation,
    deleteConversation,
    additionalContextModules,
    setAdditionalContextModules,
    manualContext,
    setManualContext,
    agentMode,
    setAgentMode,
    activePage,
    pageMetadata,
    nudges,
  };

  return (
    <NexusAIContext.Provider value={value}>
      {children}
    </NexusAIContext.Provider>
  );
}
