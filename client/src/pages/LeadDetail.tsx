import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Edit2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  Heart,
  Share2,
  MoreVertical,
  ArrowLeft,
  Star,
} from "lucide-react";
import { useLocation } from "wouter";

export default function LeadDetail() {
  const [, setLocation] = useLocation();
  const leadId = "1"; // Would come from URL params in real app

  // Fetch lead from backend
  const { data: lead = {} } = useQuery({
    queryKey: ["/api/leads", leadId],
    enabled: !!leadId,
  });

  const scoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-blue-100 text-blue-800";
    if (score >= 40) return "bg-amber-100 text-amber-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/crm")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{lead.name || "Lead"}</h1>
            <p className="text-muted-foreground">{lead.company}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" data-testid="button-favorite">
            <Heart className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" data-testid="button-share">
            <Share2 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            data-testid="button-more-options"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
          <Button data-testid="button-edit">
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AI Score</p>
                <p className="text-2xl font-bold mt-1">{lead.score || 0}</p>
              </div>
              <Badge className={`${scoreColor(lead.score || 0)} text-lg px-3 py-1`}>
                {lead.score || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-bold mt-1">{lead.status || "new"}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Deal Value</p>
                <p className="text-2xl font-bold mt-1">${lead.value || 0}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Owner</p>
                <p className="text-sm font-semibold mt-1">{lead.owner || "Unassigned"}</p>
              </div>
              <Star className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Details and Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                  {lead.email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                  {lead.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span>{lead.location || "Not specified"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="activity" data-testid="tab-activity">
                Activity
              </TabsTrigger>
              <TabsTrigger value="notes" data-testid="tab-notes">
                Notes
              </TabsTrigger>
              <TabsTrigger value="history" data-testid="tab-history">
                History
              </TabsTrigger>
            </TabsList>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { type: "Email", time: "2 hours ago", description: "Email sent to lead" },
                    {
                      type: "Call",
                      time: "Yesterday",
                      description: "Call with lead - interested in demo",
                    },
                    { type: "Note", time: "3 days ago", description: "Created lead from LinkedIn" },
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <Calendar className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{activity.type}</p>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Add Note</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    placeholder="Add a note about this lead..."
                    className="min-h-24"
                    data-testid="input-note"
                  />
                  <Button data-testid="button-save-note">Save Note</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Lead created 5 days ago</p>
                  <p className="text-sm text-muted-foreground mt-2">Last updated: 2 hours ago</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-6">
          {/* Next Action */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Next Action</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">{lead.nextAction}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Due: {lead.nextActionDate}
                </p>
              </div>
              <Button className="w-full" data-testid="button-schedule-task">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </CardContent>
          </Card>

          {/* Related Records */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Related Records</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-sm"
                data-testid="button-view-opportunities"
              >
                2 Opportunities
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm"
                data-testid="button-view-activities"
              >
                5 Activities
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm"
                data-testid="button-view-tasks"
              >
                3 Tasks
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                data-testid="button-send-email"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button
                variant="outline"
                className="w-full"
                data-testid="button-schedule-call"
              >
                <Phone className="h-4 w-4 mr-2" />
                Schedule Call
              </Button>
              <Button
                variant="outline"
                className="w-full"
                data-testid="button-convert-to-opportunity"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Convert
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
