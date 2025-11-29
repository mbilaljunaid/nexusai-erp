import { Card, CardContent } from "@/components/ui/card";

export default function PlatformStatus() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Status</h1>
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
    </div>
  );
}
