import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";

export default function TrainingAcademy() {
  return (
    <StandardPage
      title="Trainin/h"
      description="Certification and training programs"
    >
      <div className="grid gap-4">
        {[
          { course: "NexusAIFirst Fundamentals", students: "1,245", completion: "85%" },
          { course: "Advanced CRM", students: "340", completion: "72%" },
        ].map((c) => (
          <Card key={c.course}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{c.course}</h3>
              <p className="text-sm text-muted-foreground">{c.students} students • {c.completion} completion rate</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </StandardPage>
  );
}
