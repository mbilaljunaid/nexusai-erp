import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function ExportManager() {
  return (
    <StandardPage
      title="Export 1>
        <p className="text-muted-foreground mt-1">Manage data exports to PDF, Excel, CSV</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: "Sales Report", format: "PDF, Excel, CSV" },
          { name: "Lead Database", format: "CSV, Excel" },
          { name: "Financial Summary", format: "PDF" },
        ].map((exp) => (
          <Card key={exp.name}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{exp.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{exp.format}</p>
              <Button size="sm" className="mt-3" data-testid={`button-export-${exp.name.toLowerCase()}`}>
                <Download className="h-4 w-4 mr-1" />Export
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </StandardPage>
  );
}
