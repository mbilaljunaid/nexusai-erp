import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";

export default function CollaborationTools() {
  return (
    <StandardPage
      title="Collabols</h1>
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
    </StandardPage>
  );
}
