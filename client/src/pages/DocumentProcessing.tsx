import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export default function DocumentProcessing() {
  const documents = [
    { id: "d1", name: "Invoice_OCT2025.pdf", type: "Invoice", status: "completed", accuracy: "98%" }
    { id: "d2", name: "Contract_ABC.pdf", type: "Contract", status: "processing", accuracy: "—" }
    { id: "d3", name: "Receipt_XYZ.jpg", type: "Receipt", status: "completed", accuracy: "96%" }
  ];
  return (
    <div className="space-y-6 p-4">
      <div><h1 className="text-3xl font-bold flex items-center gap-2"><FileText className="h-8 w-8" />Document Processing</h1><p className="text-muted-foreground mt-2">AI-powered document extraction and processing</p></div>
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Total Documents</p><p className="text-2xl font-bold">3</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Completed</p><p className="text-2xl font-bold text-green-600">2</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Processing</p><p className="text-2xl font-bold text-blue-600">1</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Avg Accuracy</p><p className="text-2xl font-bold">97%</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle className="text-base">Recent Documents</CardTitle></CardHeader><CardContent className="space-y-3">{documents.map((d) => (<div key={d.id} className="p-3 border rounded-lg hover-elevate" data-testid={`doc-${d.id}`}><div className="flex justify-between mb-2"><h3 className="font-semibold">{d.name}</h3><Badge variant={d.status === "completed" ? "default" : "secondary"}>{d.status}</Badge></div><p className="text-sm text-muted-foreground">Type: {d.type} • Accuracy: {d.accuracy}</p></div>))}</CardContent></Card>
    </div>
  );
}
