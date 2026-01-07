import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DataExport() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Data Export</h1>
        <p className="text-muted-foreground mt-1">Export data to various formats</p>
      </div>
      <div className="grid gap-4">
        {[
          { format: "CSV Export", size: "12 MB" },
          { format: "Excel Export", size: "8 MB" },
        ].map((exp) => (
          <Card key={exp.format}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{exp.format}</h3>
              <p className="text-sm text-muted-foreground">{exp.size}</p>
              <Button size="sm" className="mt-3" data-testid={`button-export-${exp.format.toLowerCase()}`}>Download</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
