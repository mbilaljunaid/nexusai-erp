import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Bot, 
  Send, 
  X, 
  Sparkles,
  Loader2,
  MessageSquare
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage?: (message: string) => Promise<string>;
}

const quickActions = [
  "What are my top leads this week?",
  "Show overdue tasks",
  "Generate sales report",
  "Suggest follow-ups",
];

export function AIAssistant({ isOpen, onClose, onSendMessage }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI assistant. I can help you with lead insights, task management, and analytics. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // todo: remove mock functionality - integrate with actual AI
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getAIResponse(input),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, response]);
      setIsLoading(false);
    }, 1000);
  };

  const getAIResponse = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes("lead")) {
      return "Based on your CRM data, you have 12 hot leads this week. Sarah Johnson from TechCorp has the highest AI score (87) and is ready for a proposal. I'd recommend scheduling a call with her today.";
    }
    if (q.includes("task") || q.includes("overdue")) {
      return "You have 3 overdue tasks: 1) Review Q4 marketing strategy (2 days overdue), 2) Send proposal to Acme Corp (1 day), 3) Update project timeline. Would you like me to reschedule these?";
    }
    if (q.includes("report") || q.includes("sales")) {
      return "I can generate a sales report for you. This month's highlights: $128,450 in revenue (↑8.2%), 47 active deals, and 24.8% conversion rate. Want me to create a detailed PDF report?";
    }
    if (q.includes("follow")) {
      return "I've identified 5 leads that need follow-up: 1) Mark from Acme (last contact 7 days ago), 2) Lisa from GlobalTech (proposal sent 5 days ago). Should I draft follow-up emails?";
    }
    return "I understand you're asking about " + query + ". Let me analyze your data and provide insights. Is there anything specific you'd like to focus on?";
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
  };

  if (!isOpen) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[500px] flex flex-col shadow-lg z-50" data-testid="panel-ai-assistant">
      <CardHeader className="flex flex-row items-center justify-between gap-4 py-3 px-4 border-b">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-base">AI Assistant</CardTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-assistant">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className={message.role === "assistant" ? "bg-primary/10" : "bg-muted"}>
                  {message.role === "assistant" ? <Bot className="h-4 w-4 text-primary" /> : "U"}
                </AvatarFallback>
              </Avatar>
              <div
                className={`rounded-lg px-3 py-2 max-w-[80%] text-sm ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-lg px-3 py-2 bg-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t space-y-3">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <Button
              key={action}
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => handleQuickAction(action)}
              data-testid={`button-quick-${action.toLowerCase().replace(/\s+/g, '-').slice(0, 20)}`}
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              {action}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="resize-none text-sm min-h-[40px] max-h-[100px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            data-testid="input-ai-message"
          />
          <Button 
            size="icon" 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading}
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function AIAssistantTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button
      size="icon"
      className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg z-40"
      onClick={onClick}
      data-testid="button-open-assistant"
    >
      <Sparkles className="h-5 w-5" />
    </Button>
  );
}
