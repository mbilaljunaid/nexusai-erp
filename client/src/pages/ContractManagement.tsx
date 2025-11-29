import { Card, CardContent } from "@/components/ui/card";

export default function ContractManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contract Management</h1>
        <p className="text-muted-foreground mt-1">Manage contracts and renewals</p>
      </div>
      <div className="grid gap-4">
        {[
          { contract: "Microsoft Agreement", renewal: "45 days", value: "$250K" },
          { contract: "Salesforce License", renewal: "120 days", value: "$180K" },
        ].map((c) => (
          <Card key={c.contract}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{c.contract}</h3>
              <p className="text-sm text-muted-foreground">Renewal in {c.renewal} • {c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
