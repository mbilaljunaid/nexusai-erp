import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { Badge } from "@/components/ui/badge";
import { Plus, Lock, Unlock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function APSuppliers() {
    const [page, setPage] = useState(1);
    const pageSize = 20;
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [, setLocation] = useLocation();

    const { data: suppliers, isLoading } = useQuery({
        queryKey: ["/api/ap/suppliers"],
        queryFn: () => fetch("/api/ap/suppliers").then(r => r.json())
    });

    const createMutation = useMutation({
        mutationFn: (data: any) =>
            fetch("/api/ap/suppliers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ap/suppliers"] });
            setCreateDialogOpen(false);
            toast({ title: "Supplier created successfully" });
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
            queryClient.invalidateQueries({ queryKey: ["/api/ap/suppliers"] });
            toast({ title: "Credit hold status updated" });
        }
    });

    const columns: Column<any>[] = [
        { header: "Supplier #", accessorKey: "supplierNumber", className: "font-mono" },
        { header: "Name", accessorKey: "name", className: "font-medium" },
        { header: "Tax ID", accessorKey: "taxId" },
        {
            header: "Payment Terms",
            accessorKey: "paymentTerms",
            cell: (row) => row.paymentTerms || "Net 30"
        },
        {
            header: "Outstanding Balance",
            accessorKey: "totalBalance",
            cell: (row) => <span className="font-semibold text-primary">${parseFloat(row.totalBalance || 0).toLocaleString()}</span>
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (row) => (
                <div className="flex gap-2">
                    <Badge variant={row.status === "Active" ? "default" : "secondary"}>
                        {row.status}
                    </Badge>
                    {row.onHold && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            On Hold
                        </Badge>
                    )}
                </div>
            )
        },
        {
            id: "actions",
            header: "Actions",
            cell: (row) => (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleHoldMutation.mutate({ id: row.id, hold: !row.onHold });
                    }}
                >
                    {row.onHold ? (
                        <><Unlock className="h-4 w-4 mr-1" /> Release Hold</>
                    ) : (
                        <><Lock className="h-4 w-4 mr-1" /> Place Hold</>
                    )}
                </Button>
            )
        }
    ];

    const { data: whtGroups } = useQuery({
        queryKey: ["/api/ap/wht-groups"],
        queryFn: () => fetch("/api/ap/wht-groups").then(r => r.json())
    });

    const [formData, setFormData] = useState({
        supplierNumber: "",
        name: "",
        taxId: "",
        paymentTerms: "Net 30",
        status: "Active",
        allowWithholdingTax: false,
        withholdingTaxGroupId: "",
        // Site fields
        siteName: "HEADQUARTERS",
        address: "",
        iban: "",
        swiftCode: ""
    });

    return (
        <StandardPage
            title="Suppliers"
            description="Manage supplier master data and credit holds"
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "AP", href: "/finance/ap" },
                { label: "Suppliers" }
            ]}
            actions={
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create Supplier
                </Button>
            }
        >
            <StandardTable
                data={suppliers || []}
                columns={columns}
                totalItems={suppliers?.length || 0}
                page={page}
                onPageChange={setPage}
                pageSize={pageSize}
                isLoading={isLoading}
                filterColumn="name"
                filterPlaceholder="Search suppliers..."
                onRowClick={(item) => setLocation(`/finance/ap/suppliers/${item.id}`)}
            />

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Supplier</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="supplierNumber">Supplier Number</Label>
                            <Input
                                id="supplierNumber"
                                value={formData.supplierNumber}
                                onChange={(e) => setFormData({ ...formData, supplierNumber: e.target.value })}
                                placeholder="SUP-001"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Supplier Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Acme Corp"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="taxId">Tax ID</Label>
                            <Input
                                id="taxId"
                                value={formData.taxId}
                                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                placeholder="12-3456789"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="paymentTerms">Payment Terms</Label>
                            <Select value={formData.paymentTerms} onValueChange={(v) => setFormData({ ...formData, paymentTerms: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Net 30">Net 30</SelectItem>
                                    <SelectItem value="Net 60">Net 60</SelectItem>
                                    <SelectItem value="Net 90">Net 90</SelectItem>
                                    <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <Label>Enable Withholding Tax</Label>
                                <p className="text-[0.8rem] text-muted-foreground">Calculate WHT automatically for this supplier.</p>
                            </div>
                            <Switch
                                checked={formData.allowWithholdingTax}
                                onCheckedChange={(checked) => setFormData({ ...formData, allowWithholdingTax: checked })}
                            />
                        </div>
                        {formData.allowWithholdingTax && (
                            <div className="space-y-2">
                                <Label htmlFor="withholdingTaxGroupId">Withholding Tax Group</Label>
                                <Select
                                    value={formData.withholdingTaxGroupId || ""}
                                    onValueChange={(v) => setFormData({ ...formData, withholdingTaxGroupId: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select WHT Group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {whtGroups?.map((group: any) => (
                                            <SelectItem key={group.id} value={group.id}>{group.groupName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="pt-2 border-t">
                            <p className="text-sm font-semibold text-muted-foreground mb-3">Payment Site (Banking Details)</p>
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="siteName">Site Name</Label>
                                    <Input
                                        id="siteName"
                                        value={formData.siteName}
                                        onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                                        placeholder="HEADQUARTERS"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Site Address</Label>
                                    <Input
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="123 Business St, City, State"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="iban">IBAN</Label>
                                    <Input
                                        id="iban"
                                        value={formData.iban}
                                        onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                                        placeholder="GB29NWBK60161331926819"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="swiftCode">SWIFT / BIC Code</Label>
                                    <Input
                                        id="swiftCode"
                                        value={formData.swiftCode}
                                        onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
                                        placeholder="NWBKGB2L"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => createMutation.mutate(formData)}>
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
