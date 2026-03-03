import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";

export default function PlatformStatus() {
  return (
    <StandardPage
      title="Platforh1>
        <p className="text-muted-foreground mt-1">Current system status and incidents</p>
      </div>
      <div className="grid gap-4">
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold">Overall Status</h3>
            <p className="text-lg font-bold text-green-600 mt-2">✓ All Systems Operational</p>
          </CardContent>
        </Card>
      </div>
    </StandardPage>
  );
}
