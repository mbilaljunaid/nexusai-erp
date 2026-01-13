import { useState } from "react";
import { ShoppingCart, Truck, FileText, DollarSign, Gavel, BarChart3, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";

import { ProcurementDashboard } from "@/components/procurement/ProcurementDashboard";
import { PurchaseOrderManager } from "@/components/procurement/PurchaseOrderManager";
import { SupplierManager } from "@/components/procurement/SupplierManager";
import { ReceiptManager } from "@/components/procurement/ReceiptManager";
import { RequisitionManager } from "@/components/procurement/RequisitionManager";
import { InvoiceWorkbench } from "@/components/procurement/InvoiceWorkbench";
import { SourcingManager } from "@/components/procurement/SourcingManager";
import { ProcurementAI } from "@/components/procurement/ProcurementAI";

export default function ProcurementManagement() {
  const [viewType, setViewType] = useState("dashboard");

  return (
    <div className="space-y-6 p-4" data-testid="procurement-management">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShoppingCart className="h-8 w-8 text-primary" />
          Procurement & Supply Chain
        </h1>
        <p className="text-muted-foreground mt-1">Enterprise Source-to-Pay Management</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button variant={viewType === "dashboard" ? "default" : "outline"} onClick={() => setViewType("dashboard")}>
          <BarChart3 className="w-4 h-4 mr-2" /> Dashboard
        </Button>
        <Button variant={viewType === "pos" ? "default" : "outline"} onClick={() => setViewType("pos")}>
          <ShoppingCart className="w-4 h-4 mr-2" /> Orders
        </Button>
        <Button variant={viewType === "receiving" ? "default" : "outline"} onClick={() => setViewType("receiving")}>
          <Truck className="w-4 h-4 mr-2" /> Receiving
        </Button>
        <Button variant={viewType === "requisitions" ? "default" : "outline"} onClick={() => setViewType("requisitions")}>
          <FileText className="w-4 h-4 mr-2" /> Requisitions
        </Button>
        <Button variant={viewType === "invoices" ? "default" : "outline"} onClick={() => setViewType("invoices")}>
          <DollarSign className="w-4 h-4 mr-2" /> Invoices
        </Button>
        <Button variant={viewType === "sourcing" ? "default" : "outline"} onClick={() => setViewType("sourcing")}>
          <Gavel className="w-4 h-4 mr-2" /> Sourcing
        </Button>
        <Button variant={viewType === "ai" ? "default" : "outline"} onClick={() => setViewType("ai")}>
          <BrainCircuit className="w-4 h-4 mr-2" /> AI Insights
        </Button>
        <Button variant={viewType === "suppliers" ? "default" : "outline"} onClick={() => setViewType("suppliers")}>
          Suppliers
        </Button>
      </div>

      <div className="mt-6">
        {viewType === "dashboard" && <ProcurementDashboard onViewChange={setViewType} />}
        {viewType === "pos" && <PurchaseOrderManager />}
        {viewType === "receiving" && <ReceiptManager />}
        {viewType === "requisitions" && <RequisitionManager />}
        {viewType === "invoices" && <InvoiceWorkbench />}
        {viewType === "sourcing" && <SourcingManager />}
        {viewType === "ai" && <ProcurementAI onViewChange={setViewType} />}
        {viewType === "suppliers" && <SupplierManager />}
      </div>
    </div>
  );
}
