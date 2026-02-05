import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ShopFloor() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Shop Floor Execution</h1>
        <p className="text-muted-foreground mt-1">Real-time shop floor status and equipment monitoring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { line: "Assembly Line 1", status: "Running", wos: 3, efficiency: "92%" },
          { line: "Assembly Line 2", status: "Running", wos: 2, efficiency: "88%" },
          { line: "Packaging Line", status: "Idle", wos: 0, efficiency: "0%" },
          { line: "Quality Check", status: "Running", wos: 1, efficiency: "100%" },
        ].map((line) => (
          <Card key={line.line} className="hover:shadow-lg transition">
            <CardContent className="pt-6">
              <h3 className="font-semibold">{line.line}</h3>
              <Badge className={line.status === "Running" ? "bg-green-100 text-green-800 mt-2" : "bg-gray-100 text-gray-800 mt-2"}>{line.status}</Badge>
              <div className="mt-3 space-y-1 text-sm">
                <p><strong>Work Orders:</strong> {line.wos}</p>
                <p><strong>Efficiency:</strong> {line.efficiency}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
