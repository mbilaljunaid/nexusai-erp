import React, { useState } from 'react';
import { StandardPage } from '@/components/layout/StandardPage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Calendar, GitCommit, History, Plus, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function EffectiveDatingPanel() {
    const { toast } = useToast();
    const [date, setDate] = useState<string>('');
    const [mode, setMode] = useState<'correction' | 'future' | 'backdated'>('future');

    const handleApply = () => {
        toast({
            title: `DateTrack Change Applied`,
            description: `A new effective-dated row will be created for ${date || 'the selected date'}.`
        });
    };

    return (
        <StandardPage
            title="Effective Dating — DateTrack Manager"
            description="Oracle-style effective dating: every HR change (salary, grade, department, manager) creates a dated row without destroying history."
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Effective-Dated Change</CardTitle>
                            <CardDescription>Select a date and change mode. The system will insert a new row at the boundary date.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Employee</Label>
                                    <Input placeholder="Search by name or ID..." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Effective Date *</Label>
                                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                                </div>
                            </div>

                            <div>
                                <Label className="mb-2 block">Change Mode</Label>
                                <div className="flex gap-3">
                                    {[
                                        { key: 'future', label: 'Future-Dated', color: 'text-blue-500' },
                                        { key: 'backdated', label: 'Backdated Correction', color: 'text-yellow-500' },
                                        { key: 'correction', label: 'Date Correction', color: 'text-destructive' },
                                    ].map((m) => (
                                        <button
                                            key={m.key}
                                            onClick={() => setMode(m.key as typeof mode)}
                                            className={`flex-1 border rounded-lg p-3 text-sm font-medium transition-all ${mode === m.key
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'border-border hover:bg-muted text-muted-foreground'
                                                }`}
                                        >
                                            {m.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Field to Change</Label>
                                    <Select>
                                        <SelectTrigger><SelectValue placeholder="Select field..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="dept">Department</SelectItem>
                                            <SelectItem value="job">Job / Position</SelectItem>
                                            <SelectItem value="grade">Grade</SelectItem>
                                            <SelectItem value="salary">Salary</SelectItem>
                                            <SelectItem value="manager">Line Manager</SelectItem>
                                            <SelectItem value="location">Work Location</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>New Value</Label>
                                    <Input placeholder="New department, grade, salary etc." />
                                </div>
                            </div>

                            {mode === 'backdated' && (
                                <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm text-yellow-700 dark:text-yellow-400">
                                    <AlertTriangle className="h-4 w-4 shrink-0" />
                                    Backdated changes may trigger retro-pay calculations. The payroll engine will be notified automatically.
                                </div>
                            )}

                            <Button onClick={handleApply} className="w-full">
                                <Calendar className="mr-2 h-4 w-4" /> Apply Effective-Dated Change
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Assignment History (Effective Rows)</CardTitle>
                            <CardDescription>Every past and future state of this assignment — full DateTrack audit trail</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Effective Start</TableHead>
                                        <TableHead>Effective End</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Job</TableHead>
                                        <TableHead>Grade</TableHead>
                                        <TableHead>Manager</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow className="bg-primary/5">
                                        <TableCell className="font-medium">Apr 01, 2026</TableCell>
                                        <TableCell className="text-muted-foreground italic">End of Time</TableCell>
                                        <TableCell>Engineering</TableCell>
                                        <TableCell>Sr. SWE</TableCell>
                                        <TableCell>IC-4</TableCell>
                                        <TableCell>T. Bell</TableCell>
                                        <TableCell><Badge variant="default">Current</Badge></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Jan 15, 2024</TableCell>
                                        <TableCell>Mar 31, 2026</TableCell>
                                        <TableCell>Engineering</TableCell>
                                        <TableCell>SWE II</TableCell>
                                        <TableCell>IC-3</TableCell>
                                        <TableCell>T. Bell</TableCell>
                                        <TableCell><Badge variant="outline">Historic</Badge></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Jun 01, 2022</TableCell>
                                        <TableCell>Jan 14, 2024</TableCell>
                                        <TableCell>Product</TableCell>
                                        <TableCell>SWE I</TableCell>
                                        <TableCell>IC-2</TableCell>
                                        <TableCell>S. Lee</TableCell>
                                        <TableCell><Badge variant="outline">Historic</Badge></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>DateTrack Concepts</CardTitle>
                            <CardDescription>Oracle Fusion effective dating rules</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                                <GitCommit className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-medium">Update Mode</div>
                                    <div className="text-muted-foreground text-xs">Inserts a new row from the effective date → End of Time. Closes the previous row.</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                                <History className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-medium">Correction Mode</div>
                                    <div className="text-muted-foreground text-xs">Updates the current row only. Does not create history. Use for data entry errors.</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                                <Plus className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-medium">Future Entry</div>
                                    <div className="text-muted-foreground text-xs">Inserts a row with a start date in the future. Current row stays active until that date.</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
