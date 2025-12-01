import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain } from "lucide-react";

export default function CognitiveServices() {
  const services = [
    { id: "s1", name: "Text Analytics", type: "NLP", status: "active", calls: "2.5K/day" }
    { id: "s2", name: "Sentiment Analysis", type: "NLP", status: "active", calls: "1.8K/day" }
    { id: "s3", name: "Entity Recognition", type: "NLP", status: "active", calls: "3.2K/day" }
  ];
  return (
    <div className="space-y-6 p-4">
      <div><h1 className="text-3xl font-bold flex items-center gap-2"><Brain className="h-8 w-8" />Cognitive Services</h1><p className="text-muted-foreground mt-2">AI-powered intelligent services</p></div>
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Total Services</p><p className="text-2xl font-bold">3</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Active</p><p className="text-2xl font-bold text-green-600">3</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">API Calls/Day</p><p className="text-2xl font-bold">7.5K</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Uptime</p><p className="text-2xl font-bold">99.9%</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle className="text-base">Available Services</CardTitle></CardHeader><CardContent className="space-y-3">{services.map((s) => (<div key={s.id} className="p-3 border rounded-lg hover-elevate" data-testid={`service-${s.id}`}><div className="flex justify-between mb-2"><h3 className="font-semibold">{s.name}</h3><Badge>{s.type}</Badge></div><p className="text-sm text-muted-foreground">Type: {s.type} • Calls: {s.calls}</p></div>))}</CardContent></Card>
    </div>
  );
}
