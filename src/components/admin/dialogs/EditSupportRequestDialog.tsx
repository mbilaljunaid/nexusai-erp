import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useUpdateSupportRequest } from '@/hooks/admin/useAdminData';

interface SupportRequest {
    id: string;
    subject: string;
    type: 'feature' | 'bug' | 'support';
    priority: 'low' | 'medium' | 'high';
    description: string;
    email: string;
    status?: string;
}

interface EditSupportRequestDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    request: SupportRequest | null;
}

export default function EditSupportRequestDialog({ open, onOpenChange, request }: EditSupportRequestDialogProps) {
    const [formData, setFormData] = useState({
        subject: '',
        type: 'support' as 'feature' | 'bug' | 'support',
        priority: 'medium' as 'low' | 'medium' | 'high',
        description: '',
        email: '',
    });

    const updateMutation = useUpdateSupportRequest();

    // Pre-populate form when request changes
    useEffect(() => {
        if (request) {
            setFormData({
                subject: request.subject || '',
                type: request.type || 'support',
                priority: request.priority || 'medium',
                description: request.description || '',
                email: request.email || '',
            });
        }
    }, [request]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!request) return;

        try {
            await updateMutation.mutateAsync({ id: request.id, ...formData });
            onOpenChange(false);
        } catch (error) {
            // Error handled by mutation
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        setTimeout(() => {
            setFormData({ subject: '', type: 'support', priority: 'medium', description: '', email: '' });
        }, 200);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Edit Support Request</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
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
                            <Label htmlFor="edit-subject" className="text-right">
                                Subject
                            </Label>
                            <Input
                                id="edit-subject"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-type" className="text-right">
                                Type
                            </Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                            >
                                <SelectTrigger className="col-span-3" id="edit-type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="feature">Feature Request</SelectItem>
                                    <SelectItem value="bug">Bug Report</SelectItem>
                                    <SelectItem value="support">Support</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-priority" className="text-right">
                                Priority
                            </Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                            >
                                <SelectTrigger className="col-span-3" id="edit-priority">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="edit-description" className="text-right pt-3">
                                Description
                            </Label>
                            <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="col-span-3"
                                rows={5}
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
