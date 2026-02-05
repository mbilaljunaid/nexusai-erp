import { Card, CardContent } from "@/components/ui/card";

export default function CollaborationTools() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Collaboration Tools</h1>
        <p className="text-muted-foreground mt-1">Team communication and document sharing</p>
      </div>
      <div className="grid gap-4">
        {[
          { tool: "Shared Workspaces", count: "8", active: "5" },
          { tool: "Document Sharing", files: "145", shared: "89" },
        ].map((t) => (
          <Card key={t.tool}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{t.tool}</h3>
              <p className="text-sm text-muted-foreground">Active: {t.active || t.shared}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
