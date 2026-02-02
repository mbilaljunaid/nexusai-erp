import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconNavigation } from "@/components/IconNavigation";
import { ArrowLeft, Edit2, Share2, TrendingUp, BarChart3, FileText } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

export default function OpportunityDetail() {
  const [, setLocation] = useLocation();
  const [activeNav, setActiveNav] = useState("overview");

  const navItems = [
    { id: "overview", label: "Overview", icon: BarChart3, color: "text-blue-500" },
    { id: "activity", label: "Activity", icon: TrendingUp, color: "text-green-500" },
    { id: "notes", label: "Notes", icon: FileText, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Acme Corp - Enterprise Suite</h1>
            <p className="text-muted-foreground">$250,000 deal</p>
          </div>
        </div>
        <Button data-testid="button-edit"><Edit2 className="h-4 w-4 mr-2" />Edit</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Amount</p><p className="text-2xl font-bold mt-1">$250K</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Probability</p><p className="text-2xl font-bold mt-1">60%</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Expected</p><p className="text-2xl font-bold mt-1">$150K</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Close Date</p><p className="text-2xl font-bold mt-1">Jan 15</p></CardContent></Card>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Pipeline Stage</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {["Prospecting", "Qualification", "Needs Analysis", "Proposal", "Negotiation", "Closed Won"].map((stage, idx) => (
                    <div key={idx} className={`p-2 rounded ${stage === "Proposal" ? "bg-blue-100 border-2 border-blue-500 dark:bg-blue-950" : "border"}`}>
                      {stage}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div><p className="text-xs text-muted-foreground">Owner</p><p className="font-semibold">John Doe</p></div>
              <div><p className="text-xs text-muted-foreground">Type</p><p className="font-semibold">Enterprise</p></div>
              <div><p className="text-xs text-muted-foreground">Next Step</p><p className="font-semibold">Send Proposal</p></div>
            </CardContent>
          </Card>
        </div>
      )}
      {activeNav === "activity" && (
        <Card><CardHeader><CardTitle className="text-base">Activity</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Recent interactions and timeline</p></CardContent></Card>
      )}
      {activeNav === "notes" && (
        <Card><CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Internal notes and communications</p></CardContent></Card>
      )}
    </div>
  );
}
