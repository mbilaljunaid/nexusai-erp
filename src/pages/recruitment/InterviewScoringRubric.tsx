import React, { useState } from 'react';
import { StandardPage } from '@/components/layout/StandardPage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Star, Users, TrendingUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const COMPETENCIES = [
    { id: 'prob_solving', label: 'Problem Solving' },
    { id: 'communication', label: 'Communication' },
    { id: 'technical', label: 'Technical Depth' },
    { id: 'leadership', label: 'Leadership / Ownership' },
    { id: 'culture_fit', label: 'Culture & Values Fit' },
];

const INTERVIEWERS = [
    { id: 'i1', name: 'Alice Chen', role: 'Hiring Manager', scores: { prob_solving: 4, communication: 5, technical: 4, leadership: 3, culture_fit: 5 }, notes: 'Strong communicator. Technical depth solid for the level.' },
    { id: 'i2', name: 'Bob Patel', role: 'Tech Lead', scores: { prob_solving: 3, communication: 4, technical: 5, leadership: 3, culture_fit: 4 }, notes: 'Excellent systems design. Could improve on stakeholder mgmt.' },
    { id: 'i3', name: 'Carla Ruiz', role: 'Product Manager', scores: { prob_solving: 5, communication: 5, technical: 3, leadership: 4, culture_fit: 5 }, notes: 'Very strong product sense. Great energy and culture add.' },
];

const avg = (comp: string) => {
    const vals = INTERVIEWERS.map((i) => i.scores[comp as keyof typeof i.scores] as number);
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
};

const ScoreDot = ({ score }: { score: number }) => {
    const colors: Record<number, string> = { 1: 'bg-destructive', 2: 'bg-orange-500', 3: 'bg-yellow-500', 4: 'bg-blue-500', 5: 'bg-green-500' };
    return (
        <div className="flex items-center gap-1">
            <div className={`h-3 w-3 rounded-full ${colors[score] ?? 'bg-muted'}`} />
            <span className="font-mono text-sm font-medium">{score}</span>
        </div>
    );
};

export default function InterviewScoringRubric() {
    const { toast } = useToast();
    const [recommendation, setRecommendation] = useState('');

    const handleSubmit = () => {
        toast({ title: 'Rubric Submitted', description: 'Interview scorecard has been saved and shared with the hiring team.' });
    };

    const overallAvg = COMPETENCIES.reduce((sum, c) => sum + parseFloat(avg(c.id)), 0) / COMPETENCIES.length;

    return (
        <StandardPage
            title="Interview Scoring Rubric"
            description="Structured per-competency scoring panel. Aggregates all interviewer scores into a consensus recommendation for the hiring manager."
            actions={
                <Button onClick={handleSubmit}>
                    <CheckCircle className="mr-2 h-4 w-4" /> Submit Scorecard
                </Button>
            }
        >
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Users className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <div className="font-semibold">Jordan Mitchell</div>
                                    <div className="text-xs text-muted-foreground">Sr. Software Engineer · REQ-2026-047</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold text-primary">{overallAvg.toFixed(1)}<span className="text-base text-muted-foreground">/5</span></div>
                            <div className="text-sm text-muted-foreground mt-1">Consensus Score</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm font-medium mb-2">Overall Consensus</div>
                            {overallAvg >= 4 ? (
                                <Badge className="bg-green-500/10 text-green-500 border-0 text-sm">Strong Hire</Badge>
                            ) : overallAvg >= 3 ? (
                                <Badge className="bg-yellow-500/10 text-yellow-500 border-0 text-sm">Hire with Reservations</Badge>
                            ) : (
                                <Badge variant="destructive" className="text-sm">No Hire</Badge>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Consensus Matrix */}
                <Card>
                    <CardHeader>
                        <CardTitle>Competency Score Matrix</CardTitle>
                        <CardDescription>Per-interviewer scores across each competency dimension (1 = Poor, 5 = Outstanding)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Competency</TableHead>
                                    {INTERVIEWERS.map((i) => (
                                        <TableHead key={i.id}>
                                            <div className="font-medium">{i.name}</div>
                                            <div className="text-xs text-muted-foreground font-normal">{i.role}</div>
                                        </TableHead>
                                    ))}
                                    <TableHead className="bg-primary/5">
                                        <div className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Avg</div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {COMPETENCIES.map((c) => (
                                    <TableRow key={c.id}>
                                        <TableCell className="font-medium">{c.label}</TableCell>
                                        {INTERVIEWERS.map((i) => (
                                            <TableCell key={i.id}>
                                                <ScoreDot score={i.scores[c.id as keyof typeof i.scores] as number} />
                                            </TableCell>
                                        ))}
                                        <TableCell className="bg-primary/5 font-bold">{avg(c.id)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Individual Feedback */}
                <Card>
                    <CardHeader>
                        <CardTitle>Interviewer Notes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {INTERVIEWERS.map((i) => {
                            const iAvg = Object.values(i.scores).reduce((a, b) => a + b, 0) / COMPETENCIES.length;
                            return (
                                <div key={i.id} className="p-4 rounded-lg border border-border bg-muted/30">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-medium flex items-center gap-2">
                                            <Star className="h-4 w-4 text-primary" />{i.name} <span className="text-xs text-muted-foreground">({i.role})</span>
                                        </div>
                                        <Badge variant="outline">Avg {iAvg.toFixed(1)}/5</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{i.notes}</p>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* Hiring Manager Decision */}
                <Card>
                    <CardHeader>
                        <CardTitle>Hiring Manager Decision</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Hiring Decision</Label>
                                <Select>
                                    <SelectTrigger><SelectValue placeholder="Select decision..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hire">Proceed to Offer</SelectItem>
                                        <SelectItem value="hold">Hold — Pending Additional Interviews</SelectItem>
                                        <SelectItem value="no_hire">No Hire</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Rationale / Notes (visible to HR)</Label>
                            <Textarea
                                placeholder="Summarize hiring decision and key supporting reasoning..."
                                value={recommendation}
                                onChange={(e) => setRecommendation(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <Button onClick={handleSubmit} className="w-full">Finalize Scorecard &amp; Notify Team</Button>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
