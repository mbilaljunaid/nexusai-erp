import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
export default function VoiceOfCustomer() {
  return (
    <div className="space-y-4">
      <div><h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><MessageSquare className="w-8 h-8" />Voice of Customer</h1><p className="text-muted-foreground">Collect and analyze customer feedback</p></div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Feedback Items</p><p className="text-2xl font-bold">8.2K</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Sentiment</p><p className="text-2xl font-bold text-green-600">82%</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Themes</p><p className="text-2xl font-bold">34</p></CardContent></Card>
      </div>
    </div>
  );
}
