import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";

export default function CustomerLoyalty() {
  const { data: members = [] } = useQuery<any[]>({ queryKey: ["/api/loyalty/members"] });
  const totalPoints = members.reduce((sum, m: any) => sum + (m.points || 0), 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><Heart className="w-8 h-8" />Customer Loyalty</h1>
        <p className="text-muted-foreground">Manage loyalty programs and rewards</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Members</p><p className="text-2xl font-bold">{members.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Points Issued</p><p className="text-2xl font-bold">{totalPoints.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Redemptions</p><p className="text-2xl font-bold">234</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Loyalty Members</CardTitle></CardHeader><CardContent><div className="space-y-2">{members.map((m: any) => (<div key={m.id} className="flex justify-between items-center p-3 border rounded hover-elevate"><div><p className="font-semibold">{m.name}</p><p className="text-sm text-muted-foreground">{m.tier}</p></div><p className="font-semibold">{m.points} pts</p></div>))}</div></CardContent></Card>
    </div>
  );
}
