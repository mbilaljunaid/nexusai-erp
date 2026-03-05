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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Eye, Edit, ShieldOff, Upload, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { DatePicker } from '@/components/ui/DatePicker';

interface Exemption {
    id: string;
    certificateNumber: string;
    exemptionType: string;
    entityType: string;
    entityId: string;
    entityName?: string;
    reason: string;
    validFrom: string;
    validTo: string;
    documentUrl?: string;
    isActive: boolean;
}

interface ExemptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    exemption?: Exemption | null;
    mode: 'view' | 'edit' | 'create';
}

export function ExemptionModal({ isOpen, onClose, exemption, mode }: ExemptionModalProps) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        certificateNumber: exemption?.certificateNumber || '',
        exemptionType: exemption?.exemptionType || 'FULL',
        entityType: exemption?.entityType || 'CUSTOMER',
        entityId: exemption?.entityId || '',
        entityName: exemption?.entityName || '',
        reason: exemption?.reason || '',
        validFrom: exemption?.validFrom || new Date().toISOString().split('T')[0],
        validTo: exemption?.validTo || '',
        documentUrl: exemption?.documentUrl || '',
        isActive: exemption?.isActive ?? true
    });

    const saveMutation = useMutation({
        mutationFn: async () => {
            const payload = {
                ...formData,
                id: exemption?.id
            };

            const res = await fetch('/api/tax/exemptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to save exemption');
            }

            return res.json();
        },
        onSuccess: () => {
            toast({
                title: mode === 'create' ? 'Exemption Created' : 'Exemption Updated',
                description: `Successfully ${mode === 'create' ? 'created' : 'updated'} exemption certificate`
            });
            queryClient.invalidateQueries({ queryKey: ['/api/tax/exemptions'] });
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
        if (!formData.certificateNumber || !formData.entityId || !formData.reason) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Certificate number, entity, and reason are required'
            });
            return;
        }

        if (formData.validTo && formData.validFrom > formData.validTo) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Valid To date must be after Valid From date'
            });
            return;
        }

        saveMutation.mutate();
    };

    const isViewMode = mode === 'view';

    // Calculate if exemption is expiring soon or expired
    const getExpiryStatus = () => {
        if (!formData.validTo) return null;
        const today = new Date();
        const expiryDate = new Date(formData.validTo);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry < 0) return { status: 'expired', color: 'destructive', label: 'Expired' };
        if (daysUntilExpiry <= 30) return { status: 'expiring', color: 'warning', label: `Expiring in ${daysUntilExpiry} days` };
        return { status: 'valid', color: 'default', label: 'Valid' };
    };

    const expiryStatus = getExpiryStatus();

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {mode === 'view' && <><Eye className="h-5 w-5" /> View Tax Exemption</>}
                        {mode === 'edit' && <><Edit className="h-5 w-5" /> Edit Tax Exemption</>}
                        {mode === 'create' && <><ShieldOff className="h-5 w-5" /> Create Tax Exemption</>}
                    </DialogTitle>
                    <DialogDescription>
                        {isViewMode ? 'Tax exemption certificate details' : 'Configure tax exemption certificate'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        {/* Certificate Information */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="certificateNumber">Certificate Number *</Label>
                                <Input
                                    id="certificateNumber"
                                    value={formData.certificateNumber}
                                    onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
                                    placeholder="e.g., EX-2024-001"
                                    disabled={isViewMode}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="exemptionType">Exemption Type *</Label>
                                <Select
                                    value={formData.exemptionType}
                                    onValueChange={(value) => setFormData({ ...formData, exemptionType: value })}
                                    disabled={isViewMode}
                                >
                                    <SelectTrigger id="exemptionType">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FULL">Full Exemption</SelectItem>
                                        <SelectItem value="PARTIAL">Partial Exemption</SelectItem>
                                        <SelectItem value="RESALE">Resale Certificate</SelectItem>
                                        <SelectItem value="GOVERNMENT">Government Entity</SelectItem>
                                        <SelectItem value="NON_PROFIT">Non-Profit Organization</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Entity Information */}
                        <div className="border-t pt-4 mt-4">
                            <h3 className="text-sm font-medium mb-3">Applies To</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="entityType">Entity Type *</Label>
                                    <Select
                                        value={formData.entityType}
                                        onValueChange={(value) => setFormData({ ...formData, entityType: value })}
                                        disabled={isViewMode}
                                    >
                                        <SelectTrigger id="entityType">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CUSTOMER">Customer</SelectItem>
                                            <SelectItem value="PRODUCT">Product/Service</SelectItem>
                                            <SelectItem value="JURISDICTION">Jurisdiction</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="entityId">Entity ID *</Label>
                                    <Input
                                        id="entityId"
                                        value={formData.entityId}
                                        onChange={(e) => setFormData({ ...formData, entityId: e.target.value })}
                                        placeholder="Customer/Product ID"
                                        disabled={isViewMode}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 mt-4">
                                <Label htmlFor="entityName">Entity Name (Optional)</Label>
                                <Input
                                    id="entityName"
                                    value={formData.entityName}
                                    onChange={(e) => setFormData({ ...formData, entityName: e.target.value })}
                                    placeholder="Display name for reference"
                                    disabled={isViewMode}
                                />
                            </div>
                        </div>

                        {/* Validity Period */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="validFrom">Valid From *</Label>
                                <DatePicker value={formData.validFrom} onChange={(v) => setFormData({ ...formData, validFrom: v })} disabled={isViewMode} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="validTo">Valid To (Optional)</Label>
                                <DatePicker value={formData.validTo} onChange={(v) => setFormData({ ...formData, validTo: v })} disabled={isViewMode} />
                                {expiryStatus && isViewMode && (
                                    <Badge
                                        variant={expiryStatus.color as any}
                                        className="mt-1"
                                    >
                                        {expiryStatus.label}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Reason */}
                        <div className="space-y-2">
                            <Label htmlFor="reason">Exemption Reason *</Label>
                            <Textarea
                                id="reason"
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                placeholder="Describe why this exemption applies..."
                                rows={3}
                                disabled={isViewMode}
                                required
                            />
                        </div>

                        {/* Document Upload */}
                        <div className="border-t pt-4 mt-4">
                            <h3 className="text-sm font-medium mb-3">Supporting Documentation</h3>
                            {isViewMode ? (
                                <div className="flex items-center gap-2">
                                    {formData.documentUrl ? (
                                        <Button type="button" variant="outline" size="sm" asChild>
                                            <a href={formData.documentUrl} target="_blank" rel="noopener noreferrer">
                                                <FileText className="h-4 w-4 mr-2" />
                                                View Certificate Document
                                            </a>
                                        </Button>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No document uploaded</p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label htmlFor="documentUrl">Document URL (Optional)</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="documentUrl"
                                            value={formData.documentUrl}
                                            onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
                                            placeholder="https://... or file path"
                                        />
                                        <Button type="button" variant="outline" size="sm">
                                            <Upload className="h-4 w-4 mr-2" />
                                            Upload
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Upload scanned exemption certificate (future: file upload will be implemented)
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Active Toggle */}
                        {!isViewMode && mode === 'edit' && (
                            <div className="flex items-center space-x-2 border-t pt-4">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="h-4 w-4"
                                    aria-label="Mark exemption as active"
                                />
                                <Label htmlFor="isActive" className="font-normal cursor-pointer">
                                    Active
                                </Label>
                            </div>
                        )}

                        {/* Status Badge in View Mode */}
                        {isViewMode && (
                            <div className="border-t pt-4">
                                <Label className="mb-2 block">Status</Label>
                                <Badge variant={formData.isActive ? 'default' : 'secondary'}>
                                    {formData.isActive ? 'Active' : 'Inactive'}
                                </Badge>
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
