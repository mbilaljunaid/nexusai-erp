import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";


export default function TelecomPage() {
  const { data = [] } = useQuery<any[]>({ queryKey: ['/api/telecom-default'] });

  return (
    <StandardPage title="Telecom Module">
      <div className="flex justify-between items-center">
        
        <Button data-testid="button-add"><Plus className="w-4 h-4 mr-2" />Add</Button>
      </div>

      <div className="space-y-4">
        {data.map((item: any, idx: number) => (
          <Card key={item.id || idx} className="hover-elevate" data-testid={`card-item-${item.id || idx}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle>{item.name || item.subscriberId || item.id}</CardTitle>
                <Badge>{item.status || "Active"}</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 text-sm">
              <p><span className="text-muted-foreground">ID:</span> {item.id}</p>
              <p><span className="text-muted-foreground">Plan:</span> {item.plan || "—"}</p>
              <p><span className="text-muted-foreground">Usage:</span> {item.usage || item.revenue || "—"}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </StandardPage>
  );
}
