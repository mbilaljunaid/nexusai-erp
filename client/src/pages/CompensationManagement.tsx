import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CompensationManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Compensation Management</h1>
        <p className="text-muted-foreground mt-1">Manage employee compensation packages</p>
      </div>

      <div className="grid gap-4">
        {[
          { emp: "Alice Johnson", base: "$85,000", bonus: "$12,750", benefits: "$8,500", total: "$106,250" },
          { emp: "Bob Smith", base: "$95,000", bonus: "$14,250", benefits: "$9,500", total: "$118,750" },
          { emp: "Carol Davis", base: "$75,000", bonus: "$11,250", benefits: "$7,500", total: "$93,750" },
        ].map((emp, idx) => (
          <Card key={idx}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{emp.emp}</h3>
                <Button size="sm" variant="outline" data-testid={`button-edit-${idx}`}>Edit</Button>
              </div>
              <div className="grid grid-cols-4 gap-2 text-sm">
                <div><p className="text-muted-foreground">Base</p><p className="font-medium">{emp.base}</p></div>
                <div><p className="text-muted-foreground">Bonus</p><p className="font-medium">{emp.bonus}</p></div>
                <div><p className="text-muted-foreground">Benefits</p><p className="font-medium">{emp.benefits}</p></div>
                <div><p className="text-muted-foreground">Total</p><p className="font-bold">{emp.total}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
