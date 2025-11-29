import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Sparkles } from "lucide-react";

export default function AIChat() {
  const [input, setInput] = useState("");
  const { data: conversations = [] } = useQuery({ queryKey: ["/api/copilot/conversations"] }) as { data: any[] };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bot className="h-8 w-8" />
          AI Copilot
        </h1>
        <p className="text-muted-foreground mt-2">Einstein-style AI assistant with GPT-4o integration</p>
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
            <Badge variant="default">GPT-4o Mini</Badge>
            <p className="text-xs text-muted-foreground mt-2">Latest OpenAI</p>
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

      <Card>
        <CardHeader>
          <CardTitle>AI Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Natural Language Query</span>
            <Badge variant="secondary">SQL translation</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Predictive Insights</span>
            <Badge variant="secondary">ML powered</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Document Generation</span>
            <Badge variant="secondary">Reports & PDFs</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Anomaly Detection</span>
            <Badge variant="secondary">Real-time alerts</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Ask me anything about your business..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
