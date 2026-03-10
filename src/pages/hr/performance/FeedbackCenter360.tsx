import React, { useState } from 'react';
import { StandardPage } from '@/components/layout/StandardPage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, Eye, EyeOff, Clock, CheckCircle, UserPlus, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

interface FeedbackRequest {
    id: string;
    reviewer: string;
    relationship: string;
    status: 'sent' | 'responded' | 'declined';
    anonymous: boolean;
}

const REQUESTS: FeedbackRequest[] = [
    { id: '1', reviewer: 'Alice Chen', relationship: 'Peer', status: 'responded', anonymous: false },
    { id: '2', reviewer: 'Bob Patel', relationship: 'Direct Report', status: 'responded', anonymous: true },
    { id: '3', reviewer: 'Carla Ruiz', relationship: 'Cross-functional', status: 'sent', anonymous: true },
    { id: '4', reviewer: 'David Kim', relationship: 'Peer', status: 'sent', anonymous: false },
    { id: '5', reviewer: 'Eva Martinez', relationship: 'Skip Manager', status: 'declined', anonymous: false },
];

interface Dimension {
    label: string;
    avgScore: number;
    reviewerCount: number;
}

const DIMENSIONS: Dimension[] = [
    { label: 'Impact & Delivery', avgScore: 4.2, reviewerCount: 2 },
    { label: 'Communication', avgScore: 4.6, reviewerCount: 2 },
    { label: 'Leadership', avgScore: 3.8, reviewerCount: 2 },
    { label: 'Collaboration', avgScore: 4.5, reviewerCount: 2 },
    { label: 'Innovation', avgScore: 4.0, reviewerCount: 2 },
];

export default function FeedbackCenter360() {
    const { toast } = useToast();
    const [revealed, setRevealed] = useState(false);
    const [deadlineDays, setDeadlineDays] = useState('7');
    const [newReviewer, setNewReviewer] = useState('');

    const responded = REQUESTS.filter((r) => r.status === 'responded').length;
    const total = REQUESTS.length;

    const handleReveal = () => {
        setRevealed(true);
        toast({ title: 'Feedback Revealed', description: 'Aggregated results are now visible to the employee.' });
    };

    return (
        <StandardPage
            title="360° Feedback Center"
            description="Manage anonymous multi-rater feedback requests. Control invite, deadline, and reveal gates for each performance cycle."
        >
            <Tabs defaultValue="manage">
                <TabsList>
                    <TabsTrigger value="manage">Manage Requests</TabsTrigger>
                    <TabsTrigger value="results">Aggregated Results</TabsTrigger>
                    <TabsTrigger value="settings">Cycle Settings</TabsTrigger>
                </TabsList>

                {/* Manage Tab */}
                <TabsContent value="manage" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Feedback Requests — Jordan Mitchell</CardTitle>
                                    <CardDescription>2026 Annual Performance Cycle · {responded}/{total} responded</CardDescription>
                                </div>
                                <Badge variant={responded >= 3 ? 'default' : 'outline'} className={responded >= 3 ? 'bg-green-500' : ''}>
                                    {responded}/{total} Received
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <Progress value={(responded / total) * 100} className="h-2" />
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Reviewer</TableHead>
                                        <TableHead>Relationship</TableHead>
                                        <TableHead>Anonymity</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {REQUESTS.map((req) => (
                                        <TableRow key={req.id}>
                                            <TableCell className="font-medium">{req.reviewer}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{req.relationship}</TableCell>
                                            <TableCell>
                                                {req.anonymous ? (
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground"><Shield className="h-4 w-4 text-blue-500" /> Anonymous</div>
                                                ) : (
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground"><Eye className="h-4 w-4" /> Named</div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {req.status === 'responded' && <div className="flex items-center gap-1 text-green-500 text-sm"><CheckCircle className="h-4 w-4" /> Responded</div>}
                                                {req.status === 'sent' && <div className="flex items-center gap-1 text-yellow-500 text-sm"><Clock className="h-4 w-4" /> Awaiting</div>}
                                                {req.status === 'declined' && <Badge variant="destructive" className="text-xs">Declined</Badge>}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {req.status === 'sent' && (
                                                    <Button variant="ghost" size="sm" onClick={() => toast({ title: 'Reminder Sent', description: `Nudge sent to ${req.reviewer}.` })}>
                                                        <Send className="mr-1 h-3 w-3" /> Remind
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Invite Additional Reviewer</CardTitle></CardHeader>
                        <CardContent className="flex items-end gap-3">
                            <div className="flex-1 space-y-2">
                                <Label>Reviewer Name or Email</Label>
                                <Input placeholder="Search employee..." value={newReviewer} onChange={(e) => setNewReviewer(e.target.value)} />
                            </div>
                            <Button onClick={() => { setNewReviewer(''); toast({ title: 'Invite Sent', description: 'Feedback request has been dispatched.' }); }}>
                                <UserPlus className="mr-2 h-4 w-4" /> Send Invite
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Results Tab */}
                <TabsContent value="results" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Aggregated Feedback Results</CardTitle>
                                    <CardDescription>Based on {responded} anonymous responses</CardDescription>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">{revealed ? 'Visible to Employee' : 'Hidden from Employee'}</span>
                                    </div>
                                    {!revealed && (
                                        <Button onClick={handleReveal}>
                                            <Eye className="mr-2 h-4 w-4" /> Reveal to Employee
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {DIMENSIONS.map((dim) => (
                                <div key={dim.label} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{dim.label}</span>
                                        <span className="text-muted-foreground font-mono">{dim.avgScore}/5.0</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Progress value={(dim.avgScore / 5) * 100} className="flex-1 h-2.5" />
                                        <span className="text-xs text-muted-foreground">{dim.reviewerCount} ratings</span>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader><CardTitle>Cycle Configuration</CardTitle></CardHeader>
                        <CardContent className="space-y-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium">Allow Anonymous Responses</div>
                                    <div className="text-sm text-muted-foreground">Reviewers can opt to hide their identity from employee</div>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium">Require Minimum 3 Responses</div>
                                    <div className="text-sm text-muted-foreground">Results not shown until threshold met</div>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="space-y-2">
                                <Label>Deadline (Days from Today)</Label>
                                <Input type="number" value={deadlineDays} onChange={(e) => setDeadlineDays(e.target.value)} className="w-32" />
                            </div>
                            <Button onClick={() => toast({ title: 'Settings Saved', description: '360 cycle configuration updated.' })}>Save Settings</Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}
