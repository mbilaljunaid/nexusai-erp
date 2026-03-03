import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";

export default function TemplateLibrary() {
  return (
    <StandardPage
      title="Templat/h1>
        <p className="text-muted-foreground mt-1">Reusable templates for documents and workflows</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { template: "Email Templates", count: "24" },
          { template: "Document Templates", count: "18" },
        ].map((t) => (
          <Card key={t.template}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{t.template}</h3>
              <p className="text-sm text-muted-foreground">{t.count} templates available</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </StandardPage>
  );
}
