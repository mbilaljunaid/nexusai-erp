import { Card, CardContent } from "@/components/ui/card";

export default function TrainingAcademy() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Training Academy</h1>
        <p className="text-muted-foreground mt-1">Certification and training programs</p>
      </div>
      <div className="grid gap-4">
        {[
          { course: "NexusAI Fundamentals", students: "1,245", completion: "85%" },
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
    </div>
  );
}
