import React, { useState } from 'react';
import { StandardPage } from '@/components/layout/StandardPage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Layers, BookOpen, Link, Edit2, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface JobFamily {
    id: string;
    name: string;
    code: string;
    profileCount: number;
    jobCount: number;
}

interface JobProfile {
    id: string;
    name: string;
    jobFamilyId: string;
    gradeRange: string;
    requiredCompetencies: { competency: string; proficiency: string }[];
}

const JOB_FAMILIES: JobFamily[] = [
    { id: 'jf1', name: 'Technology', code: 'TECH', profileCount: 5, jobCount: 12 },
    { id: 'jf2', name: 'Finance & Accounting', code: 'FIN', profileCount: 4, jobCount: 8 },
    { id: 'jf3', name: 'Human Resources', code: 'HR', profileCount: 3, jobCount: 6 },
    { id: 'jf4', name: 'Operations', code: 'OPS', profileCount: 4, jobCount: 10 },
];

const JOB_PROFILES: JobProfile[] = [
    {
        id: 'jp1',
        name: 'Software Engineer II',
        jobFamilyId: 'jf1',
        gradeRange: 'IC3 – IC4',
        requiredCompetencies: [
            { competency: 'Technical Problem Solving', proficiency: 'Proficient' },
            { competency: 'Code Quality', proficiency: 'Proficient' },
            { competency: 'Collaboration', proficiency: 'Developing' },
        ],
    },
    {
        id: 'jp2',
        name: 'Sr. Software Engineer',
        jobFamilyId: 'jf1',
        gradeRange: 'IC4 – IC5',
        requiredCompetencies: [
            { competency: 'Technical Problem Solving', proficiency: 'Advanced' },
            { competency: 'System Design', proficiency: 'Proficient' },
            { competency: 'Mentorship', proficiency: 'Proficient' },
            { competency: 'Code Quality', proficiency: 'Advanced' },
        ],
    },
    {
        id: 'jp3',
        name: 'Financial Analyst III',
        jobFamilyId: 'jf2',
        gradeRange: 'IC3 – IC4',
        requiredCompetencies: [
            { competency: 'Financial Modeling', proficiency: 'Proficient' },
            { competency: 'Data Analysis', proficiency: 'Advanced' },
            { competency: 'Communication', proficiency: 'Proficient' },
        ],
    },
];

const PROFICIENCY_COLORS: Record<string, string> = {
    Developing: 'bg-muted text-muted-foreground',
    Proficient: 'bg-blue-500/10 text-blue-500',
    Advanced: 'bg-green-500/10 text-green-500',
    Expert: 'bg-purple-500/10 text-purple-500',
};

export default function JobFamiliesProfiles() {
    const { toast } = useToast();
    const [families, setFamilies] = useState<JobFamily[]>(JOB_FAMILIES);
    const [selectedFamily, setSelectedFamily] = useState<string>('jf1');
    const [newFamilyName, setNewFamilyName] = useState('');
    const [newFamilyCode, setNewFamilyCode] = useState('');

    const profilesForFamily = JOB_PROFILES.filter((p) => p.jobFamilyId === selectedFamily);

    const addFamily = () => {
        if (!newFamilyName || !newFamilyCode) return;
        const newF: JobFamily = {
            id: `jf${Date.now()}`,
            name: newFamilyName,
            code: newFamilyCode.toUpperCase(),
            profileCount: 0,
            jobCount: 0,
        };
        setFamilies((prev) => [...prev, newF]);
        setNewFamilyName('');
        setNewFamilyCode('');
        toast({ title: 'Job Family Created', description: `${newF.name} added to the registry.` });
    };

    return (
        <StandardPage
            title="Job Families & Job Profiles"
            description="Group jobs into families and attach required competency profiles. Job Profiles link roles to specific competency requirements and grade ranges, enabling structured career paths."
            actions={
                <Button onClick={() => toast({ title: 'New Profile', description: 'Job Profile builder ready.' })}>
                    <Plus className="mr-2 h-4 w-4" /> New Job Profile
                </Button>
            }
        >
            <Tabs defaultValue="families">
                <TabsList>
                    <TabsTrigger value="families">Job Families</TabsTrigger>
                    <TabsTrigger value="profiles">Job Profiles</TabsTrigger>
                </TabsList>

                {/* Families Tab */}
                <TabsContent value="families" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {families.map((family) => (
                            <Card key={family.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSelectedFamily(family.id)}>
                                <CardContent className="pt-5">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Layers className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <div className="font-semibold">{family.name}</div>
                                                <div className="text-xs text-muted-foreground font-mono">{family.code}</div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" aria-label="Edit family">
                                            <Edit2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                    <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {family.profileCount} Profiles</div>
                                        <div className="flex items-center gap-1"><Link className="h-4 w-4" /> {family.jobCount} Jobs Linked</div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Add Family */}
                    <Card>
                        <CardHeader><CardTitle>Add New Job Family</CardTitle></CardHeader>
                        <CardContent className="flex items-end gap-3">
                            <div className="flex-1 space-y-2">
                                <Label>Family Name</Label>
                                <Input placeholder="e.g. Legal & Compliance" value={newFamilyName} onChange={(e) => setNewFamilyName(e.target.value)} />
                            </div>
                            <div className="w-32 space-y-2">
                                <Label>Code</Label>
                                <Input placeholder="e.g. LEGAL" value={newFamilyCode} onChange={(e) => setNewFamilyCode(e.target.value)} />
                            </div>
                            <Button onClick={addFamily} disabled={!newFamilyName || !newFamilyCode}>
                                <Plus className="mr-2 h-4 w-4" /> Add Family
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Profiles Tab */}
                <TabsContent value="profiles" className="space-y-4 mt-4">
                    <div className="flex items-center gap-3">
                        <Label className="shrink-0">Filter by Family:</Label>
                        <Select value={selectedFamily} onValueChange={setSelectedFamily}>
                            <SelectTrigger className="w-52">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {families.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    {profilesForFamily.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                No job profiles defined for this family yet.
                            </CardContent>
                        </Card>
                    ) : (
                        profilesForFamily.map((profile) => (
                            <Card key={profile.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <BookOpen className="h-4 w-4 text-primary" /> {profile.name}
                                            </CardTitle>
                                            <CardDescription>Grade Range: <Badge variant="outline" className="ml-1">{profile.gradeRange}</Badge></CardDescription>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            <Edit2 className="mr-1 h-3.5 w-3.5" /> Edit
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2 mb-3">
                                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Required Competencies ({profile.requiredCompetencies.length})</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.requiredCompetencies.map((comp) => (
                                            <div key={comp.competency} className="flex items-center gap-1.5 border border-border rounded-md px-2.5 py-1 text-sm">
                                                <span className="font-medium">{comp.competency}</span>
                                                <span>·</span>
                                                <Badge className={`${PROFICIENCY_COLORS[comp.proficiency]} border-0 shadow-none text-xs`}>{comp.proficiency}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}
