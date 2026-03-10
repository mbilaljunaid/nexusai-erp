import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";

export default function CustomWorkflows() {
  return (
    <StandardPage
      title="Custom /h"
      description="Low-code workflow automation"
    >
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Active Workflows</p>
          <p className="text-3xl font-bold mt-1">38</p>
        </CardContent>
      </Card>
    </StandardPage>
  );
}
