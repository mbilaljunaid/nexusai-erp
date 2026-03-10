import React from 'react';
import { StandardPage } from '@/components/layout/StandardPage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, Award, Workflow, ArrowRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export default function LearningSkillIntegration() {
    const { toast } = useToast();

    const handleSave = () => {
        toast({
            title: "Integration Rules Saved",
            description: "Rules mapping course completions to worker skill profiles are active."
        });
    };

    return (
        <StandardPage
            title="Learning-to-Skills Integration"
            description="Automatically append skills and competencies to the worker's unified Talent Profile upon course completion."
            actions={
                <Button onClick={handleSave}>
                    Save Integration Map
                </Button>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Course Competency Mappings</CardTitle>
                        <CardDescription>Link catalog items directly to the enterprise skill repository</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Course / Certification</TableHead>
                                    <TableHead className="text-center">Link</TableHead>
                                    <TableHead>Target Skill Granted</TableHead>
                                    <TableHead>Proficiency Level</TableHead>
                                    <TableHead>Auto-Verify</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="h-4 w-4 text-primary" />
                                            Advanced React Architecture
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center"><ArrowRight className="h-4 w-4 inline text-muted-foreground" /></TableCell>
                                    <TableCell><Badge variant="outline">React JS</Badge></TableCell>
                                    <TableCell>
                                        <Select defaultValue="expert">
                                            <SelectTrigger className="h-8 text-xs w-[120px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="beginner">Beginner</SelectItem>
                                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                                <SelectItem value="expert">Expert</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell><Switch defaultChecked /></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <Award className="h-4 w-4 text-yellow-500" />
                                            AWS Cloud Practitioner Cert
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center"><ArrowRight className="h-4 w-4 inline text-muted-foreground" /></TableCell>
                                    <TableCell><Badge variant="outline">Cloud Architecture</Badge></TableCell>
                                    <TableCell>
                                        <Select defaultValue="beginner">
                                            <SelectTrigger className="h-8 text-xs w-[120px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="beginner">Beginner</SelectItem>
                                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                                <SelectItem value="expert">Expert</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell><Switch defaultChecked /></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="h-4 w-4 text-primary" />
                                            Conflict Resolution 101
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center"><ArrowRight className="h-4 w-4 inline text-muted-foreground" /></TableCell>
                                    <TableCell><Badge variant="outline">Management</Badge></TableCell>
                                    <TableCell>
                                        <Select defaultValue="intermediate">
                                            <SelectTrigger className="h-8 text-xs w-[120px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="beginner">Beginner</SelectItem>
                                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                                <SelectItem value="expert">Expert</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell><Switch /></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>System Workflow</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col items-center justify-center p-4 border border-border rounded-lg bg-muted/50 gap-2 text-center text-sm">
                                <GraduationCap className="h-6 w-6 text-primary" />
                                <span className="font-medium">1. Learner Completes Course</span>
                                <span className="text-xs text-muted-foreground">Scorm player marks 100% complete and assessment passed.</span>

                                <Workflow className="h-5 w-5 text-muted-foreground my-1" />

                                <span className="font-medium">2. Skill Extraction Engine</span>
                                <span className="text-xs text-muted-foreground">System identifies mapped target skills.</span>

                                <Workflow className="h-5 w-5 text-muted-foreground my-1" />

                                <span className="font-medium">3. Profile Update</span>
                                <span className="text-xs text-muted-foreground">Oracle Talent Profile receives a new Competency Row with automated source tracing.</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
