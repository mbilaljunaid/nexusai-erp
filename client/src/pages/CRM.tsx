import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";
import { openFormInNewWindow } from "@/lib/formUtils";
import { Target, Users, BarChart3, TrendingUp, Mail, Phone, FileText, Settings, Activity, Package, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import OpportunitiesDetail from "./OpportunitiesDetail";
import CampaignsDetail from "./CampaignsDetail";
import ProductsDetail from "./ProductsDetail";
import QuotesDetail from "./QuotesDetail";
import CasesDetail from "./CasesDetail";
import AnalyticsDetail from "./AnalyticsDetail";
import CrmDashboard from "./crm/CrmDashboard";



export default function CRM() {
  const [match, params] = useRoute("/crm/:page?");
  const [activeNav, setActiveNav] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLeads, setFilteredLeads] = useState<any[]>([]);
  const leadsMetadata = getFormMetadata("leads");

  useEffect(() => {
    if (params?.page) {
      setActiveNav(params.page);
    } else {
      setActiveNav("overview");
    }
  }, [params?.page]);

  const { data: leads = [] } = useQuery<any[]>({ queryKey: ["/api/leads"], retry: false });

  const navItems = [
    { id: "overview", label: "Overview", icon: BarChart3, color: "text-blue-500", formId: null },
    { id: "leads", label: "Leads", icon: Users, color: "text-green-500", formId: "leads" },
    { id: "opportunities", label: "Opportunities", icon: Target, color: "text-purple-500", formId: "opportunities" },
    { id: "accounts", label: "Accounts", icon: FileText, color: "text-orange-500", formId: "accounts" },
    { id: "contacts", label: "Contacts", icon: Phone, color: "text-pink-500", formId: "contacts" },
    { id: "products", label: "Products", icon: Package, color: "text-red-500", formId: "products" },
    { id: "quotes", label: "Quotes", icon: FileText, color: "text-amber-500", formId: "quotes" },
    { id: "campaigns", label: "Campaigns", icon: Mail, color: "text-cyan-500", formId: "campaigns" },
    { id: "cases", label: "Cases", icon: MessageSquare, color: "text-rose-500", formId: "cases" },
    { id: "pipeline", label: "Pipeline", icon: TrendingUp, color: "text-indigo-500", formId: null },
    { id: "analytics", label: "Analytics", icon: Activity, color: "text-yellow-500", formId: null },
    { id: "settings", label: "Settings", icon: Settings, color: "text-slate-500", formId: null },
  ];

  /* Removed inline Leads, Accounts, Contacts render blocks in favor of routing */

  const [location, setLocation] = useLocation();

  const handleIconClick = (id: string, formId: string | null) => {
    // Check for standalone pages
    if (["leads", "accounts", "contacts", "opportunities", "campaigns", "products", "quotes", "cases", "analytics", "pipeline", "settings"].includes(id)) {
      setLocation(`/crm/${id}`);
      return;
    }

    if (formId) {
      openFormInNewWindow(formId, `${formId.charAt(0).toUpperCase() + formId.slice(1)} Form`);
    } else {
      setActiveNav("overview");
    }
  };

  return (
    <div className="space-y-6 min-h-screen overflow-y-auto">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><Target className="h-6 w-6" />CRM & Sales</h1>
        <p className="text-muted-foreground text-sm">Manage leads, opportunities, accounts, contacts, and campaigns</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleIconClick(item.id, item.formId)}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${!item.formId ? "hover:border-primary hover-elevate bg-card" : "hover:bg-primary/5 hover:border-primary hover-elevate bg-card"
              }`}
            data-testid={`button-icon-${item.id}`}
          >
            <div className={`p-2 rounded-lg bg-muted/30 mb-1 group-hover:scale-110 transition-transform`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <span className="text-xs font-semibold text-center tracking-tight">{item.label}</span>
          </button>
        ))}
      </div>

      {activeNav === "overview" && <CrmDashboard />}

      {activeNav === "opportunities" && <OpportunitiesDetail />}

      {activeNav === "campaigns" && <CampaignsDetail />}

      {activeNav === "products" && <ProductsDetail />}

      {activeNav === "quotes" && <QuotesDetail />}

      {activeNav === "cases" && <CasesDetail />}

      {activeNav === "pipeline" && (
        <div className="space-y-4">
          <Breadcrumb items={[
            { label: "CRM", path: "/crm" },
            { label: "Pipeline", path: "/crm/pipeline" },
          ]} />
          <Card><CardHeader><CardTitle>Sales Pipeline</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Visualize your sales pipeline by stage</p></CardContent></Card>
        </div>
      )}

      {activeNav === "analytics" && <AnalyticsDetail />}

      {activeNav === "settings" && (
        <div className="space-y-4">
          <Breadcrumb items={[
            { label: "CRM", path: "/crm" },
            { label: "Settings", path: "/crm/settings" },
          ]} />
          <Card><CardHeader><CardTitle>CRM Settings</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Configure CRM workflows and customizations</p></CardContent></Card>
        </div>
      )}
    </div>
  );
}
