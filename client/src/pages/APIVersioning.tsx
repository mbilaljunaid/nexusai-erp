import { Card, CardContent } from "@/components/ui/card";

export default function APIVersioning() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">API Versioning</h1>
        <p className="text-muted-foreground mt-1">Manage multiple API versions</p>
      </div>
      <div className="grid gap-4">
        {[
          { version: "v3.0", status: "Current", adoption: "75%" },
          { version: "v2.0", status: "Deprecated", adoption: "20%" },
        ].map((v) => (
          <Card key={v.version}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{v.version}</h3>
              <p className="text-sm text-muted-foreground">{v.status} • {v.adoption} adoption</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
