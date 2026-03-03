import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";

export default function ModuleSettings() {
  return (
    <StandardPage
      title="Module h1>
        <p className="text-muted-foreground mt-1">Enable or disable modules</p>
      </div>
      <div className="grid gap-4">
        {[
          { module: "CRM", enabled: true },
          { module: "ERP", enabled: true },
          { module: "HR", enabled: true },
        ].map((m) => (
          <Card key={m.module}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{m.module}</h3>
              <p className="text-sm text-muted-foreground">{m.enabled ? "Enabled" : "Disabled"}</p>
              <Button size="sm" className="mt-3" data-testid={`button-toggle-${m.module.toLowerCase()}`}>{m.enabled ? "Disable" : "Enable"}</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </StandardPage>
  );
}
