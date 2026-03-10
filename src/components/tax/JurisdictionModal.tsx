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
import { Loader2, Eye, Edit, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Jurisdiction {
    id: string;
    name: string;
    code?: string;
    type: string;
    parentId?: string;
    taxAuthority?: string;
    registrationNumber?: string;
    filingFrequency?: string;
    currency?: string;
}

interface JurisdictionModalProps {
    isOpen: boolean;
    onClose: () => void;
    jurisdiction?: Jurisdiction | null;
    mode: 'view' | 'edit' | 'create';
}

export function JurisdictionModal({ isOpen, onClose, jurisdiction, mode }: JurisdictionModalProps) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        name: jurisdiction?.name || '',
        code: jurisdiction?.code || '',
        type: jurisdiction?.type || 'Country',
        parentId: jurisdiction?.parentId || '',
        taxAuthority: jurisdiction?.taxAuthority || '',
        registrationNumber: jurisdiction?.registrationNumber || '',
        filingFrequency: jurisdiction?.filingFrequency || 'QUARTERLY',
        currency: jurisdiction?.currency || 'USD'
    });

    // Fetch all jurisdictions for parent selection
    const { data: jurisdictions } = useQuery({
        queryKey: ['tax-jurisdictions'],
        queryFn: async () => {
            const res = await fetch('/api/tax/jurisdictions');
            if (!res.ok) throw new Error('Failed to fetch jurisdictions');
            return res.json();
        }
    });

    // Filter potential parents based on type hierarchy
    const getPotentialParents = () => {
        if (!jurisdictions) return [];

        // Type hierarchy: Country > State > County > City
        const typeHierarchy: Record<string, string[]> = {
            'State': ['Country'],
            'County': ['State', 'Country'],
            'City': ['County', 'State', 'Country']
        };

        const allowedParentTypes = typeHierarchy[formData.type] || [];

        return jurisdictions.filter((j: Jurisdiction) =>
            allowedParentTypes.includes(j.type) &&
            j.id !== jurisdiction?.id // Can't be parent of itself
        );
    };

    const saveMutation = useMutation({
        mutationFn: async () => {
            const payload = {
                ...formData,
                id: jurisdiction?.id,
                parentId: formData.parentId || undefined // Convert empty string to undefined
            };

            const res = await fetch('/api/tax/jurisdictions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to save jurisdiction');
            }

            return res.json();
        },
        onSuccess: () => {
            toast({
                title: mode === 'create' ? 'Jurisdiction Created' : 'Jurisdiction Updated',
                description: `Successfully ${mode === 'create' ? 'created' : 'updated'} jurisdiction`
            });
            queryClient.invalidateQueries({ queryKey: ['tax-jurisdictions'] });
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
        if (!formData.name || !formData.type) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Name and type are required'
            });
            return;
        }

        saveMutation.mutate();
    };

    const isViewMode = mode === 'view';

    // Get parent jurisdiction name for display
    const getParentName = (parentId?: string) => {
        if (!parentId || !jurisdictions) return 'None';
        const parent = jurisdictions.find((j: Jurisdiction) => j.id === parentId);
        return parent ? parent.name : 'Unknown';
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {mode === 'view' && <><Eye className="h-5 w-5" /> View Jurisdiction</>}
                        {mode === 'edit' && <><Edit className="h-5 w-5" /> Edit Jurisdiction</>}
                        {mode === 'create' && <><MapPin className="h-5 w-5" /> Create Jurisdiction</>}
                    </DialogTitle>
                    <DialogDescription>
                        {isViewMode ? 'Jurisdiction details and hierarchy' : 'Configure jurisdiction settings and hierarchy'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        {/* Basic Information */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Jurisdiction Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., California, New York"
                                    disabled={isViewMode}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="code">Code</Label>
                                <Input
                                    id="code"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="e.g., CA, NY"
                                    disabled={isViewMode}
                                />
                            </div>
                        </div>

                        {/* Type and Hierarchy */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">Type *</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => setFormData({ ...formData, type: value, parentId: '' })}
                                    disabled={isViewMode}
                                >
                                    <SelectTrigger id="type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Country">Country</SelectItem>
                                        <SelectItem value="State">State/Province</SelectItem>
                                        <SelectItem value="County">County</SelectItem>
                                        <SelectItem value="City">City</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="parent">Parent Jurisdiction</Label>
                                {isViewMode ? (
                                    <Input
                                        value={getParentName(jurisdiction?.parentId)}
                                        disabled
                                    />
                                ) : (
                                    <Select
                                        value={formData.parentId}
                                        onValueChange={(value) => setFormData({ ...formData, parentId: value })}
                                    >
                                        <SelectTrigger id="parent">
                                            <SelectValue placeholder="None (top-level)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">None (top-level)</SelectItem>
                                            {getPotentialParents().map((j: Jurisdiction) => (
                                                <SelectItem key={j.id} value={j.id}>
                                                    {j.name} ({j.type})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        </div>

                        {/* Tax Authority Information */}
                        <div className="border-t pt-4 mt-4">
                            <h3 className="text-sm font-medium mb-3">Tax Authority Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="taxAuthority">Authority Name</Label>
                                    <Input
                                        id="taxAuthority"
                                        value={formData.taxAuthority}
                                        onChange={(e) => setFormData({ ...formData, taxAuthority: e.target.value })}
                                        placeholder="e.g., California Department of Tax"
                                        disabled={isViewMode}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="registrationNumber">Registration Number</Label>
                                    <Input
                                        id="registrationNumber"
                                        value={formData.registrationNumber}
                                        onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                                        placeholder="Tax ID or registration #"
                                        disabled={isViewMode}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Configuration */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="filingFrequency">Filing Frequency</Label>
                                <Select
                                    value={formData.filingFrequency}
                                    onValueChange={(value) => setFormData({ ...formData, filingFrequency: value })}
                                    disabled={isViewMode}
                                >
                                    <SelectTrigger id="filingFrequency">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                                        <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                                        <SelectItem value="SEMI_ANNUAL">Semi-Annual</SelectItem>
                                        <SelectItem value="ANNUAL">Annual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="currency">Currency</Label>
                                <Select
                                    value={formData.currency}
                                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                                    disabled={isViewMode}
                                >
                                    <SelectTrigger id="currency">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                                        <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Hierarchy Preview */}
                        {(formData.parentId || jurisdiction?.parentId) && isViewMode && (
                            <div className="border-t pt-4 mt-4">
                                <Label className="mb-2 block">Hierarchy</Label>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Badge variant="outline">{getParentName(jurisdiction?.parentId)}</Badge>
                                    <span>→</span>
                                    <Badge>{jurisdiction?.name}</Badge>
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
