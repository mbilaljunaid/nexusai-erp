import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function LeadConversion() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Convert Lead to Opportunity</h1>
        <p className="text-muted-foreground mt-1">Convert a lead into an opportunity in your sales pipeline</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Lead Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Lead Name</label>
            <Input value="John Smith - Acme Corp" disabled data-testid="input-lead-name" />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input value="john@acme.com" disabled data-testid="input-email" />
          </div>
          <div>
            <label className="text-sm font-medium">Company</label>
            <Input value="Acme Corp" disabled data-testid="input-company" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Opportunity Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Opportunity Name</label>
            <Input placeholder="e.g., Acme Corp - Enterprise Suite" data-testid="input-opp-name" />
          </div>
          <div>
            <label className="text-sm font-medium">Estimated Value</label>
            <Input placeholder="$0" data-testid="input-value" />
          </div>
          <div>
            <label className="text-sm font-medium">Expected Close Date</label>
            <Input type="date" data-testid="input-close-date" />
          </div>
          <div>
            <label className="text-sm font-medium">Stage</label>
            <Input value="Qualification" data-testid="input-stage" />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button data-testid="button-convert">Convert to Opportunity</Button>
        <Button variant="outline" data-testid="button-cancel">Cancel</Button>
      </div>
    </div>
  );
}
