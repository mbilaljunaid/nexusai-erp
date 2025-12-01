import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Mic, Zap, MessageCircle, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIAssistant() {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your NexusAI Copilot. How can I help you today? I can assist with budgeting, forecasting, process automation, and more.",
      timestamp: new Date(),
    },
  ]);

  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/ai/conversations"],
    queryFn: () => fetch("/api/ai/conversations").then(r => r.json()),
  });

  const createConversationMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/ai/conversations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations"] });
      toast({ title: "Conversation saved" });
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/ai/conversations/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations"] });
      toast({ title: "Conversation deleted" });
    },
  });

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages([...messages, userMsg]);
    const userInput = input;
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I understand you want to: "${userInput}". Let me help you with that. Based on your request, I recommend the following actions...`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }, 500);
  };

  const suggestions = [
    "Create budget forecast for Q2",
    "Analyze spending variance",
    "Suggest cost optimizations",
    "Generate compliance report",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Assistant & Copilot</h1>
        <p className="text-muted-foreground mt-2">Intelligent assistant for process automation and insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="flex flex-col h-[600px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                NexusAI Copilot
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs p-3 rounded-lg ${
                      msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                    }`}
                    data-testid={`message-${msg.id}`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>

            {/* Input Area */}
            <div className="border-t p-4 space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  data-testid="input-copilot-message"
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  data-testid="button-send-message"
                >
                  <Send className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setIsRecording(!isRecording)}
                  className={isRecording ? "bg-red-100" : ""}
                  data-testid="button-voice-input"
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
              {isRecording && (
                <div className="flex items-center gap-2 p-2 bg-red-50 rounded">
                  <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm text-red-700">Recording audio...</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Suggestions & Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestions.map((suggestion, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-2"
                  onClick={() => {
                    setInput(suggestion);
                  }}
                  data-testid={`button-suggestion-${idx}`}
                >
                  {suggestion}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <h4 className="font-semibold text-sm">Process Automation</h4>
                <p className="text-xs text-muted-foreground">Automate workflows & tasks</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Predictive Analytics</h4>
                <p className="text-xs text-muted-foreground">Forecast & insights</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Compliance Help</h4>
                <p className="text-xs text-muted-foreground">Regulatory guidance</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Form Generation</h4>
                <p className="text-xs text-muted-foreground">Auto-fill & suggestions</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="w-full justify-center">Online & Ready</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
