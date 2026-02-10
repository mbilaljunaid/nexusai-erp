import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { NexusAIState, NexusAIMessage, AIProviderConfig, AICapability } from "@/types/nexus-ai";
import { getCapabilitiesForRoute } from "@/config/ai-capabilities";

interface NexusAIContextValue extends NexusAIState {
  toggle: () => void;
  open: () => void;
  close: () => void;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  currentCapabilities: AICapability[];
  executeTool: (toolName: string, parameters: Record<string, any>) => Promise<any>;
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

  const { data: activeProvider = null } = useQuery<AIProviderConfig | null>({
    queryKey: ["/api/nexus-ai/provider/active"],
    retry: false,
    staleTime: 60_000,
  });

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

  // Execute a tool via the backend (with RBAC)
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

  // Streaming message sender
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
      const resp = await fetch("/api/nexus-ai/chat", {
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
          stream: true,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${resp.status})`);
      }

      // Check if response is SSE stream
      const contentType = resp.headers.get("content-type") || "";
      if (contentType.includes("text/event-stream") && resp.body) {
        // Stream processing
        let assistantContent = "";
        const assistantId = crypto.randomUUID();

        // Create initial assistant message
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
                setMessages(prev =>
                  prev.map(m => m.id === assistantId ? { ...m, content: assistantContent } : m)
                );
              } else if (parsed.type === "tool_result") {
                // Tool execution result from backend
                setMessages(prev =>
                  prev.map(m => m.id === assistantId
                    ? { ...m, toolCalls: [...(m.toolCalls || []), { name: parsed.toolName, result: parsed.result }] }
                    : m
                  )
                );
              } else if (parsed.type === "error") {
                throw new Error(parsed.content);
              }
              // type === "done" is just end marker
            } catch (e: any) {
              if (e.message && !e.message.includes("JSON")) throw e;
              // Incomplete JSON, put back and wait
              buffer = line + "\n" + buffer;
              break;
            }
          }
        }

        // Check if AI response contains tool_call markers and auto-execute
        const toolCallMatch = assistantContent.match(/```tool_call\s*\n([\s\S]*?)\n```/);
        if (toolCallMatch) {
          try {
            const toolCall = JSON.parse(toolCallMatch[1]);
            const toolResult = await executeToolAction(toolCall.tool, toolCall.parameters);

            // Add tool result message
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

      } else {
        // Non-streaming fallback
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
      setIsLoading(false);
    }
  }, [activeProvider, messages, currentModule, currentCapabilities, executeToolAction]);

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
    executeTool: executeToolAction,
  };

  return (
    <NexusAIContext.Provider value={value}>
      {children}
    </NexusAIContext.Provider>
  );
}
