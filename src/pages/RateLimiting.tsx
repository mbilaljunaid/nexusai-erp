import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";

export default function RateLimiting() {
  return (
    <StandardPage
      title="Rate Li>
        <p className="text-muted-foreground mt-1">Configure API rate limits</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Requests/Minute</p>
            <p className="text-3xl font-bold mt-1">1000</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Requests/Hour</p>
            <p className="text-3xl font-bold mt-1">50000</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Daily Limit</p>
            <p className="text-3xl font-bold mt-1">1M</p>
          </CardContent>
        </Card>
      </div>
    </StandardPage>
  );
}
