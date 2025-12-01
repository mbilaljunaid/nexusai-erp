import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

export default function AccountHierarchy() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Account Hierarchy</h1>
        <p className="text-muted-foreground mt-1">View parent/child account relationships</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Account Structure</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { parent: "Global Corporation", level: 0, children: 5, revenue: "$2.5B" }
            { parent: "├─ North America Div", level: 1, children: 3, revenue: "$1.2B" }
            { parent: "│  ├─ US Operations", level: 2, children: 2, revenue: "$800M" }
            { parent: "│  └─ Canada Division", level: 2, children: 0, revenue: "$400M" }
            { parent: "└─ Europe Division", level: 1, children: 2, revenue: "$1.3B" }
          ].map((acc, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 border rounded">
              <span className="text-muted-foreground font-mono text-sm">{acc.parent}</span>
              <Badge variant="secondary">{acc.children} children</Badge>
              <span className="ml-auto font-semibold">{acc.revenue}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
