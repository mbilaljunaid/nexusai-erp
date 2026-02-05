import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CacheManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cache Management</h1>
        <p className="text-muted-foreground mt-1">Manage application caching</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Cache Size</p>
            <p className="text-3xl font-bold mt-1">2.4 GB</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Hit Rate</p>
            <p className="text-3xl font-bold mt-1">89%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Items Cached</p>
            <p className="text-3xl font-bold mt-1">54K</p>
          </CardContent>
        </Card>
      </div>
      <Button className="w-full" data-testid="button-clear-cache">Clear Cache</Button>
    </div>
  );
}
