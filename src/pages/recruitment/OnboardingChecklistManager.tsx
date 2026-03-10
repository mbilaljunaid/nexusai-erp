import React, { useState } from 'react';
import { StandardPage } from '@/components/layout/StandardPage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Clock, Plus, Settings, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

interface ChecklistItem {
    id: string;
    task: string;
    category: 'IT' | 'Legal' | 'Facilities' | 'HR';
    owner: string;
    dueDays: number; // Days after start date
    status: 'pending' | 'complete' | 'skipped';
}

const TEMPLATES: ChecklistItem[] = [
    { id: '1', task: 'Provision Laptop & Peripherals', category: 'IT', owner: 'IT Admin', dueDays: -3, status: 'complete' },
    { id: '2', task: 'Create Active Directory Account', category: 'IT', owner: 'IT Admin', dueDays: -1, status: 'complete' },
    { id: '3', task: 'Grant System Access (ERP, HRIS)', category: 'IT', owner: 'IT Admin', dueDays: 0, status: 'pending' },
    { id: '4', task: 'Sign Employment Agreement', category: 'Legal', owner: 'HR', dueDays: -5, status: 'complete' },
    { id: '5', task: 'NDA & IP Agreement', category: 'Legal', owner: 'Legal', dueDays: 0, status: 'pending' },
    { id: '6', task: 'Benefits Enrollment Window Open', category: 'HR', owner: 'HR', dueDays: 0, status: 'pending' },
    { id: '7', task: 'Assign Buddy / Mentor', category: 'HR', owner: 'Line Manager', dueDays: 0, status: 'pending' },
    { id: '8', task: 'Office Access Badge', category: 'Facilities', owner: 'Facilities', dueDays: -1, status: 'pending' },
    { id: '9', task: 'Desk & Parking Assignment', category: 'Facilities', owner: 'Facilities', dueDays: 0, status: 'pending' },
];

const CATEGORY_COLORS: Record<string, string> = {
    IT: 'bg-blue-500/10 text-blue-500',
    Legal: 'bg-red-500/10 text-red-500',
    Facilities: 'bg-orange-500/10 text-orange-500',
    HR: 'bg-green-500/10 text-green-500',
};

export default function OnboardingChecklistManager() {
    const { toast } = useToast();
    const [items, setItems] = useState<ChecklistItem[]>(TEMPLATES);

    const completeItem = (id: string) => {
        setItems((prev) => prev.map((i) => i.id === id ? { ...i, status: 'complete' } : i));
        toast({ title: 'Task Completed', description: 'Onboarding task marked as done.' });
    };

    const completedCount = items.filter((i) => i.status === 'complete').length;
    const progress = Math.round((completedCount / items.length) * 100);

    return (
        <StandardPage
            title="Onboarding Checklist Manager"
            description="Define and track onboarding task templates. Auto-assigned when a candidate offer is accepted, categorized by IT, Legal, Facilities, and HR."
            actions={
                <Button variant="secondary" onClick={() => toast({ title: 'Trigger Test', description: 'Checklist auto-assigned to Jordan Mitchell.' })}>
                    <Zap className="mr-2 h-4 w-4" /> Test Auto-Assign Trigger
                </Button>
            }
        >
            <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(['IT', 'Legal', 'Facilities', 'HR'] as const).map((cat) => {
                        const catItems = items.filter((i) => i.category === cat);
                        const done = catItems.filter((i) => i.status === 'complete').length;
                        return (
                            <Card key={cat}>
                                <CardContent className="pt-5">
                                    <div className="flex items-center justify-between">
                                        <Badge className={`${CATEGORY_COLORS[cat]} border-0 shadow-none`}>{cat}</Badge>
                                        <span className="text-sm text-muted-foreground">{done}/{catItems.length}</span>
                                    </div>
                                    <div className="mt-3">
                                        <Progress value={catItems.length ? (done / catItems.length) * 100 : 0} className="h-1.5" />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Active New Hire */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Jordan Mitchell — Sr. Software Engineer</CardTitle>
                                <CardDescription>Start Date: Apr 01, 2026 · {completedCount}/{items.length} tasks complete</CardDescription>
                            </div>
                            <Badge variant={progress === 100 ? 'default' : 'outline'} className={progress === 100 ? 'bg-green-500' : ''}>
                                {progress}% Complete
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Task</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Owner</TableHead>
                                    <TableHead>Due</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item) => (
                                    <TableRow key={item.id} className={item.status === 'complete' ? 'opacity-60' : ''}>
                                        <TableCell className="font-medium">{item.task}</TableCell>
                                        <TableCell>
                                            <Badge className={`${CATEGORY_COLORS[item.category]} border-0 shadow-none text-xs`}>{item.category}</Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{item.owner}</TableCell>
                                        <TableCell className="text-sm">
                                            {item.dueDays === 0 ? 'Day 1' : item.dueDays < 0 ? `${Math.abs(item.dueDays)}d before start` : `Day ${item.dueDays}`}
                                        </TableCell>
                                        <TableCell>
                                            {item.status === 'complete' ? (
                                                <div className="flex items-center gap-1 text-green-500 text-sm"><CheckCircle className="h-4 w-4" /> Done</div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-muted-foreground text-sm"><Clock className="h-4 w-4" /> Pending</div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {item.status !== 'complete' && (
                                                <Button variant="outline" size="sm" onClick={() => completeItem(item.id)}>Complete</Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Template Config */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Settings className="h-4 w-4" /> Template Configuration</CardTitle>
                        <CardDescription>These tasks are automatically applied when an offer status changes to Accepted.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>New Task Name</Label>
                                <Input placeholder="e.g. Assign Corporate Card" />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select>
                                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="IT">IT</SelectItem>
                                        <SelectItem value="Legal">Legal</SelectItem>
                                        <SelectItem value="Facilities">Facilities</SelectItem>
                                        <SelectItem value="HR">HR</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end">
                                <Button className="w-full" onClick={() => toast({ title: 'Task Added', description: 'Template updated for future hires.' })}>
                                    <Plus className="mr-2 h-4 w-4" /> Add to Template
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
