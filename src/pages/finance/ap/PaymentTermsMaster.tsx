import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Plus, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ApPaymentTerm, InsertApPaymentTerm } from "@shared/schema";

export default function PaymentTermsMaster() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTerm, setEditingTerm] = useState<any | null>(null);

    const [formData, setFormData] = useState<any>({
        termName: "",
        description: "",
        dueDays: 30,
        discountDays: 0,
        discountPercent: "0",
        enabledFlag: true,
    });

    const { data: terms, isLoading } = useQuery<ApPaymentTerm[]>({
        queryKey: ["/api/ap/payment-terms"],
        queryFn: () => fetch("/api/ap/payment-terms").then((r) => r.json()),
    });

    const saveMutation = useMutation({
        mutationFn: (data: any) =>
            fetch(editingTerm ? `/api/ap/payment-terms/${editingTerm.id}` : `/api/ap/payment-terms`, {
                method: editingTerm ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            }).then((r) => {
                if (!r.ok) throw new Error("Failed to save term");
                return r.json();
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ap/payment-terms"] });
            toast({ title: `Payment Term ${editingTerm ? "updated" : "created"} successfully` });
            setModalOpen(false);
        },
        onError: (err: any) => {
            toast({ title: "Error saving term", description: err.message, variant: "destructive" });
        },
    });

    const handleSave = () => {
        saveMutation.mutate(formData);
    };

    const columns: SpreadsheetColumn<ApPaymentTerm>[] = [
        { header: "Term Name", id: "termName", width: "150px", className: "font-medium" },
        { header: "Description", id: "description", width: "150px" },
        { header: "Due Days", id: "dueDays", width: "150px" },
        { header: "Discount Bracket", id: "discountDays", width: "150px", cell: (row) => row.discountDays ? `${row.discountPercent}% if paid in ${row.discountDays} Days` : "No Discount" },
        {
            header: "Status",
            id: "enabledFlag", width: "150px",
            cell: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.enabledFlag ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {row.enabledFlag ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            cell: (row) => (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        setEditingTerm(row);
                        setFormData({
                            termName: row.termName,
                            description: row.description,
                            dueDays: row.dueDays,
                            discountDays: row.discountDays,
                            discountPercent: row.discountPercent,
                            enabledFlag: row.enabledFlag,
                        });
                        setModalOpen(true);
                    }}
                >
                    <Edit2 className="h-4 w-4" />
                </Button>
            ),
        },
    ];

    return (
        <StandardPage
            title="Payment Terms Master"
            description="Define standard payment terms, due days, and early payment discount brackets."
        >
            <div className="flex justify-end mb-4">
                <Button onClick={() => {
                    setEditingTerm(null);
                    setFormData({ termName: "", description: "", dueDays: 30, discountDays: null, discountPercent: null, enabledFlag: true });
                    setModalOpen(true);
                }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Payment Term
                </Button>
            </div>

            <InteractiveSpreadsheet
                data={terms || []}
                columns={columns}
                isLoading={isLoading}
             onChange={() => {}} containerHeight="600px" />

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingTerm ? "Edit Payment Term" : "Create Payment Term"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Term Name</Label>
                            <Input
                                className="col-span-3"
                                value={formData.termName}
                                onChange={(e) => setFormData({ ...formData, termName: e.target.value })}
                                placeholder="e.g. Net 30, 2% 10 Net 30"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Description</Label>
                            <Input
                                className="col-span-3"
                                value={formData.description || ""}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Due Days</Label>
                            <Input
                                type="number"
                                className="col-span-3"
                                value={formData.dueDays}
                                onChange={(e) => setFormData({ ...formData, dueDays: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Discount Days</Label>
                            <Input
                                type="number"
                                className="col-span-3"
                                placeholder="0"
                                value={formData.discountDays || ""}
                                onChange={(e) => setFormData({ ...formData, discountDays: parseInt(e.target.value) || null })}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Discount %</Label>
                            <Input
                                type="number"
                                step="0.01"
                                className="col-span-3"
                                placeholder="0.00"
                                value={formData.discountPercent || ""}
                                onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value || null })}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Active</Label>
                            <div className="col-span-3 flex items-center">
                                <Switch
                                    checked={formData.enabledFlag ?? true}
                                    onCheckedChange={(c) => setFormData({ ...formData, enabledFlag: c })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={!formData.termName || !formData.dueDays}>
                            {saveMutation.isPending ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
