import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { IconNavigation, NavItem } from "@/components/IconNavigation";
import { ShoppingCart, Truck, FileText, DollarSign, Gavel, BarChart3, BrainCircuit, Users } from "lucide-react";

import { ProcurementDashboard } from "@/components/procurement/ProcurementDashboard";
import { PurchaseOrderManager } from "@/components/procurement/PurchaseOrderManager";
import { SupplierManager } from "@/components/procurement/SupplierManager";
import { ReceiptManager } from "@/components/procurement/ReceiptManager";
import { RequisitionManager } from "@/components/procurement/RequisitionManager";
import { InvoiceWorkbench } from "@/components/procurement/InvoiceWorkbench";
import SourcingWorkbench from "@/components/procurement/SourcingWorkbench";
import ContractWorkbench from "@/components/procurement/ContractWorkbench";
import { ProcurementAI } from "@/components/procurement/ProcurementAI";

export default function ProcurementManagement() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const navItems: NavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, color: "text-blue-500" },
    { id: "requisitions", label: "Requisitions", icon: FileText, color: "text-orange-500" },
    { id: "pos", label: "Orders (PO)", icon: ShoppingCart, color: "text-green-500" },
    { id: "receiving", label: "Receiving", icon: Truck, color: "text-purple-500" },
    { id: "invoices", label: "Invoices", icon: DollarSign, color: "text-emerald-500" },
    { id: "contracts", label: "Contracts", icon: FileText, color: "text-indigo-500" },
    { id: "sourcing", label: "Sourcing", icon: Gavel, color: "text-amber-500" },
    { id: "suppliers", label: "Suppliers", icon: Users, color: "text-cyan-500" },
    { id: "ai", label: "AI Insights", icon: BrainCircuit, color: "text-pink-500" },
  ];

  return (
    <StandardPage
      title="Procurement & Supply Chain"
      description="Enterprise Source-to-Pay Management: Requisitions, Orders, Receipts, and Invoicing"
      breadcrumbs={[{ label: "Procurement", href: "/procurement" }]}
    >
      <IconNavigation items={navItems} activeId={activeTab} onSelect={setActiveTab} />

      <div className="mt-6">
        {activeTab === "dashboard" && <ProcurementDashboard onViewChange={setActiveTab} />}
        {activeTab === "requisitions" && <RequisitionManager />}
        {activeTab === "pos" && <PurchaseOrderManager />}
        {activeTab === "receiving" && <ReceiptManager />}
        {activeTab === "invoices" && <InvoiceWorkbench />}
        {activeTab === "contracts" && <ContractWorkbench />}
        {activeTab === "sourcing" && <SourcingWorkbench />}
        {activeTab === "suppliers" && <SupplierManager />}
        {activeTab === "ai" && <ProcurementAI onViewChange={setActiveTab} />}
      </div>
    </StandardPage>
  );
}
