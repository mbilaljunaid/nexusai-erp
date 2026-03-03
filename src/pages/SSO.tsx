import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";

export default function SSO() {
  return (
    <StandardPage
      title="Single SO)</h1>
        <p className="text-muted-foreground mt-1">Configure SSO identity providers</p>
      </div>
      <div className="grid gap-4">
        {[
          { provider: "Azure AD", status: "Configured" },
          { provider: "Google Workspace", status: "Configured" },
        ].map((sso) => (
          <Card key={sso.provider}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{sso.provider}</h3>
              <p className="text-sm text-muted-foreground">{sso.status}</p>
              <Button size="sm" className="mt-3" data-testid={`button-config-${sso.provider.toLowerCase()}`}>Configure</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </StandardPage>
  );
}
