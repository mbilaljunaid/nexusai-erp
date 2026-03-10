import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DataCleanup() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Data Cleanup</h1>
        <p className="text-muted-foreground mt-1">Remove duplicates and clean data</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Duplicate Records</p>
            <p className="text-3xl font-bold mt-1">12</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Invalid Records</p>
            <p className="text-3xl font-bold mt-1">8</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Orphaned Records</p>
            <p className="text-3xl font-bold mt-1">3</p>
          </CardContent>
        </Card>
      </div>
      <Button className="w-full" data-testid="button-cleanup">Start Cleanup</Button>
    </div>
  );
}
