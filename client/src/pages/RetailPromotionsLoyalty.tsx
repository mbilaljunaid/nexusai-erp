import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Page() {
  const { data = [] } = useQuery<any[]>({ queryKey: [`/api/retail-${window.location.pathname}`] });

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Retail Management</h1>
        <Button data-testid="button-new"><Plus className="w-4 h-4 mr-2" />New</Button>
      </div>
      <div className="space-y-4">
        {data.map((item: any) => (
          <Card key={item.id} data-testid={`card-item-${item.id}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle>{item.name || item.id}</CardTitle>
                <Badge>{item.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 text-sm">
              <p><span className="text-muted-foreground">Amount:</span> ₹{item.amount || '—'}</p>
              <p><span className="text-muted-foreground">Date:</span> {item.date || item.createdAt?.split('T')[0]}</p>
              <p><span className="text-muted-foreground">Contact:</span> {item.email || item.phone || '—'}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
