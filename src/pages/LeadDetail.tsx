import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconNavigation } from "@/components/IconNavigation";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Edit2, Mail, Phone, MapPin, Calendar, DollarSign, TrendingUp, Heart, Share2, MoreVertical, ArrowLeft, Star, BarChart3, Activity } from "lucide-react";
import { useRoute } from "wouter";
import CrmAuditTrail from "@/components/crm/CrmAuditTrail";

export default function LeadDetail() {
  const [, rawParams] = useRoute("/crm/leads/:id");
  const params = rawParams as any;
  const [activeNav, setActiveNav] = useState("overview");
  const leadId = params?.id;

  const { data: lead = {} } = useQuery<any>({
    queryKey: ["/api/leads", leadId],
    queryFn: async () => {
      if (!leadId) return {};
      const res = await fetch(`/api/leads/${leadId}`);
      if (res.ok) return res.json();
      return {};
    },
    enabled: !!leadId,
    retry: false,
  });

  const navItems = [
    { id: "overview", label: "Overview", icon: BarChart3, color: "text-blue-500" },
    { id: "contact", label: "Contact", icon: Phone, color: "text-green-500" },
    { id: "activity", label: "Activity", icon: Activity, color: "text-purple-500" },
    { id: "scoring", label: "Scoring", icon: Star, color: "text-orange-500" },
  ];

  return (
    <StandardPage
      title="{lead?.name || "Lead"}"
      description="{lead?.company}"
      className="space-y-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" data-testi"}</h1>
            <p className="text-muted-foreground">{lead?.company}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" data-testid="button-favorite"><Heart className="h-5 w-5" /></Button>
          <Button variant="ghost" size="icon" data-testid="button-share"><Share2 className="h-5 w-5" /></Button>
          <Button data-testid="button-edit"><Edit2 className="h-4 w-4 mr-2" />Edit</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Status</p><p className="text-2xl font-bold mt-1">{lead?.status || "New"}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Lead Score</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-2xl font-bold ${(lead?.score || 0) >= 70 ? "text-green-600" :
              (lead?.score || 0) >= 40 ? "text-yellow-600" : "text-red-600"
              }`}>
              {lead?.score || 0}
            </span>
            <Badge variant={(lead?.score || 0) >= 70 ? "default" : "outline"}>
              {(lead?.score || 0) >= 70 ? "Hot" : (lead?.score || 0) >= 40 ? "Warm" : "Cold"}
            </Badge>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Industry</p><p className="text-2xl font-bold mt-1">{lead?.industry || "N/A"}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Budget</p><p className="text-2xl font-bold mt-1">${lead?.budget || "0"}K</p></CardContent></Card>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "overview" && (
        <Card><CardHeader><CardTitle>Lead Summary</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Company: {lead?.company}</p><p className="text-muted-foreground mt-2">Stage: {lead?.stage}</p></CardContent></Card>
      )}
      {activeNav === "contact" && (
        <Card><CardHeader><CardTitle>Contact Information</CardTitle></CardHeader><CardContent><div className="space-y-2"><p className="flex items-center gap-2"><Mail className="h-4 w-4" />{lead?.email}</p><p className="flex items-center gap-2"><Phone className="h-4 w-4" />{lead?.phone}</p><p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{lead?.location}</p></div></CardContent></Card>
      )}
      {activeNav === "activity" && (
        <CrmAuditTrail entityId={leadId} />
      )}
      {activeNav === "scoring" && (
        <Card><CardHeader><CardTitle>Lead Scoring</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Score: {lead?.score || 0}/100</p><p className="text-sm text-muted-foreground mt-2">Based on engagement, company size, and budget</p></CardContent></Card>
      )}
    </StandardPage>
  );
}
