import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BomForm } from "@/components/forms/BomForm";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SmartAddButton } from "@/components/SmartAddButton";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";
import { Factory, Package, Zap, QrCode } from "lucide-react";
import { Link } from "wouter";

export default function Manufacturing() {
  const [activeNav, setActiveNav] = useState("workorders");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredWorkOrders, setFilteredWorkOrders] = useState<any[]>([]);
  const { data: workOrders = [] } = useQuery<any[]>({ queryKey: ["/api/manufacturing/work-orders"], retry: false });
  const formMetadata = getFormMetadata("workorder");

  const navItems = [
    { id: "bom", label: "Bill of Materials", icon: Package, color: "text-blue-500" },
    { id: "workorders", label: "Work Orders", icon: Zap, color: "text-orange-500" },
    { id: "production", label: "Production", icon: Factory, color: "text-purple-500" },
    { id: "quality", label: "Quality Control", icon: QrCode, color: "text-green-500" },
  ];

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb items={formMetadata?.breadcrumbs?.slice(1) || []} />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Factory className="w-8 h-8" />
            Manufacturing
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage BOMs, work orders, production planning, and quality control
          </p>
        </div>
        <SmartAddButton formId="workorder" formMetadata={formMetadata} formId="workorder" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {navItems.map((item) => (
          <Link key={item.id} to={item.id === "bom" ? `/manufacturing/bom` : `/manufacturing/${item.id}`}>
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:border-primary hover-elevate cursor-pointer transition-all">
              <item.icon className={`w-6 h-6 ${item.color}`} />
              <span className="text-sm font-medium text-center">{item.label}</span>
            </div>
          </Link>
        ))}
      </div>

      {activeNav === "workorders" && (
        <div className="space-y-6">
          <FormSearchWithMetadata
            formMetadata={formMetadata}
            value={searchQuery}
            onChange={setSearchQuery}
            data={workOrders}
            onFilter={setFilteredWorkOrders}
          />
          <div className="grid gap-4">
            {filteredWorkOrders.length > 0 ? filteredWorkOrders.map((wo: any) => (
              <Card key={wo.id} className="hover:bg-muted/50 transition">
                <CardContent className="pt-6">
                  <div className="flex justify-between"><div><p className="font-semibold">{wo.workOrderNumber}</p><p className="text-sm text-muted-foreground">{wo.description}</p></div><Badge>{wo.status}</Badge></div>
                </CardContent>
              </Card>
            )) : <p className="text-muted-foreground text-center py-4">No work orders found</p>}
          </div>
        </div>
      )}

