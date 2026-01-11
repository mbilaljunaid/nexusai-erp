import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, Plus, MapPin, ShieldOff } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export default function TaxManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("codes");

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Tax Management
        </h1>
        <p className="text-muted-foreground mt-2">Configure tax jurisdictions, codes, and exemptions.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="codes" className="gap-2"><FileText className="w-4 h-4" /> Tax Codes</TabsTrigger>
          <TabsTrigger value="jurisdictions" className="gap-2"><MapPin className="w-4 h-4" /> Jurisdictions</TabsTrigger>
          <TabsTrigger value="exemptions" className="gap-2"><ShieldOff className="w-4 h-4" /> Exemptions</TabsTrigger>
        </TabsList>

        <TabsContent value="codes" className="py-4">
          <TaxCodesTab />
        </TabsContent>
        <TabsContent value="jurisdictions" className="py-4">
          <TaxJurisdictionsTab />
        </TabsContent>
        <TabsContent value="exemptions" className="py-4">
          <TaxExemptionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TaxCodesTab() {
  const { toast } = useToast();
  const [newCode, setNewCode] = useState({ name: "", rate: "", jurisdictionId: "" });

  const { data: codes = [], isLoading } = useQuery({
    queryKey: ["/api/tax/codes"],
    queryFn: api.tax.codes.list
  });

  const { data: jurisdictions = [] } = useQuery({
    queryKey: ["/api/tax/jurisdictions"],
    queryFn: api.tax.jurisdictions.list
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.tax.codes.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tax/codes"] });
      setNewCode({ name: "", rate: "", jurisdictionId: "" });
      toast({ title: "Tax Code Created" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Add Tax Code</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <Input placeholder="Code Name (e.g., CA State)" value={newCode.name} onChange={e => setNewCode({ ...newCode, name: e.target.value })} />
            <Input placeholder="Rate (e.g., 0.075)" value={newCode.rate} onChange={e => setNewCode({ ...newCode, rate: e.target.value })} />
            <Select value={newCode.jurisdictionId} onValueChange={v => setNewCode({ ...newCode, jurisdictionId: v })}>
              <SelectTrigger><SelectValue placeholder="Jurisdiction" /></SelectTrigger>
              <SelectContent>
                {jurisdictions.map((j: any) => (
                  <SelectItem key={j.id} value={String(j.id)}>{j.name} ({j.type})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button disabled={createMutation.isPending || !newCode.name} onClick={() => createMutation.mutate({ ...newCode, jurisdictionId: Number(newCode.jurisdictionId) })}>
              <Plus className="w-4 h-4 mr-2" /> Create Code
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {isLoading && <p>Loading...</p>}
        {!isLoading && codes.map((c: any) => (
          <Card key={c.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <h3 className="font-bold">{c.name}</h3>
                <p className="text-sm text-gray-500">Rate: {(Number(c.rate) * 100).toFixed(2)}%</p>
              </div>
              <Badge variant={c.active ? "default" : "secondary"}>{c.active ? "Active" : "Inactive"}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TaxJurisdictionsTab() {
  const { toast } = useToast();
  const [newItem, setNewItem] = useState({ name: "", type: "State" });

  const { data: jurisdictions = [], isLoading } = useQuery({
    queryKey: ["/api/tax/jurisdictions"],
    queryFn: api.tax.jurisdictions.list
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.tax.jurisdictions.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tax/jurisdictions"] });
      setNewItem({ name: "", type: "State" });
      toast({ title: "Jurisdiction Created" });
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Add Jurisdiction</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Input placeholder="Name (e.g., California)" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
            <Select value={newItem.type} onValueChange={v => setNewItem({ ...newItem, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Country">Country</SelectItem>
                <SelectItem value="State">State</SelectItem>
                <SelectItem value="City">City</SelectItem>
                <SelectItem value="County">County</SelectItem>
              </SelectContent>
            </Select>
            <Button disabled={createMutation.isPending || !newItem.name} onClick={() => createMutation.mutate(newItem)}>
              <Plus className="w-4 h-4 mr-2" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        {isLoading && <p>Loading...</p>}
        {!isLoading && jurisdictions.map((j: any) => (
          <Card key={j.id}>
            <CardContent className="p-4">
              <h3 className="font-bold">{j.name}</h3>
              <Badge variant="outline">{j.type}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TaxExemptionsTab() {
  const { toast } = useToast();
  const [newItem, setNewItem] = useState({ customerId: "", siteId: "", taxCodeId: "", exemptionType: "Full", exemptionValue: "0" });

  const { data: exemptions = [], isLoading } = useQuery({
    queryKey: ["/api/tax/exemptions"],
    queryFn: api.tax.exemptions.list
  });

  const { data: codes = [] } = useQuery({
    queryKey: ["/api/tax/codes"],
    queryFn: api.tax.codes.list
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.tax.exemptions.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tax/exemptions"] });
      toast({ title: "Exemption Created" });
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Add Exemption Rule</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            <Input placeholder="Cust ID/Site ID (Optional)" value={newItem.customerId} onChange={e => setNewItem({ ...newItem, customerId: e.target.value })} />
            <Select value={newItem.taxCodeId} onValueChange={v => setNewItem({ ...newItem, taxCodeId: v })}>
              <SelectTrigger><SelectValue placeholder="Tax Code" /></SelectTrigger>
              <SelectContent>
                {codes.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={newItem.exemptionType} onValueChange={v => setNewItem({ ...newItem, exemptionType: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Full">Full Exempt</SelectItem>
                <SelectItem value="Partial">Partial</SelectItem>
              </SelectContent>
            </Select>

            {newItem.exemptionType === 'Partial' && (
              <Input placeholder="Value (0.5 = 50%)" value={newItem.exemptionValue} onChange={e => setNewItem({ ...newItem, exemptionValue: e.target.value })} />
            )}

            <Button disabled={createMutation.isPending || !newItem.taxCodeId} onClick={() => createMutation.mutate({ ...newItem, taxCodeId: Number(newItem.taxCodeId) })}>
              <Plus className="w-4 h-4 mr-2" /> Add Rule
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {isLoading && <p>Loading...</p>}
        {!isLoading && exemptions.map((e: any) => (
          <div key={e.id} className="p-2 border rounded flex justify-between">
            <span>Tax Code ID: {e.taxCodeId} - {e.exemptionType} {e.exemptionValue > 0 ? `(${e.exemptionValue})` : ''}</span>
            <span className="text-muted-foreground text-sm">Cust: {e.customerId || 'All'} / Site: {e.siteId || 'All'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
