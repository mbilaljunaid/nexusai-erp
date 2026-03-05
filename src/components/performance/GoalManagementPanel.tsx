import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Plus, Edit2, Trash2, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { DatePicker } from '@/components/ui/DatePicker';

interface Goal {
    id: string;
    title: string;
    description?: string;
    category: 'INDIVIDUAL' | 'TEAM' | 'COMPANY';
    weight: number;
    progress: number;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE' | 'ON_HOLD';
    targetDate: string;
}

export default function GoalManagementPanel({ personId }: { personId?: string }) {
    const queryClient = useQueryClient();
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        mode: 'view' | 'edit' | 'create';
        goal?: Goal;
    }>({ isOpen: false, mode: 'create' });
    const [filterCategory, setFilterCategory] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const { data: goals = [], isLoading } = useQuery<Goal[]>({
        queryKey: ['/api/performance/goals', personId],
        queryFn: async () => {
            // Mock data for development
            if (!personId) {
                return [
                    {
                        id: 'goal-1',
                        title: 'Complete Certification Course',
                        description: 'Complete AWS Solutions Architect certification by Q2',
                        category: 'INDIVIDUAL' as const,
                        weight: 25,
                        progress: 60,
                        status: 'IN_PROGRESS' as const,
                        targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: 'goal-2',
                        title: 'Launch Product Feature',
                        description: 'Ship new analytics dashboard to production',
                        category: 'TEAM' as const,
                        weight: 40,
                        progress: 85,
                        status: 'IN_PROGRESS' as const,
                        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: 'goal-3',
                        title: 'Improve Response Time',
                        description: 'Reduce average API response time by 30%',
                        category: 'INDIVIDUAL' as const,
                        weight: 20,
                        progress: 100,
                        status: 'COMPLETE' as const,
                        targetDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
                    }
                ];
            }
            const res = await fetch(`/api/performance/goals?personId=${personId}`);
            if (!res.ok) throw new Error('Failed to fetch goals');
            return res.json();
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: Partial<Goal>) => {
            const res = await fetch('/api/performance/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, personId })
            });
            if (!res.ok) throw new Error('Failed to create goal');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/performance/goals'] });
            toast({ title: 'Goal Created', description: 'Performance goal created successfully' });
            setModalState({ isOpen: false, mode: 'create' });
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Goal> }) => {
            const res = await fetch(`/api/performance/goals/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to update goal');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/performance/goals'] });
            toast({ title: 'Goal Updated', description: 'Performance goal updated successfully' });
            setModalState({ isOpen: false, mode: 'create' });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/performance/goals/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete goal');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/performance/goals'] });
            toast({ title: 'Goal Deleted', description: 'Performance goal deleted successfully' });
        }
    });

    const filteredGoals = goals.filter(goal => {
        if (filterCategory !== 'ALL' && goal.category !== filterCategory) return false;
        if (filterStatus !== 'ALL' && goal.status !== filterStatus) return false;
        return true;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETE':
                return <Badge variant="default" className="bg-green-600">Complete</Badge>;
            case 'IN_PROGRESS':
                return <Badge variant="default" className="bg-blue-600">In Progress</Badge>;
            case 'NOT_STARTED':
                return <Badge variant="secondary">Not Started</Badge>;
            case 'ON_HOLD':
                return <Badge variant="outline">On Hold</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'INDIVIDUAL': return 'text-blue-600';
            case 'TEAM': return 'text-purple-600';
            case 'COMPANY': return 'text-green-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Categories</SelectItem>
                            <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                            <SelectItem value="TEAM">Team</SelectItem>
                            <SelectItem value="COMPANY">Company</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Statuses</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                            <SelectItem value="COMPLETE">Complete</SelectItem>
                            <SelectItem value="ON_HOLD">On Hold</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={() => setModalState({ isOpen: true, mode: 'create' })}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Goal
                </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="p-3 text-left text-sm font-semibold">Title</th>
                            <th className="p-3 text-left text-sm font-semibold">Category</th>
                            <th className="p-3 text-left text-sm font-semibold">Weight</th>
                            <th className="p-3 text-left text-sm font-semibold">Progress</th>
                            <th className="p-3 text-left text-sm font-semibold">Status</th>
                            <th className="p-3 text-left text-sm font-semibold">Due Date</th>
                            <th className="p-3 text-right text-sm font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                        ) : filteredGoals.length === 0 ? (
                            <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No goals found</td></tr>
                        ) : (
                            filteredGoals.map(goal => (
                                <tr key={goal.id} className="border-t hover:bg-muted/20">
                                    <td className="p-3">
                                        <div>
                                            <p className="font-medium">{goal.title}</p>
                                            {goal.description && (
                                                <p className="text-xs text-muted-foreground mt-1">{goal.description}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <Badge variant="outline" className={getCategoryColor(goal.category)}>
                                            {goal.category}
                                        </Badge>
                                    </td>
                                    <td className="p-3"><span className="font-semibold">{goal.weight}%</span></td>
                                    <td className="p-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span>{goal.progress}%</span>
                                            </div>
                                            <Progress value={goal.progress} className="w-32" />
                                        </div>
                                    </td>
                                    <td className="p-3">{getStatusBadge(goal.status)}</td>
                                    <td className="p-3 text-sm">
                                        {new Date(goal.targetDate).toLocaleDateString()}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex justify-end gap-2">
                                            <Button size="icon" variant="ghost" onClick={() => setModalState({ isOpen: true, mode: 'edit', goal })}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => {
                                                    if (confirm(`Delete goal "${goal.title}"?`)) {
                                                        deleteMutation.mutate(goal.id);
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <GoalModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false, mode: 'create' })}
                mode={modalState.mode}
                goal={modalState.goal}
                onSubmit={(data) => {
                    if (modalState.mode === 'edit' && modalState.goal) {
                        updateMutation.mutate({ id: modalState.goal.id, data });
                    } else {
                        createMutation.mutate(data);
                    }
                }}
            />
        </div>
    );
}

function GoalModal({
    isOpen,
    onClose,
    mode,
    goal,
    onSubmit
}: {
    isOpen: boolean;
    onClose: () => void;
    mode: 'view' | 'edit' | 'create';
    goal?: Goal;
    onSubmit: (data: Partial<Goal>) => void;
}) {
    const [formData, setFormData] = useState<Partial<Goal>>(
        goal || {
            title: '',
            description: '',
            category: 'INDIVIDUAL',
            weight: 20,
            progress: 0,
            status: 'NOT_STARTED',
            targetDate: ''
        }
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        {mode === 'create' ? 'Create Goal' : mode === 'edit' ? 'Edit Goal' : 'View Goal'}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === 'create'
                            ? 'Set a new performance goal'
                            : 'Manage your performance goal'
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Complete AWS Certification"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Additional details about this goal..."
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category *</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => setFormData({ ...formData, category: value as any })}
                                >
                                    <SelectTrigger id="category">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                                        <SelectItem value="TEAM">Team</SelectItem>
                                        <SelectItem value="COMPANY">Company</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status *</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                        <SelectItem value="COMPLETE">Complete</SelectItem>
                                        <SelectItem value="ON_HOLD">On Hold</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Weight: {formData.weight}%</Label>
                            <Slider
                                value={[formData.weight || 20]}
                                onValueChange={(value) => setFormData({ ...formData, weight: value[0] })}
                                max={100}
                                step={5}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Progress: {formData.progress}%</Label>
                            <Slider
                                value={[formData.progress || 0]}
                                onValueChange={(value) => setFormData({ ...formData, progress: value[0] })}
                                max={100}
                                step={5}
                            />
                            <Progress value={formData.progress} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="targetDate">Target Date *</Label>
                            <DatePicker value={formData.targetDate ? new Date(formData.targetDate).toISOString().split('T')[0] : ''} onChange={(v) => setFormData({ ...formData, targetDate: v })} />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit">
                            {mode === 'create' ? 'Create Goal' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
