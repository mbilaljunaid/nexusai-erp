import { Badge } from "@/components/ui/badge";
import { Network } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrgChart() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Org Chart</h1>
        <Badge variant="outline">Enterprise module</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Module Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="default" className="text-base px-4 py-1">Ready</Badge>
          <p className="text-sm text-muted-foreground mt-2">Module active and operational</p>
        </CardContent>
      </Card>
    </div>
  );
}
