import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Sparkles, TrendingUp, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface CopilotChat {
  id: string;
  user: string;
  message: string;
  type: "insight" | "recommendation" | "alert";
  timestamp: string;
}

export default function CRMCopilot() {
  const { data: chats = [] } = useQuery<CopilotChat[]>({
    queryKey: ["/api/copilot/crm"],
    retry: false,
  });

  const stats = {
    total: chats.length,
    insights: chats.filter((c: any) => c.type === "insight").length,
    recommendations: chats.filter((c: any) => c.type === "recommendation").length,
    alerts: chats.filter((c: any) => c.type === "alert").length,
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-semibold">CRM Copilot</h1>
        <p className="text-muted-foreground text-sm">AI-powered sales recommendations and insights</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <div><p className="text-2xl font-semibold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Interactions</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <div><p className="text-2xl font-semibold">{stats.insights}</p>
              <p className="text-xs text-muted-foreground">Insights</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-orange-500" />
            <div><p className="text-2xl font-semibold">{stats.recommendations}</p>
              <p className="text-xs text-muted-foreground">Recommendations</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-red-500" />
            <div><p className="text-2xl font-semibold">{stats.alerts}</p>
              <p className="text-xs text-muted-foreground">Alerts</p></div>
          </div>
        </CardContent></Card>
      </div>
      <Tabs defaultValue="chat" className="space-y-4">
        <TabsList>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="chat">
          <div className="space-y-3">
            {chats.map((chat: any) => (
              <Card key={chat.id}><CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1"><p className="text-sm text-muted-foreground">{chat.user}</p>
                    <p className="text-sm mt-1">{chat.message}</p></div>
                  <Badge>{chat.type}</Badge>
                </div>
              </CardContent></Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="suggestions"><p className="text-muted-foreground">AI-generated next-best-action recommendations</p></TabsContent>
        <TabsContent value="analytics"><p className="text-muted-foreground">Copilot usage and effectiveness metrics</p></TabsContent>
      </Tabs>
    </div>
  );
}
