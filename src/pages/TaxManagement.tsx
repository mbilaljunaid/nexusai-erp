import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { FileText, Plus, MapPin, ShieldOff, LayoutDashboard, Calculator, Eye, Edit, Trash2, Landmark } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useEnterpriseStore } from "@/lib/enterpriseStore";

import { TaxDashboardTab } from "./tax/TaxDashboardTab";
import { TaxCalculator } from "./tax/TaxCalculator";
import { TaxCodeModal } from "@/components/tax/TaxCodeModal";
import { TaxCalculationPreview } from "@/components/tax/TaxCalculationPreview";
import { JurisdictionModal } from "@/components/tax/JurisdictionModal";
import { ExemptionModal } from "@/components/tax/ExemptionModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function TaxManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const { legalEntityId } = useEnterpriseStore();

  return (
    <StandardPage
      title="TaxManagement"
      description=""
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Tax Management
        </h1>
        <p className="text-muted-foreground mt-2">Monitor tax status and configure jurisdictions, codes, and exemptions.</p>
        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
          <Landmark className="w-4 h-4" />
          {legalEntityId
            ? <span className="font-medium text-foreground">Legal Entity: <span className="font-bold text-primary">{legalEntityId}</span></span>
            : <span className="italic">No Legal Entity selected — showing all entities</span>
          }
        </div>
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
          <TaxCodesTab legalEntityId={legalEntityId} />
        </TabsContent>
        <TabsContent value="jurisdictions" className="py-4">
          <TaxJurisdictionsTab legalEntityId={legalEntityId} />
        </TabsContent>
        <TabsContent value="exemptions" className="py-4">
          <TaxExemptionsTab legalEntityId={legalEntityId} />
        </TabsContent>
      </Tabs>
    </StandardPage>
  );
}

function TaxCodesTab({ legalEntityId }: { legalEntityId: string | null }) {
  const { toast } = useToast();
  const leHeaders: Record<string, string> = legalEntityId ? { 'x-legal-entity-id': legalEntityId } : {};
  const [modalState, setModalState] = useState<{ isOpen: boolean; mode: 'view' | 'edit' | 'create'; taxCode?: any }>({
    isOpen: false,
    mode: 'create',
    taxCode: null
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [deleteTaxCodeId, setDeleteTaxCodeId] = useState<string | null>(null);

  const { data: codes = [], isLoading } = useQuery<any>({
    queryKey: ['/api/tax/codes', legalEntityId ?? 'all'],
    queryFn: async () => {
      const res = await fetch('/api/tax/codes', { headers: leHeaders });
      if (!res.ok) throw new Error('Failed to fetch tax codes');
      return res.json();
    }
  });

  const { data: jurisdictions = [] } = useQuery<any>({
    queryKey: ['/api/tax/jurisdictions', legalEntityId ?? 'all'],
    queryFn: async () => {
      const res = await fetch('/api/tax/jurisdictions', { headers: leHeaders });
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

  const codeColumns: SpreadsheetColumn<any>[] = [
    { id: "code", header: "Code", width: "150px", cell: (row) => <span className="font-medium">{row.code}</span> },
    { id: "description", header: "Description", width: "200px", cell: (row) => <span className="text-sm text-muted-foreground">{row.description || '-'}</span> },
    { id: "rate", header: "Rate", width: "100px", cell: (row) => <Badge variant="outline">{row.rate}%</Badge> },
    { id: "type", header: "Type", width: "100px", cell: (row) => <span className="text-sm">{row.type}</span> },
    { id: "jurisdiction", header: "Jurisdiction", width: "150px", cell: (row) => <span className="text-sm">{row.jurisdictionId ? getJurisdictionName(row.jurisdictionId) : '-'}</span> },
    { id: "status", header: "Status", width: "100px", cell: (row) => <Badge variant={row.isActive ? 'default' : 'secondary'}>{row.isActive ? 'Active' : 'Inactive'}</Badge> },
    {
      id: "actions", header: "Actions", width: "150px", cell: (row) => (
        <div className="flex justify-end gap-2 w-full">
          <Button variant="ghost" size="sm" onClick={() => setModalState({ isOpen: true, mode: 'view', taxCode: row })}><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => setModalState({ isOpen: true, mode: 'edit', taxCode: row })}><Edit className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" disabled={!row.isActive} onClick={() => setDeleteTaxCodeId(row.id)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      )
    }
  ];

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
          <div className="h-[400px]">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground border rounded-lg h-full flex items-center justify-center">Loading tax codes...</div>
            ) : filteredCodes.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground border rounded-lg h-full flex items-center justify-center">No tax codes found</div>
            ) : (
              <InteractiveSpreadsheet
                columns={codeColumns}
                data={filteredCodes}
                onChange={() => { }}
                containerHeight="100%"
              />
            )}
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

      <AlertDialog open={!!deleteTaxCodeId} onOpenChange={(open) => !open && setDeleteTaxCodeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Make Tax Code Inactive</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this tax code as inactive?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTaxCodeId) deleteMutation.mutate(deleteTaxCodeId);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function TaxJurisdictionsTab({ legalEntityId }: { legalEntityId: string | null }) {
  const { toast } = useToast();
  const leHeaders: Record<string, string> = legalEntityId ? { 'x-legal-entity-id': legalEntityId } : {};
  const [modalState, setModalState] = useState<{ isOpen: boolean; mode: 'view' | 'edit' | 'create'; jurisdiction?: any }>({
    isOpen: false,
    mode: 'create',
    jurisdiction: null
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [deleteJurisdictionId, setDeleteJurisdictionId] = useState<string | null>(null);

  const { data: jurisdictions = [], isLoading } = useQuery<any>({
    queryKey: ['/api/tax/jurisdictions', legalEntityId ?? 'all'],
    queryFn: async () => {
      const res = await fetch('/api/tax/jurisdictions', { headers: leHeaders });
      if (!res.ok) throw new Error('Failed to fetch jurisdictions');
      return res.json();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tax/jurisdictions/${id}`, {
        method: 'DELETE',
        headers: leHeaders
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

  const jurisdictionColumns: SpreadsheetColumn<any>[] = [
    { id: "name", header: "Name", width: "150px", cell: (row) => <span className="font-medium">{row.name}</span> },
    { id: "code", header: "Code", width: "100px", cell: (row) => row.code ? <Badge variant="outline">{row.code}</Badge> : <span className="text-muted-foreground">-</span> },
    { id: "type", header: "Type", width: "120px", cell: (row) => <span className="text-sm">{row.type}</span> },
    { id: "hierarchy", header: "Hierarchy", width: "200px", cell: (row) => <span className="text-sm text-muted-foreground">{getHierarchy(row) || '-'}</span> },
    { id: "authority", header: "Authority", width: "150px", cell: (row) => <span className="text-sm">{row.taxAuthority || '-'}</span> },
    { id: "currency", header: "Currency", width: "100px", cell: (row) => <Badge variant="secondary">{row.currency || 'USD'}</Badge> },
    {
      id: "actions", header: "Actions", width: "150px", cell: (row) => (
        <div className="flex justify-end gap-2 w-full">
          <Button variant="ghost" size="sm" onClick={() => setModalState({ isOpen: true, mode: 'view', jurisdiction: row })}><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => setModalState({ isOpen: true, mode: 'edit', jurisdiction: row })}><Edit className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteJurisdictionId(row.id)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      )
    }
  ];

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
          <div className="h-[400px]">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground border rounded-lg h-full flex items-center justify-center">Loading jurisdictions...</div>
            ) : filteredJurisdictions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground border rounded-lg h-full flex items-center justify-center">No jurisdictions found</div>
            ) : (
              <InteractiveSpreadsheet
                columns={jurisdictionColumns}
                data={filteredJurisdictions}
                onChange={() => { }}
                containerHeight="100%"
              />
            )}
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

      <AlertDialog open={!!deleteJurisdictionId} onOpenChange={(open) => !open && setDeleteJurisdictionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Jurisdiction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this jurisdiction? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteJurisdictionId) deleteMutation.mutate(deleteJurisdictionId);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function TaxExemptionsTab({ legalEntityId }: { legalEntityId: string | null }) {
  const { toast } = useToast();
  const leHeaders: Record<string, string> = legalEntityId ? { 'x-legal-entity-id': legalEntityId } : {};
  const [newItem, setNewItem] = useState({ customerId: "", siteId: "", taxCodeId: "", exemptionType: "Full", exemptionValue: "0" });

  const { data: exemptions = [], isLoading } = useQuery<any>({
    queryKey: ["/api/tax/exemptions", legalEntityId ?? 'all'],
    queryFn: async () => {
      const res = await fetch('/api/tax/exemptions', { headers: leHeaders });
      if (!res.ok) throw new Error('Failed to fetch exemptions');
      return res.json();
    }
  });

  const { data: codes = [] } = useQuery<any>({
    queryKey: ["/api/tax/codes", legalEntityId ?? 'all'],
    queryFn: async () => {
      const res = await fetch('/api/tax/codes', { headers: leHeaders });
      if (!res.ok) throw new Error('Failed to fetch tax codes');
      return res.json();
    }
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
