import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Target, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function CampaignEntryForm() {
  const [campaignName, setCampaignName] = useState("");
  const [campaignType, setCampaignType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const [audienceSegment, setAudienceSegment] = useState("");
  const [status, setStatus] = useState("planning");
  const [showAI, setShowAI] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!campaignName || !campaignType || !startDate || !endDate || !budget || !audienceSegment) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await api.marketing.campaigns.create({
        campaignName,
        campaignType,
        startDate,
        endDate,
        budget: parseFloat(budget),
        description,
        audienceSegment,
        status,
      });
      toast({ title: "Success", description: "Campaign created successfully" });
      setCampaignName(""); setCampaignType(""); setStartDate(""); setEndDate(""); setBudget("");
      setDescription(""); setAudienceSegment(""); setStatus("planning");
    } catch (e) {
      toast({ title: "Error", description: "Failed to create campaign", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-semibold">Marketing Campaign</h2>
        <p className="text-sm text-muted-foreground">Create and execute campaigns with AI-powered optimization</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Campaign Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Campaign Name *</Label>
              <Input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="Q4 Holiday Sale" data-testid="input-campaign-name" />
            </div>
            <div className="space-y-2">
              <Label>Campaign Type *</Label>
              <Select value={campaignType} onValueChange={setCampaignType}>
                <SelectTrigger data-testid="select-campaign-type"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="paid-ads">Paid Ads</SelectItem>
                  <SelectItem value="content">Content Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} data-testid="input-campaign-start" />
            </div>
            <div className="space-y-2">
              <Label>End Date *</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} data-testid="input-campaign-end" />
            </div>
            <div className="space-y-2">
              <Label>Budget *</Label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-sm text-muted-foreground">$</span>
                <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="10000" className="pl-6" data-testid="input-campaign-budget" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea placeholder="Campaign objectives and details..." value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-20 text-sm" data-testid="textarea-campaign-description" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4" />Target Audience & Status</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Audience Segment *</Label>
              <Select value={audienceSegment} onValueChange={setAudienceSegment}>
                <SelectTrigger data-testid="select-audience"><SelectValue placeholder="Select segment" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vip">VIP Customers</SelectItem>
                  <SelectItem value="active">Active Users</SelectItem>
                  <SelectItem value="churn">At-Risk</SelectItem>
                  <SelectItem value="new">New Leads</SelectItem>
                  <SelectItem value="all">All Contacts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Campaign Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Estimated Reach</Label>
            <div className="p-3 bg-muted rounded-lg font-mono text-sm font-semibold" data-testid="text-estimated-reach">15,420 contacts</div>
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
              <li>Best performing segment: {audienceSegment || 'Active Users'}</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setShowAI(!showAI)} className="gap-1" data-testid="button-ai-optimize"><Sparkles className="h-4 w-4" />AI Optimize</Button>
        <Button onClick={handleSubmit} disabled={isLoading} data-testid="button-launch-campaign">
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Launch Campaign
        </Button>
        <Button variant="outline" data-testid="button-save-draft">Save Draft</Button>
      </div>
    </div>
  );
}
