import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useUpdateDemoEnvironment } from '@/hooks/admin/useAdminData';

interface DemoEnvironment {
    id: string;
    companyName: string;
    industry: string;
    email: string;
    firstName: string;
    lastName: string;
    status?: string;
    accessUrl?: string;
}

interface EditDemoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    demo: DemoEnvironment | null;
}

export default function EditDemoDialog({ open, onOpenChange, demo }: EditDemoDialogProps) {
    const [formData, setFormData] = useState({
        companyName: '',
        industry: '',
        email: '',
        firstName: '',
        lastName: '',
    });

    const updateMutation = useUpdateDemoEnvironment();

    // Pre-populate form when demo changes
    useEffect(() => {
        if (demo) {
            setFormData({
                companyName: demo.companyName || '',
                industry: demo.industry || '',
                email: demo.email || '',
                firstName: demo.firstName || '',
                lastName: demo.lastName || '',
            });
        }
    }, [demo]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!demo) return;

        try {
            await updateMutation.mutateAsync({ id: demo.id, ...formData });
            onOpenChange(false);
        } catch (error) {
            // Error handled by mutation
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        // Reset form after animation completes
        setTimeout(() => {
            setFormData({ companyName: '', industry: '', email: '', firstName: '', lastName: '' });
        }, 200);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Demo Environment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-companyName" className="text-right">
                                Company
                            </Label>
                            <Input
                                id="edit-companyName"
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-industry" className="text-right">
                                Industry
                            </Label>
                            <Select
                                value={formData.industry}
                                onValueChange={(value) => setFormData({ ...formData, industry: value })}
                            >
                                <SelectTrigger className="col-span-3" id="edit-industry">
                                    <SelectValue placeholder="Select industry" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="technology">Technology</SelectItem>
                                    <SelectItem value="retail">Retail</SelectItem>
                                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                                    <SelectItem value="healthcare">Healthcare</SelectItem>
                                    <SelectItem value="finance">Finance</SelectItem>
                                </SelectContent>
                            </Select>
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
                            <Label htmlFor="edit-firstName" className="text-right">
                                First Name
                            </Label>
                            <Input
                                id="edit-firstName"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-lastName" className="text-right">
                                Last Name
                            </Label>
                            <Input
                                id="edit-lastName"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="col-span-3"
                                required
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
