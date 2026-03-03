import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";

export default function CustomerSuccessPanel() {
  return (
    <StandardPage
      title="CustomePanel</h1>
        <p className="text-muted-foreground mt-1">Customer health and success tracking</p>
      </div>
      <div className="grid gap-4">
        {[
          { customer: "Acme Corp", health: "Healthy", nlr: "110%" },
          { customer: "TechStart Inc", health: "At Risk", nlr: "95%" },
        ].map((c) => (
          <Card key={c.customer}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{c.customer}</h3>
              <p className="text-sm text-muted-foreground">{c.health} • NLR: {c.nlr}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </StandardPage>
  );
}
