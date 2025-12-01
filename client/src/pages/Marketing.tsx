import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconNavigation } from "@/components/IconNavigation";
import { CampaignEntryForm } from "@/components/forms/CampaignEntryForm";
import { useState } from "react";
import { BarChart3, Mail, Share2, TrendingUp, Users, Settings, Zap, PieChart, Target, Activity } from "lucide-react";
import { Link } from "wouter";

export default function Marketing() {
  const [activeNav, setActiveNav] = useState("overview");

  const navItems = [
    { id: "overview", label: "Overview", icon: BarChart3, color: "text-blue-500" },
    { id: "campaigns", label: "Campaigns", icon: Mail, color: "text-purple-500" },
    { id: "email", label: "Email", icon: Mail, color: "text-green-500" },
    { id: "social", label: "Social Media", icon: Share2, color: "text-pink-500" },
    { id: "leads", label: "Lead Scoring", icon: Target, color: "text-orange-500" },
    { id: "segments", label: "Segmentation", icon: Users, color: "text-cyan-500" },
    { id: "analytics", label: "Analytics", icon: TrendingUp, color: "text-indigo-500" },
    { id: "automation", label: "Automation", icon: Zap, color: "text-yellow-500" },
    { id: "budget", label: "Budget", icon: PieChart, color: "text-red-500" },
    { id: "settings", label: "Settings", icon: Settings, color: "text-slate-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold flex items-center gap-2"><TrendingUp className="h-8 w-8" />Marketing Automation</h1>
        <p className="text-muted-foreground text-sm">Create campaigns, nurture leads, and track engagement</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-2xl font-semibold">18</p><p className="text-xs text-muted-foreground">Active Campaigns</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-semibold">28.5%</p><p className="text-xs text-muted-foreground">Avg Open Rate</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-semibold">4.2%</p><p className="text-xs text-muted-foreground">Click Rate</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-semibold">$245K</p><p className="text-xs text-muted-foreground">Pipeline Generated</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-4">
        {navItems.map((item) => (
          <Link key={item.id} to={item.id === "overview" ? "/marketing" : `/marketing/${item.id}`}>
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:border-primary hover-elevate cursor-pointer transition-all">
              <item.icon className={`w-6 h-6 ${item.color}`} />
              <span className="text-sm font-medium text-center">{item.label}</span>
            </div>
          </Link>
        ))}
      </div>

      {activeNav === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card><CardHeader><CardTitle className="text-base">Campaign Performance</CardTitle></CardHeader><CardContent><div className="space-y-2"><p className="text-sm">Active: 18</p><p className="text-sm">Scheduled: 5</p><p className="text-sm">Draft: 8</p></div></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Engagement Metrics</CardTitle></CardHeader><CardContent><div className="space-y-2"><p className="text-sm">Open Rate: 28.5%</p><p className="text-sm">Click Rate: 4.2%</p><p className="text-sm">Conv Rate: 2.1%</p></div></CardContent></Card>
        </div>
      )}

      {activeNav === "campaigns" && <div className="space-y-4"><CampaignEntryForm /></div>}

      {activeNav === "email" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Email Marketing</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Design and send targeted email campaigns</p><Button size="sm" className="mt-4">+ Create Email</Button></CardContent></Card>
        </div>
      )}

      {activeNav === "social" && <div className="space-y-4"><CampaignEntryForm /></div>}

      {activeNav === "leads" && <div className="space-y-4"><CampaignEntryForm /></div>}

      {activeNav === "segments" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Audience Segmentation</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Target audiences with precision</p><Button size="sm" className="mt-4">+ Create Segment</Button></CardContent></Card>
        </div>
      )}

      {activeNav === "analytics" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Marketing Analytics</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Track engagement and ROI across campaigns</p><Button size="sm" className="mt-4">+ View Reports</Button></CardContent></Card>
        </div>
      )}

      {activeNav === "automation" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Marketing Automation</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Create automated workflows and nurture sequences</p><Button size="sm" className="mt-4">+ Create Workflow</Button></CardContent></Card>
        </div>
      )}

      {activeNav === "budget" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Campaign Budget</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Allocate and track campaign budgets</p><Button size="sm" className="mt-4">+ Set Budget</Button></CardContent></Card>
        </div>
      )}

      {activeNav === "settings" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Marketing Settings</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Configure integrations and preferences</p></CardContent></Card>
        </div>
      )}
    </div>
  );
}
