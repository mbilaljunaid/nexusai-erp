import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function OAuthManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">OAuth Management</h1>
        <p className="text-muted-foreground mt-1">Manage OAuth applications and tokens</p>
      </div>
      <div className="grid gap-4">
        {[
          { app: "Mobile App", scope: "read,write", status: "Active" }
          { app: "Third-party Service", scope: "read", status: "Active" }
        ].map((oauth) => (
          <Card key={oauth.app}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{oauth.app}</h3>
              <p className="text-sm text-muted-foreground">Scope: {oauth.scope}</p>
              <Badge className="mt-2 bg-green-100 text-green-800">{oauth.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
