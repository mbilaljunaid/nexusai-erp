import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";

export default function FieldValidation() {
  return (
    <StandardPage
      title="Field VRules"
      description="Configure validation for custom fields"
    >
      <div className="grid gap-4">
        {[
          { field: "Email", rule: "Valid email format", status: "Active" },
          { field: "Phone", rule: "Valid phone format", status: "Active" },
        ].map((rule) => (
          <Card key={rule.field}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{rule.field}</h3>
              <p className="text-sm text-muted-foreground">{rule.rule}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </StandardPage>
  );
}
