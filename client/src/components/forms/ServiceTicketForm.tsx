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
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Clock, AlertTriangle } from "lucide-react";

export function ServiceTicketForm() {
  const [ticketTab, setTicketTab] = useState("entry");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [showAISuggestions, setShowAISuggestions] = useState(false);

  const priorityConfig: Record<string, { color: string; responseTime: string }> = {
    critical: { color: "destructive", responseTime: "30 min" },
    high: { color: "secondary", responseTime: "1 hour" },
    medium: { color: "default", responseTime: "4 hours" },
    low: { color: "outline", responseTime: "1 day" }
  };

  const responses = {
    critical: ["System down", "Data loss", "Security breach"],
    high: ["Feature not working", "Performance issue", "Integration failed"],
    medium: ["Bug report", "Enhancement request", "Documentation update"],
    low: ["General inquiry", "Feedback", "Best practice question"]
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-semibold">Service Ticket Entry</h2>
        <p className="text-sm text-muted-foreground mt-1">Create and manage customer support tickets with AI triage</p>
      </div>

      <Tabs value={ticketTab} onValueChange={setTicketTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="entry">Quick Entry</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Quick Entry */}
        <TabsContent value="entry" className="space-y-6">
          {/* Basic Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Customer Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="customer@company.com"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category" className="text-sm">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="support">Technical Support</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description of the issue"
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed information about the issue..."
                  className="min-h-24 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger id="priority" className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">🔴 Critical</SelectItem>
                    <SelectItem value="high">🟠 High</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="low">🟢 Low</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Response time: {priorityConfig[priority].responseTime}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          {showAISuggestions && (
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-900">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-sm text-blue-900 dark:text-blue-100 ml-2 space-y-2">
                <p><strong>AI Triage Analysis:</strong></p>
                <ul className="text-xs space-y-1 list-disc list-inside">
                  <li>Detected issue: Database connection timeout</li>
                  <li>Suggested category: Technical Support</li>
                  <li>Recommended priority: High</li>
                  <li>Similar tickets found: 3 (50% similarity)</li>
                  <li>Suggested KB articles: "Troubleshoot Connection Issues"</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* SLA Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                SLA & Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Response SLA</p>
                  <p className="font-semibold text-sm">{priorityConfig[priority].responseTime}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Resolution SLA</p>
                  <p className="font-semibold text-sm">1 day</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Auto-assign</p>
                  <Badge variant="outline" className="text-xs">Support Queue</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">KB Search</p>
                  <Badge variant="secondary" className="text-xs">Active</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignee">Assign To (Optional)</Label>
                <Select>
                  <SelectTrigger id="assignee" className="text-sm">
                    <SelectValue placeholder="Auto-assign to available agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-assign</SelectItem>
                    <SelectItem value="john">John Smith (Database Expert)</SelectItem>
                    <SelectItem value="sarah">Sarah Chen (Integration Specialist)</SelectItem>
                    <SelectItem value="mike">Mike Johnson (Performance)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis */}
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">AI-Powered Analysis</p>
                <p className="text-xs text-muted-foreground">Auto-triage, suggested resolutions, and related articles</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAISuggestions(!showAISuggestions)}
                className="gap-1"
              >
                <Sparkles className="h-4 w-4" />
                {showAISuggestions ? "Hide" : "Show"} Analysis
              </Button>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button>Create Ticket</Button>
            <Button variant="outline">Create & Notify</Button>
            <Button variant="outline">Save Draft</Button>
            <Button variant="ghost">Cancel</Button>
          </div>
        </TabsContent>

        {/* Advanced */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Advanced Ticket Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="accountId">Account/Company</Label>
                  <Select>
                    <SelectTrigger id="accountId" className="text-sm">
                      <SelectValue placeholder="Link to account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="acme">Acme Corp</SelectItem>
                      <SelectItem value="techco">TechCo Industries</SelectItem>
                      <SelectItem value="global">Global Solutions Inc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product">Product/Module</Label>
                  <Select>
                    <SelectTrigger id="product" className="text-sm">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="erp">ERP Suite</SelectItem>
                      <SelectItem value="crm">CRM</SelectItem>
                      <SelectItem value="analytics">Analytics</SelectItem>
                      <SelectItem value="integration">Integration Hub</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="env">Environment</Label>
                  <Select defaultValue="prod">
                    <SelectTrigger id="env" className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prod">Production</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="dev">Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="impact">Business Impact</Label>
                  <Select>
                    <SelectTrigger id="impact" className="text-sm">
                      <SelectValue placeholder="Select impact level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical - All users affected</SelectItem>
                      <SelectItem value="high">High - Many users affected</SelectItem>
                      <SelectItem value="medium">Medium - Some users affected</SelectItem>
                      <SelectItem value="low">Low - Individual user</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="database, performance, urgent"
                    className="text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ticket Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ticket Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground text-xs mb-1">Subject</p>
              <p className="font-medium">{subject || "Not specified"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Priority</p>
              <Badge>{priority.charAt(0).toUpperCase() + priority.slice(1)}</Badge>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Category</p>
              <p className="font-medium">{category || "Not specified"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Customer</p>
              <p className="font-medium">{customerEmail || "Not specified"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
