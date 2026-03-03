import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";

export default function DatabaseMaintenance() {
  return (
    <StandardPage
      title="Databasnce</h1>
        <p className="text-muted-foreground mt-1">Optimize and maintain database</p>
      </div>
      <div className="grid gap-4">
        {[
          { task: "Optimize Tables", lastRun: "Yesterday" },
          { task: "Index Maintenance", lastRun: "2 days ago" },
        ].map((t) => (
          <Card key={t.task}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{t.task}</h3>
              <p className="text-sm text-muted-foreground">Last run: {t.lastRun}</p>
              <Button size="sm" className="mt-3" data-testid={`button-run-${t.task.toLowerCase()}`}>Run Now</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </StandardPage>
  );
}
