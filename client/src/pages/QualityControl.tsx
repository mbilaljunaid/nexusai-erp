import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function QualityControl() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quality Control</h1>
        <p className="text-muted-foreground mt-1">Manage QC inspections and defect tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Inspected</p>
            <p className="text-3xl font-bold mt-1">2,450</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Pass Rate</p>
            <p className="text-3xl font-bold mt-1">97.2%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Defects Found</p>
            <p className="text-3xl font-bold mt-1">68</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Inspections</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {[
            { product: "Widget A - Batch 101", status: "Pass", date: "Today" },
            { product: "Gadget B - Batch 50", status: "Pass", date: "Today" },
            { product: "Component X - Batch 25", status: "Fail", date: "Yesterday" },
          ].map((insp, idx) => (
            <div key={idx} className="flex justify-between items-center p-2 border rounded">
              <span className="text-sm">{insp.product}</span>
              <div><Badge className={insp.status === "Pass" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>{insp.status}</Badge></div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
