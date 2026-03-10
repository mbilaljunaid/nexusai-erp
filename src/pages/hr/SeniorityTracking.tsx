import React, { useState } from 'react';
import { StandardPage } from '@/components/layout/StandardPage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calculator, Calendar, History, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SeniorityTracking() {
    const { toast } = useToast();
    const [personNumber, setPersonNumber] = useState('');

    const handleCalculate = () => {
        toast({
            title: "Seniority Calculated",
            description: "Successfully re-calculated length of service based on Oracle rules."
        });
    };

    return (
        <StandardPage
            title="Seniority & Length of Service"
            description="Manage and calculate worker seniority dates based on enterprise rules and breaks in service."
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Worker Search</CardTitle>
                            <CardDescription>Select worker to view seniority</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Person Number or Name</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="e.g. 10045"
                                        value={personNumber}
                                        onChange={(e) => setPersonNumber(e.target.value)}
                                    />
                                    <Button variant="secondary" size="icon">
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Length of Service Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-border">
                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> Enterprise Hire Date
                                </span>
                                <span className="font-medium">Jan 15, 2018</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-border">
                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> Legal Employer Hire
                                </span>
                                <span className="font-medium">Jan 15, 2018</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-border">
                                <span className="text-sm text-muted-foreground">Adjusted Service Date</span>
                                <span className="font-medium">Mar 01, 2018</span>
                            </div>
                            <div className="pt-4">
                                <div className="text-2xl font-bold text-primary">6 Years, 2 Months</div>
                                <div className="text-xs text-muted-foreground">Total Active Service Target</div>
                            </div>
                            <Button onClick={handleCalculate} className="w-full mt-4">
                                <Calculator className="mr-2 h-4 w-4" /> Recalculate Seniority
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Seniority Rules Override</CardTitle>
                                <CardDescription>Configure calculation rules for specific union or geography requirements</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Calculation Rule</Label>
                                    <Select defaultValue="standard">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="standard">Standard (Days)</SelectItem>
                                            <SelectItem value="hours">Hours Worked (Union)</SelectItem>
                                            <SelectItem value="months">Full Months Only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Break in Service Rule</Label>
                                    <Select defaultValue="deduct">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="deduct">Deduct Break Duration</SelectItem>
                                            <SelectItem value="reset">Reset to Zero (&gt; 1 Year)</SelectItem>
                                            <SelectItem value="ignore">Ignore Breaks</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Service History &amp; Adjustments</CardTitle>
                            <CardDescription>Periods of service impacting the total seniority calculation</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Event</TableHead>
                                        <TableHead>Start Date</TableHead>
                                        <TableHead>End Date</TableHead>
                                        <TableHead>Action / Impact</TableHead>
                                        <TableHead className="text-right">Adjusted Days</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">New Hire</TableCell>
                                        <TableCell>Jan 15, 2018</TableCell>
                                        <TableCell>Feb 15, 2021</TableCell>
                                        <TableCell><Badge variant="default">Active Service</Badge></TableCell>
                                        <TableCell className="text-right text-muted-foreground">+1127</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Unpaid Leave</TableCell>
                                        <TableCell>Feb 16, 2021</TableCell>
                                        <TableCell>Mar 31, 2021</TableCell>
                                        <TableCell><Badge variant="destructive">Service Break</Badge></TableCell>
                                        <TableCell className="text-right text-destructive">-44</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Return to Work</TableCell>
                                        <TableCell>Apr 01, 2021</TableCell>
                                        <TableCell>Present</TableCell>
                                        <TableCell><Badge variant="default">Active Service</Badge></TableCell>
                                        <TableCell className="text-right text-muted-foreground">+1075</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
