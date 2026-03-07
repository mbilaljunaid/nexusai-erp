import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DataExplorer() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Data Explorer</h1>
        <p className="text-muted-foreground mt-1">Ad-hoc data exploration and analysis</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Create Custom Query</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Select Data Source</Label>
            <Input placeholder="Leads, Opportunities, Accounts, ..." data-testid="input-source" />
          </div>
          <div>
            <Label className="text-sm font-medium">Filter Conditions</Label>
            <Input placeholder="Add filters..." data-testid="input-filter" />
          </div>
          <div>
            <Label className="text-sm font-medium">Group By</Label>
            <Input placeholder="Select fields..." data-testid="input-group" />
          </div>
          <Button data-testid="button-execute">Execute Query</Button>
        </CardContent>
      </Card>
    </div>
  );
}
