import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";

export default function HealthCheckDashboard() {
  return (
    <StandardPage
      title="Health board</h1>
        <p className="text-muted-foreground mt-1">Monitor critical system components</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { component: "Database", status: "Healthy" },
          { component: "Cache", status: "Healthy" },
          { component: "API", status: "Healthy" },
        ].map((c) => (
          <Card key={c.component}>
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground">{c.component}</p>
              <p className="text-lg font-bold text-green-600 mt-2">✓ {c.status}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </StandardPage>
  );
}
