import { Card, CardContent } from "@/components/ui/card";

export default function AccessControl() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Access Control</h1>
        <p className="text-muted-foreground mt-1">Manage attribute-based access control (ABAC)</p>
      </div>
      <div className="grid gap-4">
        {[
          { policy: "Department-based", rules: 12, status: "Active" },
          { policy: "Region-based", rules: 8, status: "Active" },
        ].map((policy) => (
          <Card key={policy.policy}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{policy.policy}</h3>
              <p className="text-sm text-muted-foreground">{policy.rules} rules • {policy.status}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
