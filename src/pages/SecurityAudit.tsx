import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";

export default function SecurityAudit() {
  return (
    <StandardPage
      title="Securit1>
        <p className="text-muted-foreground mt-1">View security audit findings</p>
      </div>
      <div className="grid gap-4">
        {[
          { category: "Authentication", findings: 0, status: "Pass" },
          { category: "Data Encryption", findings: 0, status: "Pass" },
        ].map((audit) => (
          <Card key={audit.category}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{audit.category}</h3>
              <p className="text-sm text-muted-foreground">{audit.findings} findings</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </StandardPage>
  );
}
