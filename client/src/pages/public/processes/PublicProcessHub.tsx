import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

const processes = [
  { id: 1, name: "Procure-to-Pay", description: "Purchase Requisition → Payment", path: "/public/processes/procure-to-pay", color: "bg-blue-500" },
  { id: 2, name: "Order-to-Cash", description: "Lead → Revenue Recognition", path: "/public/processes/order-to-cash", color: "bg-green-500" },
  { id: 3, name: "Hire-to-Retire", description: "Job Opening → Payroll", path: "/public/processes/hire-to-retire", color: "bg-purple-500" },
  { id: 4, name: "Month-End Consolidation", description: "GL Reconciliation → Financial Statements", path: "/public/processes/month-end", color: "bg-orange-500" },
  { id: 5, name: "Compliance & Risk", description: "Audit Trail → Risk Assessment", path: "/public/processes/compliance", color: "bg-red-500" },
  { id: 6, name: "Inventory Management", description: "ItemMaster → Receipt → Issuance", path: "/public/processes/inventory", color: "bg-cyan-500" },
  { id: 7, name: "Fixed Asset Lifecycle", description: "Asset Acquisition → Depreciation → Disposal", path: "/public/processes/fixed-asset", color: "bg-indigo-500" },
  { id: 8, name: "Production Planning", description: "Forecast → MPS → Work Orders", path: "/public/processes/production", color: "bg-amber-500" },
  { id: 9, name: "Material Requirements Planning", description: "MPS → BOM Explosion → Planned Orders", path: "/public/processes/mrp", color: "bg-pink-500" },
  { id: 10, name: "Quality Assurance", description: "Incoming QC → Process Control → NCR", path: "/public/processes/quality", color: "bg-lime-500" },
  { id: 11, name: "Contract Management", description: "Contract Creation → Terms Management", path: "/public/processes/contracts", color: "bg-sky-500" },
  { id: 12, name: "Budget Planning", description: "Budget Prep → GL Loading → Variance Analysis", path: "/public/processes/budget", color: "bg-fuchsia-500" },
  { id: 13, name: "Demand Planning", description: "Sales Forecast → Supply Plan", path: "/public/processes/demand", color: "bg-teal-500" },
  { id: 14, name: "Capacity Planning", description: "Capacity Assessment → Gap Analysis", path: "/public/processes/capacity", color: "bg-rose-500" },
  { id: 15, name: "Warehouse Management", description: "Receipt → Storage → Picking → Cycle Count", path: "/public/processes/warehouse", color: "bg-violet-500" },
  { id: 16, name: "Customer Returns & RMA", description: "Return Authorization → Inspection → Credit", path: "/public/processes/returns", color: "bg-emerald-500" },
  { id: 17, name: "Vendor Performance", description: "Scorecard → Evaluation → Improvement", path: "/public/processes/vendor", color: "bg-slate-500" },
  { id: 18, name: "Subscription Billing", description: "Subscription Order → Billing → Revenue Recognition", path: "/public/processes/subscription", color: "bg-zinc-500" },
];

export default function PublicProcessHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">18 End-to-End Business Processes</h1>
          <p className="text-xl text-slate-300">Master enterprise workflows from sourcing to sales, manufacturing to compliance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processes.map((process) => (
            <Link key={process.id} href={process.path}>
              <Card className="h-full hover:shadow-lg transition-all cursor-pointer bg-slate-800 border-slate-700 hover:border-slate-600">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${process.color} mb-4`} />
                  <CardTitle className="text-white">{process.name}</CardTitle>
                  <CardDescription className="text-slate-300">{process.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full text-slate-300 border-slate-600 hover:bg-slate-700">
                    Explore <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
