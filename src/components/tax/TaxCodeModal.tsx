import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Eye, Edit, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from '@/components/ui/DatePicker';

interface TaxCode {
    id: string;
    code: string;
    description?: string;
    rate: number;
    type: string;
    jurisdictionId?: string;
    effectiveFrom?: string;
    effectiveTo?: string;
    isActive: boolean;
}

interface TaxCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    taxCode?: TaxCode | null;
    mode: 'view' | 'edit' | 'create';
}

export function TaxCodeModal({ isOpen, onClose, taxCode, mode }: TaxCodeModalProps) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        code: taxCode?.code || '',
        description: taxCode?.description || '',
        rate: taxCode?.rate?.toString() || '',
        type: taxCode?.type || 'SALES',
        jurisdictionId: taxCode?.jurisdictionId || '',
        effectiveFrom: taxCode?.effectiveFrom || '',
        effectiveTo: taxCode?.effectiveTo || '',
        isActive: taxCode?.isActive ?? true
    });

    const { data: jurisdictions } = useQuery({
        queryKey: ['tax-jurisdictions'],
        queryFn: async () => {
            const res = await fetch('/api/tax/jurisdictions');
            if (!res.ok) throw new Error('Failed to fetch jurisdictions');
            return res.json();
        }
    });

    const saveMutation = useMutation({
        mutationFn: async () => {
            const payload = {
                ...formData,
                rate: parseFloat(formData.rate),
                id: taxCode?.id
            };

            const res = await fetch('/api/tax/codes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to save tax code');
            }

            return res.json();
        },
        onSuccess: () => {
            toast({
                title: mode === 'create' ? 'Tax Code Created' : 'Tax Code Updated',
                description: `Successfully ${mode === 'create' ? 'created' : 'updated'} tax code`
            });
            queryClient.invalidateQueries({ queryKey: ['tax-codes'] });
            onClose();
        },
        onError: (error: Error) => {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message
            });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.code || !formData.rate) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Code and rate are required'
            });
            return;
        }

        const rate = parseFloat(formData.rate);
        if (isNaN(rate) || rate < 0 || rate > 100) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Rate must be between 0 and 100'
            });
            return;
        }

        saveMutation.mutate();
    };

    const isViewMode = mode === 'view';

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {mode === 'view' && <><Eye className="h-5 w-5" /> View Tax Code</>}
                        {mode === 'edit' && <><Edit className="h-5 w-5" /> Edit Tax Code</>}
                        {mode === 'create' && <>Create Tax Code</>}
                    </DialogTitle>
                    <DialogDescription>
                        {isViewMode ? 'Tax code details' : 'Configure tax code settings'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Tax Code *</Label>
                                <Input
                                    id="code"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="e.g., VAT_20"
                                    disabled={isViewMode}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rate">Rate (%) *</Label>
                                <Input
                                    id="rate"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={formData.rate}
                                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                                    placeholder="e.g., 20.00"
                                    disabled={isViewMode}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Tax code description"
                                disabled={isViewMode}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">Type *</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                                    disabled={isViewMode}
                                >
                                    <SelectTrigger id="type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SALES">Sales Tax</SelectItem>
                                        <SelectItem value="PURCHASE">Purchase Tax</SelectItem>
                                        <SelectItem value="BOTH">Both</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="jurisdiction">Jurisdiction</Label>
                                <Select
                                    value={formData.jurisdictionId}
                                    onValueChange={(value) => setFormData({ ...formData, jurisdictionId: value })}
                                    disabled={isViewMode}
                                >
                                    <SelectTrigger id="jurisdiction">
                                        <SelectValue placeholder="Select jurisdiction" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {jurisdictions?.map((j: any) => (
                                            <SelectItem key={j.id} value={j.id}>
                                                {j.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="effectiveFrom">Effective From</Label>
                                <DatePicker value={formData.effectiveFrom} onChange={(v) => setFormData({ ...formData, effectiveFrom: v })} disabled={isViewMode} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="effectiveTo">Effective To</Label>
                                <DatePicker value={formData.effectiveTo} onChange={(v) => setFormData({ ...formData, effectiveTo: v })} disabled={isViewMode} />
                            </div>
                        </div>

                        {!isViewMode && mode === 'edit' && (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked: boolean) => setFormData({ ...formData, isActive: checked })}
                                    className="h-4 w-4"
                                    aria-label="Mark tax code as active"
                                />
                                <Label htmlFor="isActive" className="font-normal cursor-pointer">
                                    Active
                                </Label>
                            </div>
                        )}

                        {isViewMode && (
                            <div className="pt-4 border-t">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Status:</span>
                                    <Badge variant={taxCode?.isActive ? 'default' : 'secondary'}>
                                        {taxCode?.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            {isViewMode ? 'Close' : 'Cancel'}
                        </Button>
                        {!isViewMode && (
                            <Button type="submit" disabled={saveMutation.isPending}>
                                {saveMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save'
                                )}
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
