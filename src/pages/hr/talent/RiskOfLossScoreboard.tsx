import React from 'react';
import { StandardPage } from '@/components/layout/StandardPage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calculator, AlertTriangle, TrendingDown } from 'lucide-react';

export default function RiskOfLossScoreboard() {
    const { toast } = useToast();

    const handleCalculate = () => {
        toast({
            title: "Analysis Running",
            description: "Calculating attrition risk scores based on tenure, engagement, and compensation ratios."
        });
    };

    return (
        <StandardPage
            title="Risk & Impact of Loss"
            description="Predictive analytics combining employee flight risk probability with the business impact if they depart."
            actions={
                <Button onClick={handleCalculate} variant="secondary">
                    <Calculator className="mr-2 h-4 w-4" /> Run Risk Matrix
                </Button>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <Card className="bg-destructive text-destructive-foreground">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Critical Flight Risks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">14</div>
                        <p className="text-xs mt-1 opacity-80">High Risk & High Impact</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">High Risk</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">82</div>
                        <p className="text-xs text-muted-foreground mt-1">Total High Risk Workers</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">High Impact</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">45</div>
                        <p className="text-xs text-muted-foreground mt-1">Key position holders</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Avg Attrition Cost</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">$112K</div>
                        <p className="text-xs text-muted-foreground mt-1">Estimated per high-impact loss</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Critical Risk Roster</CardTitle>
                    <CardDescription>Workers flagged by the prediction engine with high loss probability and high business impact</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Risk of Loss</TableHead>
                                <TableHead>Impact of Loss</TableHead>
                                <TableHead>Primary Risk Factor</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">Sarah Lee (1044)</TableCell>
                                <TableCell>Chief Operating Officer</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="destructive">High (85%)</Badge>
                                        <TrendingDown className="h-4 w-4 text-destructive" />
                                    </div>
                                </TableCell>
                                <TableCell><Badge variant="default" className="bg-purple-600 hover:bg-purple-700">Critical</Badge></TableCell>
                                <TableCell className="text-sm text-muted-foreground">Compensation <Badge variant="outline" className="text-xs ml-1 bg-yellow-500/10 text-yellow-600 border-0">CompaRatio 0.81</Badge></TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">Review →</Button>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">David Chen (2199)</TableCell>
                                <TableCell>VP, Data Science</TableCell>
                                <TableCell>
                                    <Badge variant="destructive">High (78%)</Badge>
                                </TableCell>
                                <TableCell><Badge variant="default" className="bg-purple-600 hover:bg-purple-700">Critical</Badge></TableCell>
                                <TableCell className="text-sm text-muted-foreground">Tenure <Badge variant="outline" className="text-xs ml-1">5+ Yrs in Role</Badge></TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">Review →</Button>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Amanda Foster (3012)</TableCell>
                                <TableCell>Lead Architect</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-yellow-600 border-yellow-500/30">Medium (55%)</Badge>
                                </TableCell>
                                <TableCell><Badge variant="default" className="bg-red-500 hover:bg-red-600">High</Badge></TableCell>
                                <TableCell className="text-sm text-muted-foreground">Manager Delta <Badge variant="outline" className="text-xs ml-1">New Manager</Badge></TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">Review →</Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
