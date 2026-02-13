import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useUpdateAffiliate } from '@/hooks/admin/useAdminData';

interface Affiliate {
    id: string;
    name: string;
    email: string;
    companyName?: string;
    website?: string;
    notes?: string;
    status?: string;
    tier?: string;
}

interface EditAffiliateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    affiliate: Affiliate | null;
}

export default function EditAffiliateDialog({ open, onOpenChange, affiliate }: EditAffiliateDialogProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        companyName: '',
        website: '',
        notes: '',
    });

    const updateMutation = useUpdateAffiliate();

    // Pre-populate form when affiliate changes
    useEffect(() => {
        if (affiliate) {
            setFormData({
                name: affiliate.name || '',
                email: affiliate.email || '',
                companyName: affiliate.companyName || '',
                website: affiliate.website || '',
                notes: affiliate.notes || '',
            });
        }
    }, [affiliate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!affiliate) return;

        try {
            await updateMutation.mutateAsync({ id: affiliate.id, ...formData });
            onOpenChange(false);
        } catch (error) {
            // Error handled by mutation
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        setTimeout(() => {
            setFormData({ name: '', email: '', companyName: '', website: '', notes: '' });
        }, 200);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Affiliate Partner</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-email" className="text-right">
                                Email
                            </Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-companyName" className="text-right">
                                Company
                            </Label>
                            <Input
                                id="edit-companyName"
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-website" className="text-right">
                                Website
                            </Label>
                            <Input
                                id="edit-website"
                                type="url"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                className="col-span-3"
                                placeholder="https://"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="edit-notes" className="text-right pt-3">
                                Notes
                            </Label>
                            <Textarea
                                id="edit-notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="col-span-3"
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={updateMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={updateMutation.isPending}>
                            {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
