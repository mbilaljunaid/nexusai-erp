import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, Users, MapPin, TrendingUp, Calendar } from "lucide-react";

export default function SupplyChain() {
  const [activeTab, setActiveTab] = useState("partners");

  const { data: partners = [] } = useQuery<any[]>({ queryKey: ["/api/supply-chain/partners"] });
  const { data: shipments = [] } = useQuery<any[]>({ queryKey: ["/api/supply-chain/shipments"] });

  const tabs = [
    { id: "partners", label: "Partners", icon: Users, count: partners.length },
    { id: "shipments", label: "Shipments", icon: Truck, count: shipments.length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Supply Chain Management</h1>
        <p className="text-muted-foreground mt-2">Manage suppliers, shipments, and logistics</p>
      </div>

      <div className="flex gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            onClick={() => setActiveTab(tab.id)}
            className="gap-2"
            data-testid={`button-tab-${tab.id}`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            <Badge variant="secondary">{tab.count}</Badge>
          </Button>
        ))}
      </div>

      {activeTab === "partners" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((partner: any) => (
            <Card key={partner.id} data-testid={`card-partner-${partner.id}`}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    {partner.partnerName}
                  </span>
                  <Badge>{partner.partnerType}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{partner.location}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-xs text-muted-foreground">Rating</span>
                    <div className="text-lg font-bold">{partner.rating}★</div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Reliability</span>
                    <div className="text-lg font-bold">{partner.reliabilityScore}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "shipments" && (
        <div className="space-y-3">
          {shipments.map((shipment: any) => (
            <Card key={shipment.id} data-testid={`card-shipment-${shipment.id}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-semibold">{shipment.shipmentNumber}</h4>
                      <p className="text-xs text-muted-foreground">Tracking: {shipment.trackingNumber}</p>
                    </div>
                  </div>
                  <Badge variant={shipment.status === "in-transit" ? "default" : "outline"}>{shipment.status}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-muted-foreground">From</span>
                    <p className="text-sm font-medium">{shipment.origin}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">To</span>
                    <p className="text-sm font-medium">{shipment.destination}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Cost</span>
                    <p className="text-sm font-bold">${shipment.cost}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">ETA</span>
                    <p className="text-sm font-medium">{new Date(shipment.arrivalDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
