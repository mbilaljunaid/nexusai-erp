import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, TrendingUp, Check } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function LeadEntryForm() {
  const { toast } = useToast();
  const [leadTab, setLeadTab] = useState("quick");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [score, setScore] = useState("0");
  const [status, setStatus] = useState("new");
  const [showAIScore, setShowAIScore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const aiScore = 78;
  const aiScoreReason = "Tech company in growth stage, 50+ employees, matches target ICP";

  const handleSaveLead = async () => {
    if (!name || !email) {
      toast({ title: "Error", description: "Name and Email are required", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name,
        email,
        company: company || undefined,
        score: score || "0",
        status
      };
      
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error("Failed to create lead");
      
      setSuccessMessage("Lead saved successfully!");
      toast({ title: "Success", description: "Lead created" });
      
      // Reset form
      setName("");
      setEmail("");
      setCompany("");
      setScore("0");
      setStatus("new");
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-semibold">Lead Entry</h2>
        <p className="text-sm text-muted-foreground mt-1">Create and qualify new sales leads</p>
      </div>

      <Tabs value={leadTab} onValueChange={setLeadTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="quick">Quick Entry</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="quick" className="space-y-6">
          {/* Quick Entry Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lead Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Smith"
                    className="text-sm"
                    data-testid="input-lead-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="text-sm"
                    data-testid="input-lead-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Corp"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status" className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">Lead Source *</Label>
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger id="source" className="text-sm">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* AI Scoring */}
          {showAIScore && (
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-900">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-sm text-blue-900 dark:text-blue-100 ml-2 space-y-2">
                <p><strong>AI Lead Score: {aiScore}/100</strong></p>
                <p className="text-xs">{aiScoreReason}</p>
              </AlertDescription>
            </Alert>
          )}

          {/* AI Score Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Lead Scoring</p>
                  <p className="text-xs text-muted-foreground">AI-powered lead qualification</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAIScore(!showAIScore)}
                  className="gap-1"
                >
                  <Sparkles className="h-4 w-4" />
                  {showAIScore ? "Hide" : "Show"} Score
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 flex-col">
            <div className="flex gap-3">
              <Button 
                onClick={handleSaveLead}
                disabled={isLoading}
                data-testid="button-save-lead"
              >
                {isLoading ? "Saving..." : successMessage ? "Saved!" : "Save Draft"}
              </Button>
              <Button variant="outline">Save & Convert to Opportunity</Button>
              <Button variant="ghost">Cancel</Button>
            </div>
            
            {successMessage && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-900">
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-sm text-green-900 dark:text-green-100 ml-2">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Advanced fields include: Industry, Employees, Website, LinkedIn, Territory Assignment, and Custom Fields</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Right Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">AI Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Company Fit</span>
              <span className="font-semibold">85%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Intent Signals</span>
              <span className="font-semibold">72%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Budget Confidence</span>
              <span className="font-semibold">78%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Similar Leads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">3 similar leads found with 82% match</p>
            <Button variant="outline" size="sm" className="w-full">View Similar Leads</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
