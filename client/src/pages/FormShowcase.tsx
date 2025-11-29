import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Sparkles } from "lucide-react";

export default function FormShowcase() {
  const [activeTab, setActiveTab] = useState("epm");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-blue-600" />
          NexusAI Form Showcase
        </h1>
        <p className="text-muted-foreground text-sm mt-2">
          Production-ready form components showcasing AI-first enterprise design across all modules
        </p>
      </div>

      {/* Module Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        {[
          { title: "EPM", count: 3, color: "bg-blue-100 dark:bg-blue-950" },
          { title: "CRM", count: 3, color: "bg-purple-100 dark:bg-purple-950" },
          { title: "HR", count: 3, color: "bg-green-100 dark:bg-green-950" },
          { title: "ERP", count: 4, color: "bg-orange-100 dark:bg-orange-950" },
          { title: "Finance", count: 2, color: "bg-yellow-100 dark:bg-yellow-950" },
          { title: "Service", count: 1, color: "bg-red-100 dark:bg-red-950" }
        ].map((module) => (
          <Card key={module.title}>
            <CardContent className={`p-4 ${module.color}`}>
              <p className="font-semibold text-sm">{module.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {typeof module.count === "number" ? `${module.count} forms` : module.count}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Forms Showcase */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:grid-cols-7">
          <TabsTrigger value="epm">EPM</TabsTrigger>
          <TabsTrigger value="crm">CRM</TabsTrigger>
          <TabsTrigger value="hr">HR</TabsTrigger>
          <TabsTrigger value="erp">ERP</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="service">Service</TabsTrigger>
          <TabsTrigger value="forms">All Forms</TabsTrigger>
        </TabsList>

        {/* EPM Forms */}
        <TabsContent value="epm" className="space-y-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">Enterprise Performance Management Forms</h2>
              <p className="text-sm text-muted-foreground">Budget planning, forecasting, and scenario modeling with AI insights</p>
            </div>

            <Tabs defaultValue="budget" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="budget">Budget Entry</TabsTrigger>
                <TabsTrigger value="forecast">Forecast</TabsTrigger>
                <TabsTrigger value="scenario">Scenario</TabsTrigger>
              </TabsList>

              <TabsContent value="budget">
                <BudgetEntryForm />
              </TabsContent>

              <TabsContent value="forecast">
                <ForecastSubmissionForm />
              </TabsContent>

              <TabsContent value="scenario">
                <ScenarioBuilderForm />
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>

        {/* CRM Forms */}
        <TabsContent value="crm" className="space-y-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">CRM & Sales Forms</h2>
              <p className="text-sm text-muted-foreground">Lead management, opportunity tracking, and account management</p>
            </div>

            <Tabs defaultValue="lead" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="lead">Lead Entry</TabsTrigger>
                <TabsTrigger value="customer">Customer</TabsTrigger>
                <TabsTrigger value="opp">Opportunity</TabsTrigger>
              </TabsList>

              <TabsContent value="lead">
                <LeadEntryForm />
              </TabsContent>

              <TabsContent value="customer">
                <CustomerEntryForm />
              </TabsContent>

              <TabsContent value="opp">
                <OpportunityForm />
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>

        {/* HR Forms */}
        <TabsContent value="hr" className="space-y-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">HR & Talent Forms</h2>
              <p className="text-muted-foreground text-sm">Employee management, payroll, and talent development</p>
            </div>

            <Tabs defaultValue="employee" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="employee">Employee</TabsTrigger>
                <TabsTrigger value="payroll">Payroll</TabsTrigger>
                <TabsTrigger value="perf">Performance</TabsTrigger>
                <TabsTrigger value="req">Requisition</TabsTrigger>
              </TabsList>

              <TabsContent value="employee">
                <EmployeeEntryForm />
              </TabsContent>

              <TabsContent value="payroll">
                <PayrollForm />
              </TabsContent>

              <TabsContent value="perf">
                <PerformanceRatingForm />
              </TabsContent>

              <TabsContent value="req">
                <RequisitionForm />
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>

        {/* ERP Forms */}
        <TabsContent value="erp" className="space-y-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">ERP & Finance Forms</h2>
              <p className="text-sm text-muted-foreground">General ledger, invoicing, and accounting transactions</p>
            </div>

            <Tabs defaultValue="glentry" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="glentry">GL Entry</TabsTrigger>
                <TabsTrigger value="vendor">Vendor</TabsTrigger>
                <TabsTrigger value="invoice">Invoice</TabsTrigger>
              </TabsList>

              <TabsContent value="glentry">
                <GLEntryForm />
              </TabsContent>

              <TabsContent value="vendor">
                <VendorEntryForm />
              </TabsContent>

              <TabsContent value="invoice">
                <InvoiceEntryForm />
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>

        {/* Finance Forms */}
        <TabsContent value="finance" className="space-y-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">Finance & Closing Forms</h2>
              <p className="text-sm text-muted-foreground">Period closing, adjustments, and reconciliation workflows</p>
            </div>

            <Tabs defaultValue="adjustment" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="adjustment">Adjustment Entry</TabsTrigger>
                <TabsTrigger value="reconcile">Reconciliation (Coming)</TabsTrigger>
              </TabsList>

              <TabsContent value="adjustment">
                <AdjustmentEntryForm />
              </TabsContent>

              <TabsContent value="reconcile">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground text-sm">Reconciliation form loading with:</p>
                    <ul className="text-sm text-muted-foreground mt-3 space-y-1 list-disc list-inside">
                      <li>Bank-to-GL reconciliation</li>
                      <li>AI-assisted matching of transactions</li>
                      <li>Exception handling and review</li>
                      <li>Historical variance tracking</li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>

        {/* Service Forms */}
        <TabsContent value="service" className="space-y-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">Service & Support Forms</h2>
              <p className="text-sm text-muted-foreground">Customer support ticketing with AI triage and SLA management</p>
            </div>

            <Tabs defaultValue="ticket" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ticket">Service Ticket</TabsTrigger>
                <TabsTrigger value="kb">KB Article (Coming)</TabsTrigger>
              </TabsList>

              <TabsContent value="ticket">
                <ServiceTicketForm />
              </TabsContent>

              <TabsContent value="kb">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground text-sm">Knowledge base article form loading with:</p>
                    <ul className="text-sm text-muted-foreground mt-3 space-y-1 list-disc list-inside">
                      <li>Article content editor</li>
                      <li>Category and tagging</li>
                      <li>Search optimization</li>
                      <li>Version control</li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>

        {/* Design Guide */}
        <TabsContent value="guide" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>NexusAI Design System</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-sm mb-2">Design Principles</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>AI-First: Every major feature includes AI insights or assistance</li>
                    <li>Role-Aware: UI adapts to user role and permissions</li>
                    <li>Data-Dense but Clean: Maximum information without clutter</li>
                    <li>Actionable: Every metric has associated actions</li>
                    <li>Responsive: Works seamlessly on desktop, tablet, mobile</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-2">Form Categories</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge>Configuration Forms</Badge>
                      <span className="text-xs text-muted-foreground">Admin setup, accessed from Settings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Data Entry Forms</Badge>
                      <span className="text-xs text-muted-foreground">User workflows, primary interactions</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-2">AI Features Showcase</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li><strong>Auto-Suggestions:</strong> AI recommends values (growth rates, allocations)</li>
                    <li><strong>Smart Defaults:</strong> Intelligent pre-population from context</li>
                    <li><strong>Inline Validation:</strong> Real-time guidance and error prevention</li>
                    <li><strong>Anomaly Detection:</strong> Flags unusual entries automatically</li>
                    <li><strong>Confidence Indicators:</strong> AI shows confidence levels and reasoning</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Forms Reference */}
        <TabsContent value="forms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Complete Form Inventory</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">All 70+ forms designed and documented (15 shown as samples)</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { module: "EPM", forms: ["Budget Entry", "Forecast Submission", "Scenario Builder", "Consolidation Setup", "Variance Report"] },
                  { module: "ERP", forms: ["GL Entry", "Invoice Entry", "PO Entry", "Chart of Accounts", "Bank Reconciliation"] },
                  { module: "CRM", forms: ["Lead Entry", "Opportunity Entry", "Account Entry", "Contact Entry", "Quote Entry"] },
                  { module: "HR", forms: ["Employee Entry", "Timesheet", "Leave Request", "Performance Rating", "Payroll Setup"] },
                  { module: "Project", forms: ["Project Entry", "Task Entry", "Time Tracking", "Expense Entry", "Resource Planning"] },
                  { module: "Service", forms: ["Ticket Entry", "SLA Setup", "KB Article", "Feedback Form", "Field Service"] },
                  { module: "Marketing", forms: ["Campaign Entry", "Lead Upload", "Email Template", "Segment Builder", "Journey Map"] },
                  { module: "E-Commerce", forms: ["Product Entry", "Order Entry", "Customer Entry", "Promotion Setup", "Inventory Adjustment"] }
                ].map((cat) => (
                  <div key={cat.module} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-sm mb-2">{cat.module}</h3>
                    <div className="flex flex-wrap gap-2">
                      {cat.forms.map((form) => (
                        <Badge key={form} variant="secondary" className="text-xs">{form}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-900">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Complete documentation available:</strong> FORM_DESIGNS.md contains all 70+ form specifications with field types, validation rules, AI features, and layout details
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-0">
        <CardContent className="p-6">
          <div className="space-y-2">
            <p className="font-semibold text-sm">Production-Ready Implementation</p>
            <p className="text-sm text-muted-foreground">
              These forms showcase the complete NexusAI design system with Material Design 3, dark mode support, AI-first features, responsive layouts, and enterprise validation. All forms are built with React, Tailwind CSS, and shadcn/ui components, ready for full platform deployment.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
