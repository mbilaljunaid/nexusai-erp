import React from 'react';
import { StandardPage } from '@/components/layout/StandardPage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, CheckCircle, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ExternalTrainingCredit() {
    const { toast } = useToast();

    const handleSubmit = () => {
        toast({
            title: "Credit Submitted",
            description: "External training request submitted for HR review."
        });
    };

    return (
        <StandardPage
            title="External Training Credit (CPE)"
            description="Submit and manage requests for Continuous Professional Education (CPE) credits earned externally."
            actions={
                <Button onClick={handleSubmit}>
                    <Upload className="mr-2 h-4 w-4" /> Submit Certificate
                </Button>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Submit New External Training</CardTitle>
                            <CardDescription>Enter details of the course or conference completed outside the Oracle Learning LMS</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Course / Event Title</Label>
                                    <Input placeholder="e.g. AWS Certified Solutions Architect" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Institution / Provider</Label>
                                    <Input placeholder="e.g. Amazon Web Services" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Completion Date</Label>
                                    <Input type="date" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Credit Value (CPE points / Hours)</Label>
                                    <Input type="number" placeholder="40" />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label>Training Category</Label>
                                    <Select defaultValue="certification">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="certification">Professional Certification</SelectItem>
                                            <SelectItem value="conference">Conference / Workshop</SelectItem>
                                            <SelectItem value="university">University Course (Tuition Reimbursement)</SelectItem>
                                            <SelectItem value="compliance">External Compliance Requirement</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label>Proof Document Upload</Label>
                                    <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 cursor-pointer transition">
                                        <FileText className="h-8 w-8 mb-2" />
                                        <span className="text-sm">Drag & drop your certificate PDF here</span>
                                        <span className="text-xs">Max file size: 5MB</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Submissions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Event</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">AWS Cert</TableCell>
                                        <TableCell>Oct 12</TableCell>
                                        <TableCell className="text-right"><Badge variant="outline" className="text-yellow-500 bg-yellow-500/10 px-2 flex items-center gap-1 justify-center"><Clock className="w-3 h-3" /> Pending</Badge></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Agile Scrum</TableCell>
                                        <TableCell>Aug 05</TableCell>
                                        <TableCell className="text-right"><Badge variant="default" className="flex items-center gap-1 justify-center"><CheckCircle className="w-3 h-3" /> Approved</Badge></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Sales Conf 24</TableCell>
                                        <TableCell>May 22</TableCell>
                                        <TableCell className="text-right"><Badge variant="default" className="flex items-center gap-1 justify-center"><CheckCircle className="w-3 h-3" /> Approved</Badge></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Compliance Impact</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Annual Training Requirement</span>
                                <span className="font-medium">40 Hours</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Internal LMS Hours</span>
                                <span className="font-medium">15 Hours</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">External CPE Hours</span>
                                <span className="font-medium text-green-500">20 Hours</span>
                            </div>
                            <div className="pt-2 border-t border-border flex justify-between items-center font-bold">
                                <span>Remaining to Target</span>
                                <span>5 Hours</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
