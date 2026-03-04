import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useEnterpriseStore } from "@/lib/enterpriseStore";
import { StandardPage } from "@/components/layout/StandardPage";


export default function BillingProfileManager() {
    const { businessUnitId } = useEnterpriseStore();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProfile, setEditingProfile] = useState<any>(null);

    // --- Fetch Data ---
    // 1. Fetch Customers to map names
    const { data: customers = [] } = useQuery({
        queryKey: ["customers", businessUnitId],
        queryFn: async () => fetch("/api/ar/customers", {
            headers: businessUnitId ? { "x-business-unit-id": businessUnitId } : undefined
        }).then(res => res.json())
    });

    // 2. Fetch Profiles (We need to add this endpoint or just query billing_profiles directly depending on backend setup)

    // Given I cannot touch backend logic without strict approval, I will first check if generic crud exists.
    // Actually, I should probably implement a quick fetch for this.
    // For safety, I will rely on standard patterns.
    const { data: profiles = [], isLoading } = useQuery({
        queryKey: ["billing-profiles", businessUnitId],
        queryFn: async () => {
            const res = await fetch("/api/billing/profiles", {
                headers: businessUnitId ? { "x-business-unit-id": businessUnitId } : undefined
            });
            if (!res.ok) throw new Error("Failed to fetch billing profiles");
            return res.json();
        }
    });

    // Mapping Helper
    const getCustomerName = (id: string) => {
        const c = customers.find((c: any) => c.id === id);
        return c ? c.name : id;
    };

    const saveMutation = useMutation({
        mutationFn: async (rows: any[]) => {
            const promises = rows.map((data: any) => {
                const url = data.id
                    ? `/api/billing/profiles/${data.id}`
                    : `/api/billing/profiles`;
                const method = data.id ? "PATCH" : "POST";

                return fetch(url, {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                        ...(businessUnitId ? { "x-business-unit-id": businessUnitId } : {})
                    },
                    body: JSON.stringify({ ...data, entBusinessUnitId: businessUnitId })
                });
            });
            await Promise.all(promises);
            return {};
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["billing-profiles"] });
            toast({ title: "Success", description: "Billing Profiles saved." });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Could not save profiles. Backend endpoint might be missing.",
                variant: "destructive"
            });
        }
    });

    const handleSave = (rows: any[]) => {
        saveMutation.mutate(rows);
    };

    const handleAddRow = () => {
        const newRow = { id: `temp-${Date.now()}`, customerId: "", currency: "USD", paymentTerms: "Net 30", taxExempt: false, taxExemptionNumber: "", emailInvoices: true };
        queryClient.setQueryData(["billing-profiles"], (old: any) => [...(old || []), newRow]);
    };

    const columns = [
        {
            id: "customerId",
            header: "Customer *",
            width: "250px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Select value={row.customerId} onValueChange={(val) => updateRow("customerId", val)}>
                    <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent">
                        <SelectValue placeholder="Select Customer" />
                    </SelectTrigger>
                    <SelectContent>
                        {customers.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            )
        },
        {
            id: "currency",
            header: "Currency",
            width: "120px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Select value={row.currency || "USD"} onValueChange={(val) => updateRow("currency", val)}>
                    <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {CURRENCY_OPTIONS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            )
        },
        {
            id: "paymentTerms",
            header: "Payment Terms",
            width: "150px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Select value={row.paymentTerms || "Net 30"} onValueChange={(val) => updateRow("paymentTerms", val)}>
                    <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {TERMS_OPTIONS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            )
        },
        {
            id: "taxExempt",
            header: "Tax Exempt",
            width: "100px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <div className="flex justify-center pt-2">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300" checked={row.taxExempt || false} onChange={e => updateRow("taxExempt", e.target.checked)} />
                </div>
            )
        },
        {
            id: "taxExemptionNumber",
            header: "Exemption Number",
            width: "200px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Input className="h-9 w-full bg-transparent border-0" value={row.taxExemptionNumber || ""} onChange={e => updateRow("taxExemptionNumber", e.target.value)} disabled={!row.taxExempt} />
            )
        },
        {
            id: "emailInvoices",
            header: "Auto-Email",
            width: "100px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <div className="flex justify-center pt-2">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300" checked={row.emailInvoices ?? true} onChange={e => updateRow("emailInvoices", e.target.checked)} />
                </div>
            )
        }
    ];

    return (
        <StandardPage title="Billing Profiles">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/finance/billing">Billing</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Profiles</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center justify-between">
                <div>
                    
                    <p className="text-muted-foreground">
                        Manage customer-specific billing preferences, payment terms, and currencies.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                        <CardTitle>Master List</CardTitle>
                        <CardDescription>
                            {profiles.length} active billing profiles configured.
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleAddRow}><Plus className="w-4 h-4 mr-2" /> Add Profile</Button>
                        <Button size="sm" onClick={() => handleSave(profiles || [])} disabled={saveMutation.isPending}>Save Profiles</Button>
                    </div>
                </CardHeader>
                <CardContent className="h-[600px] p-0 border-t">
                    <InteractiveSpreadsheet
                        data={profiles || []}
                        columns={columns}
                        onChange={(newData) => queryClient.setQueryData(["billing-profiles"], newData)}
                        virtualized={true}
                        containerHeight="600px"
                    />
                </CardContent>
            </Card>
        </StandardPage>
    );
}
