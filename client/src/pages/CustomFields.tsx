import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function CustomFields() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Custom Fields</h1>
          <p className="text-muted-foreground mt-1">Manage custom fields and data types</p>
        </div>
        <Button data-testid="button-new-field"><Plus className="h-4 w-4 mr-2" />New Field</Button>
      </div>
      <div className="grid gap-4">
        {[
          { name: "Company Size", type: "Select", entity: "Lead" },
          { name: "Industry", type: "Text", entity: "Account" },
        ].map((field) => (
          <Card key={field.name}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{field.name}</h3>
              <p className="text-sm text-muted-foreground">{field.type} • {field.entity}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
