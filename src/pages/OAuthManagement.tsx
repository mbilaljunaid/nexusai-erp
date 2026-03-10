import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default function OAuthManagement() {
  return (
    <StandardPage
      title="OAuth M/h"
      description="Manage OAuth applications and tokens"
    >
      <div className="grid gap-4">
        {[
          { app: "Mobile App", scope: "read,write", status: "Active" },
          { app: "Third-party Service", scope: "read", status: "Active" },
        ].map((oauth) => (
          <Card key={oauth.app}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{oauth.app}</h3>
              <p className="text-sm text-muted-foreground">Scope: {oauth.scope}</p>
              <StatusBadge status={oauth.status === 'Active' ? 'active' : 'info'} label={oauth.status} />
            </CardContent>
          </Card>
        ))}
      </div>
    </StandardPage>
  );
}
