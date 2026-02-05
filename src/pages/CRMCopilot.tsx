import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Sparkles, TrendingUp, Users, Brain } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { IconNavigation } from "@/components/IconNavigation";
import { useState } from "react";

interface CopilotChat {
  id: string;
  user: string;
  message: string;
  type: "insight" | "recommendation" | "alert";
  timestamp: string;
}

export default function CRMCopilot() {
  const [activeNav, setActiveNav] = useState("chat");
  const { data: chats = [] } = useQuery<CopilotChat[]>({
    queryKey: ["/api/copilot/crm"],
    retry: false,
  });

  const navItems = [
    { id: "chat", label: "Chat", icon: MessageSquare, color: "text-blue-500" },
    { id: "suggestions", label: "Suggestions", icon: Sparkles, color: "text-purple-500" },
    { id: "analytics", label: "Analytics", icon: TrendingUp, color: "text-green-500" },
  ];

  const stats = {
    total: chats.length,
    insights: chats.filter((c: any) => c.type === "insight").length,
    recommendations: chats.filter((c: any) => c.type === "recommendation").length,
    alerts: chats.filter((c: any) => c.type === "alert").length,
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-semibold flex items-center gap-2"><Brain className="h-8 w-8" />CRM Copilot</h1>
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
      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />
      
      {activeNav === "chat" && (
        <div className="space-y-3">
          {chats.map((chat: any) => (
            <Card key={chat.id} className="hover-elevate cursor-pointer"><CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1"><p className="text-sm text-muted-foreground">{chat.user}</p>
                  <p className="text-sm mt-1">{chat.message}</p></div>
                <Badge>{chat.type}</Badge>
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}
      {activeNav === "suggestions" && (<Card><CardContent className="p-4"><p className="text-muted-foreground">AI-generated next-best-action recommendations</p><div className="mt-4 space-y-2"><Button size="sm" variant="outline" className="w-full">Follow up with inactive leads</Button><Button size="sm" variant="outline" className="w-full">Schedule calls with qualified prospects</Button></div></CardContent></Card>)}
      {activeNav === "analytics" && (<Card><CardContent className="p-4"><p className="text-muted-foreground">Copilot usage and effectiveness metrics</p></CardContent></Card>)}
    </div>
  );
}
