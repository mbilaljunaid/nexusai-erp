import React from 'react';
import { StandardPage } from '@/components/layout/StandardPage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PerformanceToCompIntegration() {
    const { toast } = useToast();

    const handleSync = () => {
        toast({
            title: "Sync Initiated",
            description: "Performance ratings are being transferred to the active Merit Plan."
        });
    };

    return (
        <StandardPage
            title="Performance to Compensation Sync"
            description="Extract final performance ratings from HR evaluations to seed the compensation workbench merit matrix."
            actions={
                <Button onClick={handleSync}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Run Integration Sync
                </Button>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Transfer Configuration</CardTitle>
                            <CardDescription>Setup rules for converting a performance rating to a compensation allocation guideline</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm font-medium mb-1">Source Performance Period</div>
                                    <Select defaultValue="fy26">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="fy26">FY26 Annual Evaluation</SelectItem>
                                            <SelectItem value="fy25">FY25 Annual Evaluation</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <div className="text-sm font-medium mb-1">Target Compensation Plan</div>
                                    <Select defaultValue="merit">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="merit">FY26 Annual Merit Cycle</SelectItem>
                                            <SelectItem value="bonus">FY26 Target Bonus Cycle</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium mb-2 border-b border-border pb-1">Rating to Matrix Mapping</h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Performance Rating (Scale 1-5)</TableHead>
                                            <TableHead className="text-center">Link</TableHead>
                                            <TableHead>Merit Guideline Segment</TableHead>
                                            <TableHead>Target Pool Allocation Range</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>5 - Outstanding</TableCell>
                                            <TableCell className="text-center"><ArrowRight className="h-4 w-4 inline text-muted-foreground" /></TableCell>
                                            <TableCell><Badge variant="default" className="bg-green-600">Top Tier Allocation</Badge></TableCell>
                                            <TableCell>8% - 12% Base Increase</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>4 - Exceeds Expectations</TableCell>
                                            <TableCell className="text-center"><ArrowRight className="h-4 w-4 inline text-muted-foreground" /></TableCell>
                                            <TableCell><Badge variant="outline">High Allocation</Badge></TableCell>
                                            <TableCell>4% - 7% Base Increase</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>3 - Meets Expectations</TableCell>
                                            <TableCell className="text-center"><ArrowRight className="h-4 w-4 inline text-muted-foreground" /></TableCell>
                                            <TableCell><Badge variant="outline">Standard Allocation</Badge></TableCell>
                                            <TableCell>1% - 3% Base Increase</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>1 or 2 - Needs Improvement</TableCell>
                                            <TableCell className="text-center"><ArrowRight className="h-4 w-4 inline text-muted-foreground" /></TableCell>
                                            <TableCell><Badge variant="destructive">Zero Allocation</Badge></TableCell>
                                            <TableCell>0% Increase Eligible</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Sync Logs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-background">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        <div>
                                            <div className="font-medium">FY26 Sync Job #1042</div>
                                            <div className="text-xs text-muted-foreground">Transferred 4,502 ratings. 0 errors.</div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground">Today 09:00 AM</div>
                                </div>
                                <div className="flex items-center justify-between p-3 border border-destructive/20 rounded-lg bg-destructive/5">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="h-5 w-5 text-destructive" />
                                        <div>
                                            <div className="font-medium text-destructive">FY26 Sync Job #1041</div>
                                            <div className="text-xs text-muted-foreground">Transferred 4,490 ratings. 12 parsing errors (Missing Employee).</div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground">Yesterday 04:30 PM</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Integration Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 rounded-lg bg-muted text-center space-y-2 border border-border">
                                <span className="text-sm font-medium block">Records Pending Transfer</span>
                                <span className="text-3xl font-bold">128</span>
                                <div className="text-xs text-muted-foreground">Documents recently closed requiring sync</div>
                            </div>

                            <div className="space-y-2">
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Overall Data Integrity:</span> <span className="font-bold text-green-500 float-right">99.8%</span>
                                </div>
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Eligibility Filtering:</span> <span className="font-bold float-right">Active</span>
                                </div>
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Last Auto-Sync:</span> <span className="font-bold float-right">Today 09:00 AM</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
