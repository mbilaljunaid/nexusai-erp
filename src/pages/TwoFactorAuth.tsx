import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";

export default function TwoFactorAuth() {
  return (
    <StandardPage
      title="Two-Factication</h1>
        <p className="text-muted-foreground mt-1">Manage 2FA settings and enforcement</p>
      </div>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <h3 className="font-semibold">2FA Enforcement</h3>
            <p className="text-sm text-muted-foreground mt-1">Require all users to enable 2FA</p>
            <Button size="sm" className="mt-2" data-testid="button-enable-2fa">Enable</Button>
          </div>
        </CardContent>
      </Card>
    </StandardPage>
  );
}
