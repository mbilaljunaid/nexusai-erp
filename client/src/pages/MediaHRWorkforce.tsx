import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function MediaPage() {
  const { data = [] } = useQuery({ queryKey: ['/api/media-default'] });

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Media & Entertainment</h1>
        <Button data-testid="button-add"><Plus className="w-4 h-4 mr-2" />Add</Button>
      </div>

      <div className="space-y-4">
        {data.map((item: any, idx: number) => (
          <Card key={item.id || idx} className="hover-elevate" data-testid={`card-item-${item.id || idx}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle>{item.name || item.title || item.contentId || item.id}</CardTitle>
                <Badge>{item.status || "Active"}</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 text-sm">
              <p><span className="text-muted-foreground">ID:</span> {item.id}</p>
              <p><span className="text-muted-foreground">Type:</span> {item.type || item.category || "—"}</p>
              <p><span className="text-muted-foreground">Value:</span> {item.revenue || item.views || item.subscribers || "—"}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
