import { cn } from "@/lib/utils";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Loader2, Calendar, Video, Phone, Users, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from '@/components/ui/DatePicker';

interface InterviewSchedulerProps {
    isOpen: boolean;
    onClose: () => void;
    applicationId: string;
    candidateName?: string;
    jobTitle?: string;
}

interface Interviewer {
    id: string;
    name: string;
    email: string;
}

export function InterviewScheduler({
    isOpen,
    onClose,
    applicationId,
    candidateName = "Candidate",
    jobTitle = "Position"
}: InterviewSchedulerProps) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        interviewType: 'VIDEO',
        scheduledDate: '',
        scheduledTime: '',
        duration: 60,
        location: '',
        meetingLink: '',
        notes: '',
        interviewerIds: [] as string[]
    });

    // Fetch available interviewers (mock for now, could be from /api/users)
    const { data: availableInterviewers = [] } = useQuery<Interviewer[]>({
        queryKey: ['/api/users/interviewers'],
        queryFn: async () => {
            // Mock data - in production, fetch from API
            return [
                { id: 'int-1', name: 'John Smith', email: 'john@company.com' },
                { id: 'int-2', name: 'Sarah Johnson', email: 'sarah@company.com' },
                { id: 'int-3', name: 'Michael Chen', email: 'michael@company.com' },
                { id: 'int-4', name: 'Emily Davis', email: 'emily@company.com' }
            ];
        },
        enabled: isOpen
    });

    const scheduleMutation = useMutation({
        mutationFn: async () => {
            if (!formData.scheduledDate || !formData.scheduledTime) {
                throw new Error('Date and time are required');
            }

            // Combine date and time into ISO string
            const scheduledAt = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString();

            const payload = {
                applicationId,
                interviewType: formData.interviewType,
                interviewers: formData.interviewerIds,
                scheduledAt,
                duration: formData.duration,
                location: formData.location || undefined,
                meetingLink: formData.meetingLink || undefined,
                notes: formData.notes || undefined
            };

            const res = await fetch('/api/recruitment/interviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to schedule interview');
            }

            return res.json();
        },
        onSuccess: () => {
            toast({
                title: 'Interview Scheduled',
                description: `Interview scheduled for ${candidateName}`
            });
            queryClient.invalidateQueries({ queryKey: ['/api/recruitment/my-interviews'] });
            queryClient.invalidateQueries({ queryKey: [`/api/recruitment/applications/${applicationId}/interviews`] });
            onClose();
            // Reset form
            setFormData({
                interviewType: 'VIDEO',
                scheduledDate: '',
                scheduledTime: '',
                duration: 60,
                location: '',
                meetingLink: '',
                notes: '',
                interviewerIds: []
            });
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
        if (formData.interviewerIds.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Please select at least one interviewer'
            });
            return;
        }

        if (formData.interviewType === 'VIDEO' && !formData.meetingLink) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Meeting link is required for video interviews'
            });
            return;
        }

        if ((formData.interviewType === 'IN_PERSON') && !formData.location) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Location is required for in-person interviews'
            });
            return;
        }

        scheduleMutation.mutate();
    };

    const toggleInterviewer = (interviewerId: string) => {
        setFormData(prev => ({
            ...prev,
            interviewerIds: prev.interviewerIds.includes(interviewerId)
                ? prev.interviewerIds.filter(id => id !== interviewerId)
                : [...prev.interviewerIds, interviewerId]
        }));
    };

    const getInterviewIcon = () => {
        switch (formData.interviewType) {
            case 'VIDEO': return <Video className="h-5 w-5" />;
            case 'PHONE': return <Phone className="h-5 w-5" />;
            case 'IN_PERSON': return <MapPin className="h-5 w-5" />;
            case 'PANEL': return <Users className="h-5 w-5" />;
            default: return <Calendar className="h-5 w-5" />;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {getInterviewIcon()}
                        Schedule Interview
                    </DialogTitle>
                    <DialogDescription>
                        Schedule interview for {candidateName} - {jobTitle}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        {/* Interview Type */}
                        <div className="space-y-2">
                            <Label htmlFor="interviewType">Interview Type *</Label>
                            <Select
                                value={formData.interviewType}
                                onValueChange={(value) => setFormData({ ...formData, interviewType: value })}
                            >
                                <SelectTrigger id="interviewType">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PHONE">Phone Screen</SelectItem>
                                    <SelectItem value="VIDEO">Video Call</SelectItem>
                                    <SelectItem value="IN_PERSON">In-Person</SelectItem>
                                    <SelectItem value="PANEL">Panel Interview</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date and Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="scheduledDate">Date *</Label>
                                <DatePicker value={formData.scheduledDate} onChange={(v) => setFormData({ ...formData, scheduledDate: v })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="scheduledTime">Time *</Label>
                                <Input
                                    id="scheduledTime"
                                    type="time"
                                    value={formData.scheduledTime}
                                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Duration */}
                        <div className="space-y-2">
                            <Label htmlFor="duration">Duration</Label>
                            <Select
                                value={String(formData.duration)}
                                onValueChange={(value) => setFormData({ ...formData, duration: Number(value) })}
                            >
                                <SelectTrigger id="duration">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="30">30 minutes</SelectItem>
                                    <SelectItem value="45">45 minutes</SelectItem>
                                    <SelectItem value="60">1 hour</SelectItem>
                                    <SelectItem value="90">1.5 hours</SelectItem>
                                    <SelectItem value="120">2 hours</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Location (for in-person) */}
                        {(formData.interviewType === 'IN_PERSON' || formData.interviewType === 'PANEL') && (
                            <div className="space-y-2">
                                <Label htmlFor="location">Location *</Label>
                                <Input
                                    id="location"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="e.g., Conference Room A, HQ Building"
                                    required={formData.interviewType === 'IN_PERSON'}
                                />
                            </div>
                        )}

                        {/* Meeting Link (for video) */}
                        {(formData.interviewType === 'VIDEO' || formData.interviewType === 'PHONE') && (
                            <div className="space-y-2">
                                <Label htmlFor="meetingLink">
                                    Meeting Link {formData.interviewType === 'VIDEO' && '*'}
                                </Label>
                                <Input
                                    id="meetingLink"
                                    value={formData.meetingLink}
                                    onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                                    placeholder="https://zoom.us/j/... or Google Meet link"
                                    required={formData.interviewType === 'VIDEO'}
                                />
                            </div>
                        )}

                        {/* Interviewers */}
                        <div className="space-y-2">
                            <Label>Interviewers *</Label>
                            <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                                {availableInterviewers.map((interviewer) => (
                                    <Button variant="ghost" className="h-auto p-0 w-full justify-start font-normal text-left overflow-hidden border-none shadow-none bg-transparent active:scale-[0.98] hover:bg-transparent transition-all" asChild onClick={() => toggleInterviewer(interviewer.id)}>
                                    <div
                                                                            key={interviewer.id}
                                                                            className={cn(`p-2 rounded cursor-pointer border transition-colors ${formData.interviewerIds.includes(interviewer.id)
                                                                                    ? 'border-primary bg-primary/10'
                                                                                    : 'border-transparent hover:bg-muted'
                                                                                }`)}
                                                                        >
                                                                            <div className="flex items-center justify-between">
                                                                                <div>
                                                                                    <p className="font-medium text-sm">{interviewer.name}</p>
                                                                                    <p className="text-xs text-muted-foreground">{interviewer.email}</p>
                                                                                </div>
                                                                                {formData.interviewerIds.includes(interviewer.id) && (
                                                                                    <Badge variant="default" className="text-xs">Selected</Badge>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                    </Button>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {formData.interviewerIds.length} interviewer(s) selected
                            </p>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Additional details, topics to cover, etc."
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={scheduleMutation.isPending}>
                            {scheduleMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Scheduling...
                                </>
                            ) : (
                                <>
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Schedule Interview
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
