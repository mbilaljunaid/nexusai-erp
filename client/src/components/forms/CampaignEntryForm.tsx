import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Target } from "lucide-react";

export function CampaignEntryForm() {
  const [campaignName, setCampaignName] = useState("");
  const [showAI, setShowAI] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-semibold">Marketing Campaign</h2>
        <p className="text-sm text-muted-foreground">Create and execute campaigns with AI-powered audience segmentation</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Campaign Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Campaign Name *</Label>
              <Input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="Q4 Holiday Sale" />
            </div>
            <div className="space-y-2">
              <Label>Campaign Type *</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent></Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>End Date *</Label>
              <Input type="date" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea placeholder="Campaign objectives and details..." className="min-h-20 text-sm" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4" />Target Audience</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Audience Segment *</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select segment" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vip">VIP Customers</SelectItem>
                  <SelectItem value="active">Active Users</SelectItem>
                  <SelectItem value="churn">At-Risk</SelectItem>
                </SelectContent></Select>
            </div>
            <div className="space-y-2">
              <Label>Estimated Reach</Label>
              <div className="p-3 bg-muted rounded-lg font-mono text-sm font-semibold">15,420 contacts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showAI && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-900 dark:text-blue-100 ml-2 space-y-1">
            <p><strong>AI Insights:</strong></p>
            <ul className="list-disc list-inside text-xs mt-1 space-y-0.5">
              <li>Optimal send time: Tuesday, 2:30 PM</li>
              <li>Recommended subject lines generated</li>
              <li>Expected open rate: 32%</li>
              <li>Best performing segment: Active Users</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setShowAI(!showAI)} className="gap-1"><Sparkles className="h-4 w-4" />AI Optimize</Button>
        <Button>Launch Campaign</Button>
        <Button variant="outline">Save Draft</Button>
      </div>
    </div>
  );
}
