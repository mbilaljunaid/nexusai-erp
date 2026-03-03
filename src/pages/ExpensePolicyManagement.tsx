import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Plus,
    Trash2,
    Edit,
    Loader2,
    Shield,
    DollarSign,
    Receipt,
    Calendar,
    CheckCircle,
    XCircle
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StandardTable, Column } from "@/components/tables/StandardTable";
import { MetricCard } from "@/components/MetricCard";

const EXPENSE_CATEGORIES = [
    { value: "TRAVEL", label: "Travel" },
    { value: "MEALS", label: "Meals & Entertainment" },
    { value: "ACCOMMODATION", label: "Accommodation" },
    { value: "TRANSPORTATION", label: "Transportation" },
    { value: "OFFICE_SUPPLIES", label: "Office Supplies" },
    { value: "EQUIPMENT", label: "Equipment" },
    { value: "COMMUNICATION", label: "Communication" },
    { value: "UTILITIES", label: "Utilities" },
    { value: "PROFESSIONAL_SERVICES", label: "Professional Services" },
    { value: "MARKETING", label: "Marketing" },
    { value: "OTHER", label: "Other" }
];

export default function ExpensePolicyManagement() {
    const { toast } = useToast();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<any>(null);

    // Fetch all policies
    const { data: policies = [], isLoading: policiesLoading } = useQuery<any[]>({
        queryKey: ["/api/expense-policies"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/expense-policies");
            return res.json();
        }
    });

    // Fetch categories
    const { data: categories = [] } = useQuery<any[]>({
        queryKey: ["/api/expense-policies/categories"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/expense-policies/categories");
            return res.json();
        }
    });

    // Create policy mutation
    const createPolicyMutation = useMutation({
        mutationFn: async (policyData: any) => {
            const res = await apiRequest("POST", "/api/expense-policies", policyData);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/expense-policies"] });
            toast({
                title: "Policy Created",
                description: "Expense policy has been created successfully.",
            });
            setIsCreateOpen(false);
        },
        onError: (error: any) => {
            toast({
                title: "Creation Failed",
                description: error.message || "Failed to create policy",
                variant: "destructive",
            });
        }
    });

    // Update policy mutation
    const updatePolicyMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const res = await apiRequest("PATCH", `/api/expense-policies/${id}`, data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/expense-policies"] });
            toast({
                title: "Policy Updated",
                description: "Expense policy has been updated successfully.",
            });
            setEditingPolicy(null);
        },
        onError: (error: any) => {
            toast({
                title: "Update Failed",
                description: error.message || "Failed to update policy",
                variant: "destructive",
            });
        }
    });

    // Delete policy mutation
    const deletePolicyMutation = useMutation({
        mutationFn: async (policyId: string) => {
            const res = await apiRequest("DELETE", `/api/expense-policies/${policyId}`, {});
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/expense-policies"] });
            toast({
                title: "Policy Deleted",
                description: "Expense policy has been deactivated.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Deletion Failed",
                description: error.message || "Failed to delete policy",
                variant: "destructive",
            });
        }
    });

    const handleSubmitPolicy = () => {
        const category = (document.getElementById('policyCategory') as HTMLSelectElement)?.value;
        const maxAmount = (document.getElementById('policyMaxAmount') as HTMLInputElement)?.value;
        const requiresReceipt = (document.getElementById('policyRequiresReceipt') as HTMLInputElement)?.checked;
        const receiptThreshold = (document.getElementById('policyReceiptThreshold') as HTMLInputElement)?.value;
        const description = (document.getElementById('policyDescription') as HTMLTextAreaElement)?.value;
        const effectiveFrom = (document.getElementById('policyEffectiveFrom') as HTMLInputElement)?.value;
        const effectiveTo = (document.getElementById('policyEffectiveTo') as HTMLInputElement)?.value;

        const policyData = {
            category,
            maxAmount: maxAmount ? parseFloat(maxAmount) : null,
            requiresReceipt,
            receiptThreshold: receiptThreshold ? parseFloat(receiptThreshold) : null,
            description,
            effectiveFrom: effectiveFrom || undefined,
            effectiveTo: effectiveTo || undefined,
        };

        if (editingPolicy) {
            updatePolicyMutation.mutate({ id: editingPolicy.id, data: policyData });
        } else {
            createPolicyMutation.mutate(policyData);
        }
    };

    const policyColumns: Column<any>[] = [
        {
            header: "Category",
            accessorKey: "category",
            cell: (policy) => (
                <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline">{policy.category}</Badge>
                </div>
            )
        },
        {
            header: "Max Amount",
            accessorKey: "maxAmount",
            cell: (policy) => policy.maxAmount ?
                <span className="font-mono font-bold">${policy.maxAmount}</span> :
                <span className="text-muted-foreground">No limit</span>
        },
        {
            header: "Receipt Required",
            accessorKey: "requiresReceipt",
            cell: (policy) => (
                <div className="flex items-center gap-2">
                    {policy.requiresReceipt ? (
                        <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">
                                {policy.receiptThreshold ? `Above $${policy.receiptThreshold}` : 'Always'}
                            </span>
                        </>
                    ) : (
                        <>
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Optional</span>
                        </>
                    )}
                </div>
            )
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (policy) => (
                <Badge variant={policy.status === 'ACTIVE' ? 'default' : 'outline'}>
                    {policy.status}
                </Badge>
            )
        },
        {
            header: "Effective From",
            accessorKey: "effectiveFrom",
            cell: (policy) => policy.effectiveFrom ?
                new Date(policy.effectiveFrom).toLocaleDateString() :
                <span className="text-muted-foreground">Immediate</span>
        },
        {
            header: "Effective To",
            accessorKey: "effectiveTo",
            cell: (policy) => policy.effectiveTo ?
                new Date(policy.effectiveTo).toLocaleDateString() :
                <span className="text-muted-foreground">No expiry</span>
        }
    ];

    const activeCount = policies.filter(p => p.status === 'ACTIVE').length;
    const categoriesWithPolicies = new Set(policies.map(p => p.category)).size;

    return (
        <StandardPage
      title="Expense Policy Management"
      description="Configure expense approval rules and spending limits"
      className="ext-lg">
                        Configure expense approval rules and spending limits
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => {
                        setEditingPolicy(null);
                        setIsCreateOpen(true);
                    }}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Policy
                    </Button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Policies"
                    value={policies.length.toString()}
                    icon={Shield}
                    loading={policiesLoading}
                />
                <MetricCard
                    title="Active Policies"
                    value={activeCount.toString()}
                    icon={CheckCircle}
                    iconColor="text-green-500"
                    loading={policiesLoading}
                />
                <MetricCard
                    title="Categories Covered"
                    value={`${categoriesWithPolicies}/${categories.length}`}
                    icon={Receipt}
                    loading={policiesLoading}
                />
                <MetricCard
                    title="Available Categories"
                    value={categories.length.toString()}
                    icon={DollarSign}
                    loading={!categories.length}
                />
            </div>

            {/* Policy Configuration Guide */}
            <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Policy Configuration Guide
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                    <p>• <strong>Max Amount</strong>: Maximum allowed expense per transaction (leave blank for no limit)</p>
                    <p>• <strong>Receipt Required</strong>: Whether receipts must be attached</p>
                    <p>• <strong>Receipt Threshold</strong>: Minimum amount requiring receipt (if applicable)</p>
                    <p>• <strong>Effective Dates</strong>: Policy active period (leave blank for immediate/permanent)</p>
                    <p className="text-muted-foreground italic">Policies are evaluated during expense submission and can prevent non-compliant expenses from being approved.</p>
                </CardContent>
            </Card>

            {/* Policies Table */}
            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0">
                    <StandardTable
                        data={policies}
                        columns={policyColumns}
                        isLoading={policiesLoading}
                        actions={(policy) => (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setEditingPolicy(policy);
                                        setIsCreateOpen(true);
                                    }}
                                >
                                    <Edit className="h-3 w-3" />
                                </Button>
                                {policy.status === 'ACTIVE' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deletePolicyMutation.mutate(policy.id)}
                                        disabled={deletePolicyMutation.isPending}
                                    >
                                        <Trash2 className="h-3 w-3 text-red-500" />
                                    </Button>
                                )}
                            </div>
                        )}
                        pagination={{ currentPage: 1, totalPages: 1, onPageChange: () => { } }}
                    />
                </CardContent>
            </Card>

            {/* Create/Edit Policy Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={(open) => {
                setIsCreateOpen(open);
                if (!open) setEditingPolicy(null);
            }}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingPolicy ? 'Edit Policy' : 'Create New Policy'}</DialogTitle>
                        <DialogDescription>
                            Configure expense approval rules and spending limits for a category
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Category *</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-md"
                                    id="policyCategory"
                                    defaultValue={editingPolicy?.category}
                                >
                                    <option value="">Select category</option>
                                    {EXPENSE_CATEGORIES.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Max Amount Per Transaction</label>
                                <Input
                                    type="number"
                                    id="policyMaxAmount"
                                    placeholder="e.g., 500.00 (leave blank for no limit)"
                                    step="0.01"
                                    defaultValue={editingPolicy?.maxAmount}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="policyRequiresReceipt"
                                    defaultChecked={editingPolicy?.requiresReceipt}
                                    className="h-4 w-4"
                                />
                                <label htmlFor="policyRequiresReceipt" className="text-sm font-medium">
                                    Require Receipt
                                </label>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Receipt Threshold</label>
                                <Input
                                    type="number"
                                    id="policyReceiptThreshold"
                                    placeholder="e.g., 25.00 (min amount requiring receipt)"
                                    step="0.01"
                                    defaultValue={editingPolicy?.receiptThreshold}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
                            <Textarea
                                id="policyDescription"
                                placeholder="Additional policy details, special conditions, or notes..."
                                rows={3}
                                defaultValue={editingPolicy?.description}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                                    <Calendar className="h-3 w-3" />
                                    Effective From
                                </label>
                                <Input
                                    type="date"
                                    id="policyEffectiveFrom"
                                    defaultValue={editingPolicy?.effectiveFrom?.split('T')[0]}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                                    <Calendar className="h-3 w-3" />
                                    Effective To
                                </label>
                                <Input
                                    type="date"
                                    id="policyEffectiveTo"
                                    defaultValue={editingPolicy?.effectiveTo?.split('T')[0]}
                                />
                            </div>
                        </div>

                        <div className="bg-muted/30 p-3 rounded text-xs space-y-1">
                            <p><strong>Policy Preview:</strong></p>
                            <p className="text-muted-foreground">
                                This policy will apply to all <strong>{(document.getElementById('policyCategory') as HTMLSelectElement)?.selectedOptions[0]?.text || 'selected category'}</strong> expenses
                                {(document.getElementById('policyMaxAmount') as HTMLInputElement)?.value &&
                                    ` with a maximum of $${(document.getElementById('policyMaxAmount') as HTMLInputElement)?.value} per transaction`}
                                {(document.getElementById('policyRequiresReceipt') as HTMLInputElement)?.checked &&
                                    '. Receipt is required'}
                                {(document.getElementById('policyReceiptThreshold') as HTMLInputElement)?.value &&
                                    ` for amounts over $${(document.getElementById('policyReceiptThreshold') as HTMLInputElement)?.value}`}.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setIsCreateOpen(false);
                            setEditingPolicy(null);
                        }}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmitPolicy}
                            disabled={createPolicyMutation.isPending || updatePolicyMutation.isPending}
                        >
                            {(createPolicyMutation.isPending || updatePolicyMutation.isPending) ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {editingPolicy ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                editingPolicy ? 'Update Policy' : 'Create Policy'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
  );
}
