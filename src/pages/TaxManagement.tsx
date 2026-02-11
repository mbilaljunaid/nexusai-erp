import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, Plus, MapPin, ShieldOff, LayoutDashboard, Calculator, Eye, Edit, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

import { TaxDashboardTab } from "./tax/TaxDashboardTab";
import { TaxCalculator } from "./tax/TaxCalculator";
import { TaxCodeModal } from "@/components/tax/TaxCodeModal";
import { TaxCalculationPreview } from "@/components/tax/TaxCalculationPreview";
import { JurisdictionModal } from "@/components/tax/JurisdictionModal";
import { ExemptionModal } from "@/components/tax/ExemptionModal";

export default function TaxManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Tax Management
        </h1>
        <p className="text-muted-foreground mt-2">Monitor tax status and configure jurisdictions, codes, and exemptions.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="dashboard" className="gap-2"><LayoutDashboard className="w-4 h-4" /> Dashboard</TabsTrigger>
          <TabsTrigger value="calculator" className="gap-2"><Calculator className="w-4 h-4" /> Simulator</TabsTrigger>
          <TabsTrigger value="preview" className="gap-2"><FileText className="w-4 h-4" /> Preview</TabsTrigger>
          <TabsTrigger value="codes" className="gap-2"><FileText className="w-4 h-4" /> Tax Codes</TabsTrigger>
          <TabsTrigger value="jurisdictions" className="gap-2"><MapPin className="w-4 h-4" /> Jurisdictions</TabsTrigger>
          <TabsTrigger value="exemptions" className="gap-2"><ShieldOff className="w-4 h-4" /> Exemptions</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="py-4">
          <TaxDashboardTab />
        </TabsContent>
        <TabsContent value="calculator" className="py-4">
          <TaxCalculator />
        </TabsContent>
        <TabsContent value="preview" className="py-4">
          <TaxCalculationPreview />
        </TabsContent>
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
  const [modalState, setModalState] = useState<{ isOpen: boolean; mode: 'view' | 'edit' | 'create'; taxCode?: any }>({
    isOpen: false,
    mode: 'create',
    taxCode: null
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const { data: codes = [], isLoading } = useQuery({
    queryKey: ['/api/tax/codes'],
    queryFn: async () => {
      const res = await fetch('/api/tax/codes');
      if (!res.ok) throw new Error('Failed to fetch tax codes');
      return res.json();
    }
  });

  const { data: jurisdictions = [] } = useQuery({
    queryKey: ['/api/tax/jurisdictions'],
    queryFn: async () => {
      const res = await fetch('/api/tax/jurisdictions');
      if (!res.ok) throw new Error('Failed to fetch jurisdictions');
      return res.json();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Soft delete by marking inactive
      const res = await fetch('/api/tax/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: false })
      });
      if (!res.ok) throw new Error('Failed to delete tax code');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Tax Code Deleted', description: 'Successfully marked as inactive' });
      queryClient.invalidateQueries({ queryKey: ['/api/tax/codes'] });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  });

  // Filter codes
  const filteredCodes = codes.filter((code: any) => {
    const matchesSearch = code.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || code.type === filterType;
    const matchesStatus = filterStatus === 'ALL' ||
      (filterStatus === 'ACTIVE' && code.isActive) ||
      (filterStatus === 'INACTIVE' && !code.isActive);
    return matchesSearch && matchesType && matchesStatus;
  });

  const getJurisdictionName = (jurisdictionId: string) => {
    const jurisdiction = jurisdictions.find((j: any) => j.id === jurisdictionId);
    return jurisdiction?.name || 'N/A';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Tax Codes</CardTitle>
            <CardDescription>Manage tax codes and rates</CardDescription>
          </div>
          <Button onClick={() => setModalState({ isOpen: true, mode: 'create', taxCode: null })}>
            <Plus className="w-4 h-4 mr-2" />
            Create Tax Code
          </Button>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Search by code or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="SALES">Sales Tax</SelectItem>
                <SelectItem value="PURCHASE">Purchase Tax</SelectItem>
                <SelectItem value="BOTH">Both</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="p-3 text-left font-medium">Code</th>
                  <th className="p-3 text-left font-medium">Description</th>
                  <th className="p-3 text-left font-medium">Rate</th>
                  <th className="p-3 text-left font-medium">Type</th>
                  <th className="p-3 text-left font-medium">Jurisdiction</th>
                  <th className="p-3 text-left font-medium">Status</th>
                  <th className="p-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      Loading tax codes...
                    </td>
                  </tr>
                ) : filteredCodes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No tax codes found
                    </td>
                  </tr>
                ) : (
                  filteredCodes.map((code: any) => (
                    <tr key={code.id} className="border-b hover:bg-muted/20">
                      <td className="p-3 font-medium">{code.code}</td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {code.description || '-'}
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{code.rate}%</Badge>
                      </td>
                      <td className="p-3 text-sm">{code.type}</td>
                      <td className="p-3 text-sm">
                        {code.jurisdictionId ? getJurisdictionName(code.jurisdictionId) : '-'}
                      </td>
                      <td className="p-3">
                        <Badge variant={code.isActive ? 'default' : 'secondary'}>
                          {code.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setModalState({ isOpen: true, mode: 'view', taxCode: code })}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setModalState({ isOpen: true, mode: 'edit', taxCode: code })}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('Mark this tax code as inactive?')) {
                                deleteMutation.mutate(code.id);
                              }
                            }}
                            disabled={!code.isActive}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tax Code Modal */}
      <TaxCodeModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        taxCode={modalState.taxCode}
        mode={modalState.mode}
      />
    </div>
  );
}

function TaxJurisdictionsTab() {
  const { toast } = useToast();
  const [modalState, setModalState] = useState<{ isOpen: boolean; mode: 'view' | 'edit' | 'create'; jurisdiction?: any }>({
    isOpen: false,
    mode: 'create',
    jurisdiction: null
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const { data: jurisdictions = [], isLoading } = useQuery({
    queryKey: ['/api/tax/jurisdictions'],
    queryFn: async () => {
      const res = await fetch('/api/tax/jurisdictions');
      if (!res.ok) throw new Error('Failed to fetch jurisdictions');
      return res.json();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tax/jurisdictions/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete jurisdiction');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Jurisdiction Deleted', description: 'Successfully deleted jurisdiction' });
      queryClient.invalidateQueries({ queryKey: ['/api/tax/jurisdictions'] });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  });

  // Filter jurisdictions
  const filteredJurisdictions = jurisdictions.filter((j: any) => {
    const matchesSearch = j.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || j.type === filterType;
    return matchesSearch && matchesType;
  });

  // Build hierarchy display (parent → child)
  const getHierarchy = (jurisdiction: any) => {
    if (!jurisdiction.parentId) return null;
    const parent = jurisdictions.find((j: any) => j.id === jurisdiction.parentId);
    return parent ? `${parent.name} → ${jurisdiction.name}` : jurisdiction.name;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Tax Jurisdictions</CardTitle>
            <CardDescription>Manage tax jurisdictions and hierarchies</CardDescription>
          </div>
          <Button onClick={() => setModalState({ isOpen: true, mode: 'create', jurisdiction: null })}>
            <Plus className="w-4 h-4 mr-2" />
            Create Jurisdiction
          </Button>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="Country">Country</SelectItem>
                <SelectItem value="State">State/Province</SelectItem>
                <SelectItem value="County">County</SelectItem>
                <SelectItem value="City">City</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="p-3 text-left font-medium">Name</th>
                  <th className="p-3 text-left font-medium">Code</th>
                  <th className="p-3 text-left font-medium">Type</th>
                  <th className="p-3 text-left font-medium">Hierarchy</th>
                  <th className="p-3 text-left font-medium">Authority</th>
                  <th className="p-3 text-left font-medium">Currency</th>
                  <th className="p-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      Loading jurisdictions...
                    </td>
                  </tr>
                ) : filteredJurisdictions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No jurisdictions found
                    </td>
                  </tr>
                ) : (
                  filteredJurisdictions.map((jurisdiction: any) => (
                    <tr key={jurisdiction.id} className="border-b hover:bg-muted/20">
                      <td className="p-3 font-medium">{jurisdiction.name}</td>
                      <td className="p-3">
                        {jurisdiction.code ? (
                          <Badge variant="outline">{jurisdiction.code}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-3 text-sm">{jurisdiction.type}</td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {getHierarchy(jurisdiction) || '-'}
                      </td>
                      <td className="p-3 text-sm">
                        {jurisdiction.taxAuthority || '-'}
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary">{jurisdiction.currency || 'USD'}</Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setModalState({ isOpen: true, mode: 'view', jurisdiction })}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setModalState({ isOpen: true, mode: 'edit', jurisdiction })}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('Delete this jurisdiction? This cannot be undone.')) {
                                deleteMutation.mutate(jurisdiction.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Jurisdiction Modal */}
      <JurisdictionModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        jurisdiction={modalState.jurisdiction}
        mode={modalState.mode}
      />
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
