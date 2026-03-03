import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";

export default function AdvancedPermissions() {
  return (
    <StandardPage
      title="Advanceons</h1>
        <p className="text-muted-foreground mt-1">Fine-grained access control with delegation</p>
      </div>
      <div className="grid gap-4">
        {[
          { role: "Admin", permissions: "All", scope: "Organization" },
          { role: "Manager", permissions: "Read/Write", scope: "Team" },
        ].map((p) => (
          <Card key={p.role}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{p.role}</h3>
              <p className="text-sm text-muted-foreground">{p.permissions} • {p.scope}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </StandardPage>
  );
}
