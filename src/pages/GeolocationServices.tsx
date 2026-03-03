import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";

export default function GeolocationServices() {
  return (
    <StandardPage
      title="Geolocaces</h1>
        <p className="text-muted-foreground mt-1">Location-based features and analytics</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Active Locations</p>
          <p className="text-3xl font-bold mt-1">24</p>
        </CardContent>
      </Card>
    </StandardPage>
  );
}
