import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Sparkles, Loader } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

export default function AIChat() {
  const [input, setInput] = useState("");
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: conversations = [] } = useQuery({ queryKey: ["/api/copilot/conversations"], queryFn: () => fetch("/api/copilot/conversations").then(r => r.json()) }) as { data: any[] };
  
  const { data: currentMessages = [] } = useQuery({ 
    queryKey: ["/api/copilot/messages", activeConvId], 
    enabled: !!activeConvId,
    queryFn: () => fetch(`/api/copilot/messages/${activeConvId}`).then(r => r.json())
  }) as { data: any[] };

  useEffect(() => {
    setMessages(currentMessages);
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  const createConvMutation = useMutation({
    mutationFn: async () => {
      const resp = await fetch("/api/copilot/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Conversation ${new Date().toLocaleTimeString()}`,
          context: "general",
        }),
      });
      return resp.json() as Promise<any>;
    },
    onSuccess: (conv: any) => {
      setActiveConvId(conv.id);
      queryClient.invalidateQueries({ queryKey: ["/api/copilot/conversations"] });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!activeConvId) {
        const resp = await fetch("/api/copilot/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `Conversation ${new Date().toLocaleTimeString()}`,
            context: "general",
          }),
        });
        const conv = (await resp.json()) as any;
        setActiveConvId(conv.id);
        await fetch("/api/copilot/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: conv.id,
            role: "user",
            content,
          }),
        });
      } else {
        await fetch("/api/copilot/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: activeConvId,
            role: "user",
            content,
          }),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/copilot/messages", activeConvId] });
      setInput("");
    },
  });

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessageMutation.mutateAsync(input);
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bot className="h-8 w-8" />
          AI Copilot
        </h1>
        <p className="text-muted-foreground mt-2">Enterprise AI assistant powered by GPT-5 (Replit AI Integrations)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Active Conversations
              <Sparkles className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversations.length}</div>
            <p className="text-xs text-muted-foreground mt-1">AI chats</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Model</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="default">GPT-5</Badge>
            <p className="text-xs text-muted-foreground mt-2">Latest OpenAI model</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="default">Active</Badge>
            <p className="text-xs text-muted-foreground mt-2">Ready for chat</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={() => createConvMutation.mutate()} variant="outline" size="sm" className="w-full">
              New Chat
            </Button>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {conversations.map((conv: any) => (
                <div
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`p-2 rounded cursor-pointer text-sm truncate ${
                    activeConvId === conv.id ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                  }`}
                  data-testid={`conversation-${conv.id}`}
                >
                  {conv.title}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Chat</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
            <div className="flex-1 space-y-3 overflow-y-auto">
              {messages.map((msg: any, idx: number) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
                    }`}
                    data-testid={`message-${idx}`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {sendMessageMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-accent text-accent-foreground px-4 py-2 rounded-lg flex items-center gap-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                disabled={sendMessageMutation.isPending}
                data-testid="input-message"
              />
              <Button onClick={handleSend} disabled={sendMessageMutation.isPending} size="icon" data-testid="button-send">
                {sendMessageMutation.isPending ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
