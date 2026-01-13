import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Truck, Users } from "lucide-react";
import PartnerList from "./supply-chain/PartnerList";
import ShipmentList from "./supply-chain/ShipmentList";

export default function SupplyChain() {
  const [activeTab, setActiveTab] = useState("partners");

  const tabs = [
    { id: "partners", label: "Partners", icon: Users },
    { id: "shipments", label: "Shipments", icon: Truck },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Supply Chain Management</h1>
        <p className="text-muted-foreground mt-2">Manage suppliers, shipments, and logistics</p>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${activeTab === tab.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:bg-muted"
              }`}
            data-testid={`button-tab-${tab.id}`}
          >
            <tab.icon className="h-4 w-4" />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === "partners" && <PartnerList />}
      {activeTab === "shipments" && <ShipmentList />}
    </div>
  );
}
