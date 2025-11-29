import { Card, CardContent } from "@/components/ui/card";

export default function AuthenticationMethods() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Authentication Methods</h1>
        <p className="text-muted-foreground mt-1">Configure supported auth methods</p>
      </div>
      <div className="grid gap-4">
        {[
          { method: "Email/Password", enabled: true },
          { method: "OAuth 2.0", enabled: true },
          { method: "SAML", enabled: false },
        ].map((m) => (
          <Card key={m.method}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{m.method}</h3>
              <p className="text-sm text-muted-foreground">{m.enabled ? "Enabled" : "Disabled"}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
