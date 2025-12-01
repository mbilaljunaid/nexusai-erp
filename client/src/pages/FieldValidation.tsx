import { Card, CardContent } from "@/components/ui/card";

export default function FieldValidation() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Field Validation Rules</h1>
        <p className="text-muted-foreground mt-1">Configure validation for custom fields</p>
      </div>
      <div className="grid gap-4">
        {[
          { field: "Email", rule: "Valid email format", status: "Active" }
          { field: "Phone", rule: "Valid phone format", status: "Active" }
        ].map((rule) => (
          <Card key={rule.field}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{rule.field}</h3>
              <p className="text-sm text-muted-foreground">{rule.rule}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
