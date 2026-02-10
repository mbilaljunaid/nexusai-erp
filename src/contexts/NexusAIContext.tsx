import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { NexusAIState, NexusAIMessage, AIProviderConfig, AICapability } from "@/types/nexus-ai";
import { getCapabilitiesForRoute } from "@/config/ai-capabilities";

interface NexusAIContextValue extends NexusAIState {
  // Panel controls
  toggle: () => void;
  open: () => void;
  close: () => void;
  // Messaging
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  // State
  currentCapabilities: AICapability[];
}

const NexusAIContext = createContext<NexusAIContextValue | null>(null);

export function useNexusAI() {
  const ctx = useContext(NexusAIContext);
  if (!ctx) throw new Error("useNexusAI must be used within NexusAIProvider");
  return ctx;
}

export function NexusAIProvider({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<NexusAIMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch active AI provider config from backend
  const { data: activeProvider = null } = useQuery<AIProviderConfig | null>({
    queryKey: ["/api/nexus-ai/provider/active"],
    retry: false,
    staleTime: 60_000,
  });

  // Determine capabilities based on current route
  const currentCapabilities = useMemo(
    () => getCapabilitiesForRoute(location),
    [location]
  );

  const currentModule = useMemo(() => {
    const primary = currentCapabilities.find(c => c.id !== "general");
    return primary?.module ?? "General";
  }, [currentCapabilities]);

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const clearMessages = useCallback(() => setMessages([]), []);

  const sendMessage = useCallback(async (content: string) => {
    if (!activeProvider) {
      setError("No AI provider configured. Go to Platform Admin → AI Configuration to set one up.");
      return;
    }

    const userMsg: NexusAIMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
      moduleContext: currentModule,
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/nexus-ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
          moduleContext: currentModule,
          capabilities: currentCapabilities.map(c => ({
            module: c.module,
            tools: c.tools.map(t => t.name),
            insights: c.insights,
          })),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${response.status})`);
      }

      const data = await response.json();

      const assistantMsg: NexusAIMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response || data.content || "No response received.",
        timestamp: new Date(),
        toolCalls: data.toolCalls,
        moduleContext: currentModule,
      };

      setMessages(prev => [...prev, assistantMsg]);
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
      setIsLoading(false);
    }
  }, [activeProvider, messages, currentModule, currentCapabilities]);

  const value: NexusAIContextValue = {
    isOpen,
    isLoading,
    messages,
    currentModule,
    capabilities: currentCapabilities,
    activeProvider,
    error,
    toggle,
    open,
    close,
    sendMessage,
    clearMessages,
    currentCapabilities,
  };

  return (
    <NexusAIContext.Provider value={value}>
      {children}
    </NexusAIContext.Provider>
  );
}
