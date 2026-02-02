import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Check, Archive, Eye } from 'lucide-react';
import { format } from 'date-fns';

export default function ScenarioManager() {
    // Mock Data
    const [scenarios] = useState([
        { id: '1', name: '2026 Standard Costs', type: 'Current', date: new Date('2026-01-01'), org: 'US Ops' },
        { id: '2', name: '2026 Q2 Proposed', type: 'Pending', date: new Date(), org: 'US Ops' },
        { id: '3', name: '2025 Historical', type: 'Historical', date: new Date('2025-01-01'), org: 'US Ops' },
    ]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Scenario Manager</h1>
                    <p className="text-muted-foreground">Define and publish standard costs for inventory valuation.</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create Scenario
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Cost Scenarios</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Scenario Name</TableHead>
                                <TableHead>Organization</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Effective Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {scenarios.map((scenario) => (
                                <TableRow key={scenario.id}>
                                    <TableCell className="font-medium">{scenario.name}</TableCell>
                                    <TableCell>{scenario.org}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            scenario.type === 'Current' ? 'default' :
                                                scenario.type === 'Pending' ? 'secondary' : 'outline'
                                        }>
                                            {scenario.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{format(scenario.date, 'MMM dd, yyyy')}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="sm">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        {scenario.type === 'Pending' && (
                                            <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50">
                                                <Check className="mr-1 h-3 w-3" /> Publish
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
