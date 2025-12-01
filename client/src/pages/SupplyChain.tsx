import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Truck, Users, MapPin, TrendingUp, Calendar, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SupplyChain() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("partners");
  const [newPartner, setNewPartner] = useState({ name: "", type: "Supplier", location: "" });
  const [newShipment, setNewShipment] = useState({ number: "", status: "pending", destination: "" });

  const { data: partners = [], isLoading: partnersLoading } = useQuery<any[]>({ queryKey: ["/api/supply-chain/partners"], queryFn: () => fetch("/api/supply-chain/partners").then(r => r.json()).catch(() => []) });
  const { data: shipments = [], isLoading: shipmentsLoading } = useQuery<any[]>({ queryKey: ["/api/supply-chain/shipments"], queryFn: () => fetch("/api/supply-chain/shipments").then(r => r.json()).catch(() => []) });

  const createPartnerMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/supply-chain/partners", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supply-chain/partners"] });
      setNewPartner({ name: "", type: "Supplier", location: "" });
      toast({ title: "Partner created" });
    },
  });

  const deletePartnerMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/supply-chain/partners/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supply-chain/partners"] });
      toast({ title: "Partner deleted" });
    },
  });

  const createShipmentMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/supply-chain/shipments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supply-chain/shipments"] });
      setNewShipment({ number: "", status: "pending", destination: "" });
      toast({ title: "Shipment created" });
    },
  });

  const deleteShipmentMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/supply-chain/shipments/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supply-chain/shipments"] });
      toast({ title: "Shipment deleted" });
    },
  });

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
        <div className="space-y-4 p-4">
          <Card data-testid="card-new-partner">
            <CardHeader><CardTitle className="text-base">Add Partner</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <Input placeholder="Partner name" value={newPartner.name} onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })} data-testid="input-name" />
                <Select value={newPartner.type} onValueChange={(v) => setNewPartner({ ...newPartner, type: v })}>
                  <SelectTrigger data-testid="select-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Supplier">Supplier</SelectItem>
                    <SelectItem value="Carrier">Carrier</SelectItem>
                    <SelectItem value="Distributor">Distributor</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Location" value={newPartner.location} onChange={(e) => setNewPartner({ ...newPartner, location: e.target.value })} data-testid="input-location" />
              </div>
              <Button onClick={() => createPartnerMutation.mutate(newPartner)} disabled={createPartnerMutation.isPending || !newPartner.name} className="w-full" data-testid="button-add-partner">
                <Plus className="w-4 h-4 mr-2" /> Add Partner
              </Button>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partnersLoading ? <p>Loading...</p> : partners.length === 0 ? <p className="text-muted-foreground col-span-3 text-center py-4">No partners</p> : partners.map((partner: any) => (
              <Card key={partner.id} data-testid={`partner-${partner.id}`} className="hover-elevate">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2"><Users className="h-5 w-5 text-blue-600" />{partner.name || partner.partnerName}</span>
                    <Button size="icon" variant="ghost" onClick={() => deletePartnerMutation.mutate(partner.id)} data-testid={`button-delete-${partner.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{partner.location}</span>
                  </div>
                  <Badge>{partner.type || partner.partnerType}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "shipments" && (
        <div className="space-y-4 p-4">
          <Card data-testid="card-new-shipment">
            <CardHeader><CardTitle className="text-base">Create Shipment</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <Input placeholder="Shipment #" value={newShipment.number} onChange={(e) => setNewShipment({ ...newShipment, number: e.target.value })} data-testid="input-number" />
                <Input placeholder="Destination" value={newShipment.destination} onChange={(e) => setNewShipment({ ...newShipment, destination: e.target.value })} data-testid="input-destination" />
                <Select value={newShipment.status} onValueChange={(v) => setNewShipment({ ...newShipment, status: v })}>
                  <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-transit">In Transit</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => createShipmentMutation.mutate(newShipment)} disabled={createShipmentMutation.isPending || !newShipment.number} className="w-full" data-testid="button-add-shipment">
                <Plus className="w-4 h-4 mr-2" /> Create Shipment
              </Button>
            </CardContent>
          </Card>
          <div className="space-y-3">
            {shipmentsLoading ? <p>Loading...</p> : shipments.length === 0 ? <p className="text-muted-foreground text-center py-4">No shipments</p> : shipments.map((shipment: any) => (
              <Card key={shipment.id} data-testid={`shipment-${shipment.id}`} className="hover-elevate">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Truck className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-semibold">{shipment.number || shipment.shipmentNumber}</h4>
                        <p className="text-xs text-muted-foreground">To: {shipment.destination}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Badge variant={shipment.status === "in-transit" ? "default" : "secondary"}>{shipment.status}</Badge>
                      <Button size="icon" variant="ghost" onClick={() => deleteShipmentMutation.mutate(shipment.id)} data-testid={`button-delete-${shipment.id}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
