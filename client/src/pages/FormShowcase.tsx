import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconNavigation } from "@/components/IconNavigation";
import { BudgetEntryForm } from "@/components/forms/BudgetEntryForm";
import { ForecastSubmissionForm } from "@/components/forms/ForecastSubmissionForm";
import { ScenarioBuilderForm } from "@/components/forms/ScenarioBuilderForm";
import { LeadEntryForm } from "@/components/forms/LeadEntryForm";
import { EmployeeEntryForm } from "@/components/forms/EmployeeEntryForm";
import { GLEntryForm } from "@/components/forms/GLEntryForm";
import { ServiceTicketForm } from "@/components/forms/ServiceTicketForm";
import { InvoiceEntryForm } from "@/components/forms/InvoiceEntryForm";
import { CampaignEntryForm } from "@/components/forms/CampaignEntryForm";
import VendorEntryForm from "@/components/forms/VendorEntryForm";
import PayrollForm from "@/components/forms/PayrollForm";
import PerformanceRatingForm from "@/components/forms/PerformanceRatingForm";
import CustomerEntryForm from "@/components/forms/CustomerEntryForm";
import AdjustmentEntryForm from "@/components/forms/AdjustmentEntryForm";
import RequisitionForm from "@/components/forms/RequisitionForm";
import { OpportunityForm } from "@/components/forms/OpportunityForm";
import { Sparkles, DollarSign, Users, Briefcase, TrendingUp, FileText, BarChart3 } from "lucide-react";

export default function FormShowcase() {
  const [activeNav, setActiveNav] = useState("epm");

  const navItems = [
    { id: "epm", label: "EPM", icon: DollarSign, color: "text-blue-500" }
    { id: "crm", label: "CRM", icon: Users, color: "text-purple-500" }
    { id: "hr", label: "HR", icon: Briefcase, color: "text-green-500" }
    { id: "erp", label: "ERP", icon: TrendingUp, color: "text-orange-500" }
    { id: "finance", label: "Finance", icon: FileText, color: "text-yellow-500" }
    { id: "all", label: "All Forms", icon: BarChart3, color: "text-indigo-500" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-blue-600" />
          NexusAI Form Showcase
        </h1>
        <p className="text-muted-foreground text-sm mt-2">
          Production-ready form components across all modules
        </p>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "epm" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">EPM Forms</h2>
          <BudgetEntryForm />
        </div>
      )}
      {activeNav === "crm" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">CRM Forms</h2>
          <LeadEntryForm />
        </div>
      )}
      {activeNav === "hr" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">HR Forms</h2>
          <EmployeeEntryForm />
        </div>
      )}
      {activeNav === "erp" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">ERP Forms</h2>
          <GLEntryForm />
        </div>
      )}
      {activeNav === "finance" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Finance Forms</h2>
          <InvoiceEntryForm />
        </div>
      )}
      {activeNav === "all" && (
        <Card><CardHeader><CardTitle className="text-base">All Forms</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">16+ production-ready forms across all modules</p></CardContent></Card>
      )}
    </div>
  );
}
