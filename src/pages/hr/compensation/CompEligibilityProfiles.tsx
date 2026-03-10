import React, { useState } from 'react';
import { StandardPage } from '@/components/layout/StandardPage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Users, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface Condition {
    field: string;
    operator: string;
    value: string;
}

interface Profile {
    id: string;
    name: string;
    conditions: Condition[];
    linkedPlan: string;
    active: boolean;
    eligibleCount: number;
}

const INITIAL_PROFILES: Profile[] = [
    {
        id: '1',
        name: 'Full-Time Annual Bonus',
        conditions: [
            { field: 'workerType', operator: '=', value: 'EMPLOYEE' },
            { field: 'fteFactor', operator: '>=', value: '1.0' },
            { field: 'tenureMonths', operator: '>=', value: '12' },
        ],
        linkedPlan: 'Annual Bonus Plan',
        active: true,
        eligibleCount: 312,
    },
    {
        id: '2',
        name: 'Part-Time Prorated Bonus',
        conditions: [
            { field: 'workerType', operator: '=', value: 'EMPLOYEE' },
            { field: 'fteFactor', operator: '<', value: '1.0' },
            { field: 'tenureMonths', operator: '>=', value: '6' },
        ],
        linkedPlan: 'Prorated Bonus Plan',
        active: true,
        eligibleCount: 48,
    },
    {
        id: '3',
        name: 'Executive Long-Term Incentive',
        conditions: [
            { field: 'gradeCode', operator: 'IN', value: 'DIR, VP, SVP, EVP, C-Level' },
        ],
        linkedPlan: 'LTI Stock Plan 2026',
        active: false,
        eligibleCount: 24,
    },
];

const FIELD_OPTIONS = ['workerType', 'fteFactor', 'tenureMonths', 'gradeCode', 'department', 'legalEntity'];
const OP_OPTIONS = ['=', '!=', '>=', '<=', '>', '<', 'IN', 'NOT IN'];

export default function CompEligibilityProfiles() {
    const { toast } = useToast();
    const [profiles, setProfiles] = useState<Profile[]>(INITIAL_PROFILES);
    const [newName, setNewName] = useState('');

    const toggleProfile = (id: string) => {
        setProfiles((prev) => prev.map((p) => p.id === id ? { ...p, active: !p.active } : p));
        toast({ title: 'Profile Updated' });
    };

    const deleteProfile = (id: string) => {
        setProfiles((prev) => prev.filter((p) => p.id !== id));
        toast({ title: 'Profile Deleted' });
    };

    const totalEligible = profiles.filter((p) => p.active).reduce((s, p) => s + p.eligibleCount, 0);

    return (
        <StandardPage
            title="Compensation Eligibility Profiles"
            description="Define rules that determine which employees qualify for each compensation plan. Rules evaluate worker type, FTE, tenure, grade, and more."
            actions={
                <Button onClick={() => toast({ title: 'Profile Created', description: 'New eligibility profile ready to configure.' })}>
                    <Plus className="mr-2 h-4 w-4" /> New Profile
                </Button>
            }
        >
            <div className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold">{profiles.filter((p) => p.active).length}</div>
                            <div className="text-sm text-muted-foreground">Active Profiles</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold text-primary">{totalEligible.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">Total Eligible Employees</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold">{profiles.length}</div>
                            <div className="text-sm text-muted-foreground">Total Plans Covered</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Profiles List */}
                {profiles.map((profile) => (
                    <Card key={profile.id} className={!profile.active ? 'opacity-60' : ''}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">{profile.name}</CardTitle>
                                    <CardDescription>Linked to: <span className="font-medium text-foreground">{profile.linkedPlan}</span></CardDescription>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">{profile.eligibleCount} eligible</span>
                                    </div>
                                    <Switch checked={profile.active} onCheckedChange={() => toggleProfile(profile.id)} aria-label="Toggle profile" />
                                    <Button variant="ghost" size="sm" onClick={() => deleteProfile(profile.id)} aria-label="Delete profile">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {profile.conditions.map((cond, i) => (
                                    <div key={i} className="flex items-center gap-2 flex-wrap">
                                        <Badge variant="outline" className="font-mono text-xs">{i === 0 ? 'WHERE' : 'AND'}</Badge>
                                        <span className="bg-muted px-2 py-0.5 rounded text-sm font-mono">{cond.field}</span>
                                        <span className="text-sm text-muted-foreground font-bold">{cond.operator}</span>
                                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-sm font-mono">{cond.value}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* Add Condition Builder */}
                <Card>
                    <CardHeader>
                        <CardTitle>Build a New Rule Condition</CardTitle>
                        <CardDescription>Select a field, operator, and target value to define eligibility logic.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-3 flex-wrap">
                            <div className="space-y-2">
                                <Label>Field</Label>
                                <Select>
                                    <SelectTrigger className="w-40"><SelectValue placeholder="Field..." /></SelectTrigger>
                                    <SelectContent>
                                        {FIELD_OPTIONS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Operator</Label>
                                <Select>
                                    <SelectTrigger className="w-28"><SelectValue placeholder="Op..." /></SelectTrigger>
                                    <SelectContent>
                                        {OP_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Value</Label>
                                <Input placeholder="e.g. EMPLOYEE or 12" className="w-40" />
                            </div>
                            <Button variant="outline" onClick={() => toast({ title: 'Condition Added', description: 'Logic rule added to current profile.' })}>
                                <Check className="mr-2 h-4 w-4" /> Add Condition
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
