import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Key, Globe } from "lucide-react";

export default function AuthenticationMethods() {
  const methods = [
    { id: "m1", name: "Password", enabled: true, description: "Standard username/password authentication", users: 1247 }
    { id: "m2", name: "SSO (Okta)", enabled: true, description: "Single Sign-On via Okta identity provider", users: 892 }
    { id: "m3", name: "OAuth (Google)", enabled: true, description: "OAuth authentication via Google", users: 456 }
    { id: "m4", name: "SAML 2.0", enabled: false, description: "SAML 2.0 enterprise federation", users: 0 }
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Key className="h-8 w-8" />
          Authentication Methods
        </h1>
        <p className="text-muted-foreground mt-2">Configure supported authentication mechanisms</p>
      </div>

      <div className="space-y-3">
        {methods.map((method) => (
          <Card key={method.id} className="hover-elevate" data-testid={`auth-method-${method.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <CardTitle className="text-base">{method.name}</CardTitle>
                </div>
                <Badge variant={method.enabled ? "default" : "secondary"}>{method.enabled ? "Enabled" : "Disabled"}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">{method.description}</p>
              <p className="text-xs text-muted-foreground">{method.users} users using this method</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Default Authentication</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Current default: Password (fallback: SSO)</p>
        </CardContent>
      </Card>
    </div>
  );
}
