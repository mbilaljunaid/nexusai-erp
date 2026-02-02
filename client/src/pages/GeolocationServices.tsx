import { Card, CardContent } from "@/components/ui/card";

export default function GeolocationServices() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Geolocation Services</h1>
        <p className="text-muted-foreground mt-1">Location-based features and analytics</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Active Locations</p>
          <p className="text-3xl font-bold mt-1">24</p>
        </CardContent>
      </Card>
    </div>
  );
}
