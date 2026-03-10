import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";

export default function AccessControl() {
  return (
    <StandardPage
      title="Access"
      description="Manage attribute-based access control (ABAC)"
    >
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
    </StandardPage>
  );
}
