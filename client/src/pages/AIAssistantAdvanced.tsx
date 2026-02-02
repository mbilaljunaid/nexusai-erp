import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain } from "lucide-react";

export default function AIAssistantAdvanced() {
  const { data: models = [] } = useQuery<any[]>({ queryKey: ["/api/ai/models"] });
  const { data: conversations = [] } = useQuery<any[]>({ queryKey: ["/api/ai/conversations"] });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><Brain className="w-8 h-8" />AI Assistant</h1>
        <p className="text-muted-foreground">Enterprise AI copilots and automation</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">AI Models</p><p className="text-2xl font-bold">{models.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Conversations</p><p className="text-2xl font-bold">{conversations.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Accuracy</p><p className="text-2xl font-bold text-green-600">94.2%</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Available Copilots</CardTitle></CardHeader><CardContent><div className="space-y-2">{models.map((m: any) => (<div key={m.id} className="flex justify-between items-center p-3 border rounded hover-elevate"><div><p className="font-semibold">{m.name}</p><p className="text-sm text-muted-foreground">{m.domain}</p></div><Badge>{m.type}</Badge></div>))}</div></CardContent></Card>
    </div>
  );
}
