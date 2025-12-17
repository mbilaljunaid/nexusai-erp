import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import {
  Bot,
  Send,
  X,
  Sparkles,
  Loader2,
  MessageSquare,
  Zap,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Maximize2,
  Minimize2,
  Settings,
  Info,
  Trash2
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  actionType?: "info" | "action" | "confirmation" | "error";
  actionDetails?: {
    type: string;
    entity: string;
    id?: string;
    summary?: string;
  };
}

interface AICopilotWidgetProps {
  userId?: number;
  userRole?: string;
  tenantId?: string;
}

const quickActions = [
  { label: "Create a project", icon: Zap, action: "create_project" },
  { label: "Add a task", icon: MessageSquare, action: "create_task" },
  { label: "Show my tasks", icon: Info, action: "list_tasks" },
  { label: "Generate report", icon: Settings, action: "generate_report" },
];

const modeDescriptions = {
  info: "Information Mode - Get answers and explanations",
  action: "Action Mode - Execute in-app operations"
};

const CONVERSATION_STORAGE_KEY = "nexusai-copilot-history";
const MAX_STORED_MESSAGES = 50;

const welcomeMessage: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hi! I'm your AI Copilot. I can help you with information OR take actions in the app. Try asking me to create a project, add a task, or explain a feature. What would you like to do?",
  timestamp: new Date(),
  actionType: "info"
};

function loadPersistedMessages(): Message[] {
  try {
    const stored = localStorage.getItem(CONVERSATION_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }));
    }
  } catch (e) {
    console.warn("Failed to load persisted messages:", e);
  }
  return [welcomeMessage];
}

export function AICopilotWidget({ userId, userRole, tenantId }: AICopilotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>(loadPersistedMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"info" | "action">("info");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (messages.length > 1 || messages[0]?.id !== "welcome") {
      const toStore = messages.slice(-MAX_STORED_MESSAGES);
      localStorage.setItem(CONVERSATION_STORAGE_KEY, JSON.stringify(toStore));
    }
  }, [messages]);

  const clearConversation = useCallback(() => {
    localStorage.removeItem(CONVERSATION_STORAGE_KEY);
    setMessages([welcomeMessage]);
    toast({ title: "Conversation cleared", description: "Your chat history has been reset." });
  }, [toast]);

  const { data: userData } = useQuery<any>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const detectIntent = useCallback((message: string): "info" | "action" => {
    const actionKeywords = [
      "create", "add", "make", "new", "delete", "remove", "update", "edit",
      "change", "assign", "schedule", "set", "mark", "complete", "approve",
      "reject", "submit", "generate", "send", "start", "stop", "cancel"
    ];
    const lowerMessage = message.toLowerCase();
    return actionKeywords.some(keyword => lowerMessage.includes(keyword)) ? "action" : "info";
  }, []);

  const handleSend = async (customMessage?: string) => {
    const messageToSend = customMessage || input;
    if (!messageToSend.trim() || isLoading) return;

    const detectedMode = detectIntent(messageToSend);
    setMode(detectedMode);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/copilot/contextual-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageToSend,
          context: {
            userId: userData?.id || userId,
            userRole: userData?.role || userRole || "member",
            tenantId: userData?.tenantId || tenantId,
            currentPage: window.location.pathname,
            mode: detectedMode,
          },
          conversationHistory: messages.slice(-6).map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        actionType: data.actionType || "info",
        actionDetails: data.actionDetails
      };
      
      setMessages(prev => [...prev, aiMessage]);

      if (data.actionExecuted && data.actionDetails) {
        toast({
          title: `Action Completed`,
          description: data.actionDetails.summary || `${data.actionDetails.type} ${data.actionDetails.entity} successfully`,
        });
      }

      if (data.requiresConfirmation) {
        const confirmMessage: Message = {
          id: (Date.now() + 2).toString(),
          role: "system",
          content: `Confirm: ${data.confirmationMessage}`,
          timestamp: new Date(),
          actionType: "confirmation"
        };
        setMessages(prev => [...prev, confirmMessage]);
      }

    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I encountered an error processing your request. Please try again or contact support if the issue persists.",
        timestamp: new Date(),
        actionType: "error"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string, label: string) => {
    handleSend(label);
  };

  const getMessageStyles = (message: Message) => {
    if (message.role === "user") {
      return "bg-primary text-primary-foreground";
    }
    
    switch (message.actionType) {
      case "action":
        return "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800";
      case "confirmation":
        return "bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800";
      case "error":
        return "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800";
      default:
        return "bg-muted";
    }
  };

  const getActionIcon = (actionType?: string) => {
    switch (actionType) {
      case "action":
        return <CheckCircle2 className="h-3 w-3 text-green-600" />;
      case "error":
        return <AlertCircle className="h-3 w-3 text-red-600" />;
      case "confirmation":
        return <Zap className="h-3 w-3 text-amber-600" />;
      default:
        return null;
    }
  };

  if (!isOpen) {
    return (
      <Button
        size="icon"
        className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-[100] bg-primary hover:bg-primary/90"
        onClick={() => setIsOpen(true)}
        data-testid="button-open-ai-copilot"
      >
        <Sparkles className="h-6 w-6" />
      </Button>
    );
  }

  const cardHeight = isExpanded ? "h-[80vh]" : "h-[520px]";
  const cardWidth = isExpanded ? "w-[500px]" : "w-[380px]";

  return (
    <Card 
      className={`fixed bottom-4 right-4 ${cardWidth} ${cardHeight} flex flex-col shadow-2xl z-[100] border-2`}
      data-testid="panel-ai-copilot"
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 py-2 px-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">AI Copilot</CardTitle>
            <div className="flex items-center gap-1">
              <Badge 
                variant="outline" 
                className={`text-[10px] px-1 py-0 ${mode === "action" ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"}`}
              >
                {mode === "action" ? "Action" : "Info"}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={clearConversation}
            title="Clear conversation"
            data-testid="button-clear-conversation"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={() => setIsExpanded(!isExpanded)}
            data-testid="button-toggle-expand"
          >
            {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={() => setIsOpen(false)}
            data-testid="button-close-copilot"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {message.role !== "user" && (
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-xs">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex flex-col gap-1 max-w-[85%]">
                <div
                  className={`rounded-lg px-3 py-2 text-sm ${getMessageStyles(message)}`}
                >
                  {message.actionType && message.actionType !== "info" && (
                    <div className="flex items-center gap-1 mb-1">
                      {getActionIcon(message.actionType)}
                      <span className="text-[10px] font-medium uppercase opacity-70">
                        {message.actionType}
                      </span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {message.actionDetails && (
                    <div className="mt-2 p-2 bg-background/50 rounded text-xs">
                      <div className="font-medium">{message.actionDetails.type}: {message.actionDetails.entity}</div>
                      {message.actionDetails.id && (
                        <div className="text-muted-foreground">ID: {message.actionDetails.id}</div>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground px-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {message.role === "user" && (
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="bg-muted text-xs">U</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className="bg-primary/10">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-lg px-3 py-2 bg-muted flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  {mode === "action" ? "Executing..." : "Thinking..."}
                </span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t space-y-2 bg-muted/20">
        <div className="flex flex-wrap gap-1.5">
          {quickActions.map((qa) => {
            const Icon = qa.icon;
            return (
              <Button
                key={qa.action}
                variant="outline"
                size="sm"
                className="text-xs h-7 px-2"
                onClick={() => handleQuickAction(qa.action, qa.label)}
                disabled={isLoading}
                data-testid={`button-quick-${qa.action}`}
              >
                <Icon className="h-3 w-3 mr-1" />
                {qa.label}
              </Button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything or request an action..."
            className="resize-none text-sm min-h-[38px] max-h-[80px] flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isLoading}
            data-testid="input-copilot-message"
          />
          <Button
            size="icon"
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="shrink-0"
            data-testid="button-send-copilot"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-[10px] text-muted-foreground text-center">
          AI can make mistakes. Actions are logged for audit.
        </div>
      </div>
    </Card>
  );
}

export default AICopilotWidget;
