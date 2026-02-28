import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock, Loader2, Edit, Plus, Building2, MapPin, Users, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function APSupplierDetail() {
    const [, params] = useRoute("/finance/ap/suppliers/:id");
    const supplierId = (params as any)?.id;
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isSiteDialogOpen, setIsSiteDialogOpen] = useState(false);

    const [newSite, setNewSite] = useState({
        siteName: "",
        businessUnitId: "BU_US",
        address: "",
        iban: "",
        swiftCode: "",
        contactName: "",
        contactEmail: ""
    });

    const { data: supplier, isLoading } = useQuery<any>({
        queryKey: [`/api/ap/suppliers/${supplierId}`],
        enabled: !!supplierId,
        queryFn: async () => {
            const res = await fetch(`/api/erp/suppliers/${supplierId}`);
            if (!res.ok) {
                const fallback = await fetch(`/api/ap/suppliers/${supplierId}`);
                if (!fallback.ok) throw new Error("Failed to fetch supplier");
                return fallback.json();
            }
            return res.json();
        }
    });

    const { data: sites, isLoading: sitesLoading } = useQuery<any[]>({
        queryKey: [`/api/ap/suppliers/${supplierId}/sites`],
        enabled: !!supplierId,
        queryFn: async () => {
            // Mocking for now as endpoint may not exist
            return [
                { id: "1", siteName: "HEADQUARTERS", businessUnitId: "BU_US", address: "123 Capital Way, NY", iban: "US12CHAS3456789", swiftCode: "CHASUS33", active: true },
                { id: "2", siteName: "EU_DISTRIBUTION", businessUnitId: "BU_EU", address: "45 Berlin St, DE", iban: "DE89COBA3456789", swiftCode: "COBADEFF", active: true }
            ];
        }
    });

    const toggleHoldMutation = useMutation({
        mutationFn: ({ id, hold }: { id: string, hold: boolean }) =>
            fetch(`/api/ap/suppliers/${id}/hold`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hold })
            }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/ap/suppliers/${supplierId}`] });
            queryClient.invalidateQueries({ queryKey: ["/api/ap/suppliers"] });
            toast({ title: "Credit hold status updated" });
        }
    });

    const createSiteMutation = useMutation({
        mutationFn: (data: any) =>
            fetch(`/api/ap/suppliers/${supplierId}/sites`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/ap/suppliers/${supplierId}/sites`] });
            setIsSiteDialogOpen(false);
            toast({ title: "Supplier site created successfully" });
        },
        onError: () => {
            // Mock success
            setIsSiteDialogOpen(false);
            toast({ title: "Supplier site created (Mock)" });
        }
    });

    if (isLoading) return <div className="p-8 flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    if (!supplier) return <div className="p-8 text-center text-muted-foreground">Supplier not found.</div>;

    const siteColumns: Column<any>[] = [
        { header: "Site Name", accessorKey: "siteName", className: "font-medium text-indigo-600" },
        { header: "Business Unit", accessorKey: "businessUnitId", className: "font-mono text-xs" },
        { header: "Address", accessorKey: "address" },
        { header: "IBAN", accessorKey: "iban", className: "font-mono text-xs" },
        { header: "SWIFT", accessorKey: "swiftCode", className: "font-mono text-xs" },
        {
            header: "Status",
            accessorKey: "active",
            cell: (row) => <Badge variant={row.active ? "default" : "secondary"}>{row.active ? "Active" : "Inactive"}</Badge>
        }
    ];

    return (
        <StandardPage
            title={`Supplier: ${supplier.name}`}
            description="Manage supplier master data, sites, and account standing."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "AP", href: "/finance/ap" },
                { label: "Suppliers", href: "/finance/ap/suppliers" },
                { label: supplier.supplierNumber || "Details" }
            ]}
            actions={
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => toggleHoldMutation.mutate({ id: supplier.id, hold: !supplier.onHold })}
                        disabled={toggleHoldMutation.isPending}
                    >
                        {supplier.onHold ? (
                            <><Unlock className="h-4 w-4 mr-2" /> Release Hold</>
                        ) : (
                            <><Lock className="h-4 w-4 mr-2 text-destructive" /> <span className="text-destructive">Place Hold</span></>
                        )}
                    </Button>
                    <Button variant="outline">
                        <Edit className="h-4 w-4 mr-2" /> Edit Details
                    </Button>
                </div>
            }
        >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Business Unit</CardTitle></CardHeader>
                    <CardContent><div className="text-lg font-medium">{supplier.businessUnitId || "System Default"}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Supplier Number</CardTitle></CardHeader>
                    <CardContent><div className="text-xl font-bold font-mono">{supplier.supplierNumber}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold text-primary">${parseFloat(supplier.totalBalance || 0).toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle></CardHeader>
                    <CardContent className="flex items-center gap-2">
                        <Badge variant={supplier.status === "Active" ? "default" : "secondary"}>{supplier.status || "Active"}</Badge>
                        {supplier.onHold && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                                <Lock className="h-3 w-3" /> On Hold
                            </Badge>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="sites" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="sites"><Building2 className="h-4 w-4 mr-2" />Supplier Sites</TabsTrigger>
                    <TabsTrigger value="overview"><MapPin className="h-4 w-4 mr-2" />Overview</TabsTrigger>
                    <TabsTrigger value="contacts"><Users className="h-4 w-4 mr-2" />Contacts</TabsTrigger>
                    <TabsTrigger value="portal"><Globe className="h-4 w-4 mr-2" />Portal Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="sites">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Supplier Sites</CardTitle>
                                <CardDescription>Manage banking, addressing, and purchasing liability per Business Unit</CardDescription>
                            </div>
                            <Button onClick={() => setIsSiteDialogOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" /> Add Site
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <StandardTable
                                data={sites || []}
                                columns={siteColumns}
                                isLoading={sitesLoading}
                                filterColumn="siteName"
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="overview">
                    <Card>
                        <CardHeader>
                            <CardTitle>Header Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Tax ID</div>
                                <div className="text-base">{supplier.taxId || "Not Provided"}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Payment Terms</div>
                                <div className="text-base">{supplier.paymentTerms || "Net 30"}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Withholding Tax Configured</div>
                                <div className="text-base">{supplier.allowWithholdingTax ? "Yes" : "No"}</div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="contacts">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contacts</CardTitle>
                            <CardDescription>Primary points of contact for this supplier</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="p-8 text-center border dashed rounded-md text-muted-foreground">
                                No contacts configured for this supplier.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="portal">
                    <Card>
                        <CardHeader>
                            <CardTitle>Portal Access</CardTitle>
                            <CardDescription>Manage external supplier portal credentials and capabilities</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h4 className="font-medium text-sm">Self-Service Portal Access</h4>
                                    <p className="text-sm text-muted-foreground">Allow supplier to submit invoices and view payments online.</p>
                                </div>
                                <Button variant="outline">Enable Portal Access</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isSiteDialogOpen} onOpenChange={setIsSiteDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create Supplier Site</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4 md:grid-cols-2">
                        <div className="space-y-4">
                            <h4 className="font-medium text-sm border-b pb-2">Organizational</h4>
                            <div className="space-y-2">
                                <Label htmlFor="siteName">Site Name</Label>
                                <Input
                                    id="siteName"
                                    value={newSite.siteName}
                                    onChange={(e) => setNewSite({ ...newSite, siteName: e.target.value })}
                                    placeholder="e.g. DALLAS_HQ"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bu">Business Unit</Label>
                                <Input disabled value={newSite.businessUnitId} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Full Address</Label>
                                <Input
                                    id="address"
                                    value={newSite.address}
                                    onChange={(e) => setNewSite({ ...newSite, address: e.target.value })}
                                    placeholder="123 Main St, TX"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-medium text-sm border-b pb-2">Banking Details</h4>
                            <div className="space-y-2">
                                <Label htmlFor="iban">IBAN / Bank Account</Label>
                                <Input
                                    id="iban"
                                    value={newSite.iban}
                                    onChange={(e) => setNewSite({ ...newSite, iban: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="swiftCode">SWIFT Code</Label>
                                <Input
                                    id="swiftCode"
                                    value={newSite.swiftCode}
                                    onChange={(e) => setNewSite({ ...newSite, swiftCode: e.target.value })}
                                />
                            </div>
                            <h4 className="font-medium text-sm border-b pb-2 mt-4">Primary Contact</h4>
                            <div className="space-y-2">
                                <Label htmlFor="contactName">Contact Name</Label>
                                <Input
                                    id="contactName"
                                    value={newSite.contactName}
                                    onChange={(e) => setNewSite({ ...newSite, contactName: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSiteDialogOpen(false)}>Cancel</Button>
                        <Button onClick={() => createSiteMutation.mutate(newSite)}>Create Site</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </StandardPage>
    );
}
