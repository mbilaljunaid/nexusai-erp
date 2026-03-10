import React, { useState } from 'react';
import { StandardPage } from '@/components/layout/StandardPage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface GradeBand {
    grade: string;
    minSalary: number;
    midSalary: number;
    maxSalary: number;
    currency: string;
}

interface EmployeeCompaRatio {
    name: string;
    title: string;
    grade: string;
    salary: number;
    ratio: number; // CompaRatio = (salary / mid) * 100
}

const GRADE_BANDS: GradeBand[] = [
    { grade: 'IC3', minSalary: 80000, midSalary: 100000, maxSalary: 130000, currency: 'USD' },
    { grade: 'IC4', minSalary: 110000, midSalary: 135000, maxSalary: 165000, currency: 'USD' },
    { grade: 'IC5', minSalary: 145000, midSalary: 175000, maxSalary: 210000, currency: 'USD' },
    { grade: 'M1', minSalary: 150000, midSalary: 185000, maxSalary: 225000, currency: 'USD' },
    { grade: 'M2', minSalary: 180000, midSalary: 220000, maxSalary: 270000, currency: 'USD' },
    { grade: 'DIR', minSalary: 210000, midSalary: 260000, maxSalary: 320000, currency: 'USD' },
];

const EMPLOYEES: EmployeeCompaRatio[] = [
    { name: 'Jordan Mitchell', title: 'Sr. Software Engineer', grade: 'IC5', salary: 160000, ratio: (160000 / 175000) * 100 },
    { name: 'Alice Chen', title: 'Principal Engineer', grade: 'IC5', salary: 215000, ratio: (215000 / 175000) * 100 },
    { name: 'Bob Patel', title: 'Engineering Manager', grade: 'M1', salary: 182000, ratio: (182000 / 185000) * 100 },
    { name: 'Carla Ruiz', title: 'Product Manager II', grade: 'IC4', salary: 105000, ratio: (105000 / 135000) * 100 },
    { name: 'David Kim', title: 'Director, Engineering', grade: 'DIR', salary: 265000, ratio: (265000 / 260000) * 100 },
];

const fmt = (n: number, currency = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);

const CompaStatus = ({ ratio }: { ratio: number }) => {
    if (ratio < 80) return <div className="flex items-center gap-1 text-destructive text-sm"><AlertTriangle className="h-4 w-4" />Below Range ({ratio.toFixed(0)}%)</div>;
    if (ratio > 120) return <div className="flex items-center gap-1 text-yellow-500 text-sm"><AlertTriangle className="h-4 w-4" />Above Range ({ratio.toFixed(0)}%)</div>;
    return <div className="flex items-center gap-1 text-green-500 text-sm"><CheckCircle className="h-4 w-4" />In Range ({ratio.toFixed(0)}%)</div>;
};

export default function SalaryRangeCompaRatio() {
    const { toast } = useToast();
    const [view, setView] = useState<'bands' | 'employees'>('bands');

    const belowRange = EMPLOYEES.filter((e) => e.ratio < 80).length;
    const aboveRange = EMPLOYEES.filter((e) => e.ratio > 120).length;
    const inRange = EMPLOYEES.filter((e) => e.ratio >= 80 && e.ratio <= 120).length;

    return (
        <StandardPage
            title="Salary Ranges & CompaRatio"
            description="Grade-to-salary-band mapping. CompaRatio = (Employee Salary ÷ Band Midpoint) × 100. Identifies compression, overpayment, and market gaps."
            actions={
                <Button variant="secondary" onClick={() => toast({ title: 'Export Started', description: 'CompaRatio report exported to CSV.' })}>
                    <TrendingUp className="mr-2 h-4 w-4" /> Export Report
                </Button>
            }
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-green-500/30">
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold text-green-500">{inRange}</div>
                            <div className="text-sm text-muted-foreground mt-1">Employees In Range (80–120%)</div>
                        </CardContent>
                    </Card>
                    <Card className="border-destructive/30">
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold text-destructive">{belowRange}</div>
                            <div className="text-sm text-muted-foreground mt-1">Below Range (&lt;80%) — At Risk</div>
                        </CardContent>
                    </Card>
                    <Card className="border-yellow-500/30">
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold text-yellow-500">{aboveRange}</div>
                            <div className="text-sm text-muted-foreground mt-1">Above Range (&gt;120%) — Review</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Toggle */}
                <div className="flex gap-2">
                    <Button variant={view === 'bands' ? 'default' : 'outline'} onClick={() => setView('bands')}>Grade Bands</Button>
                    <Button variant={view === 'employees' ? 'default' : 'outline'} onClick={() => setView('employees')}>Employee CompaRatio</Button>
                </div>

                {/* Grade Bands Table */}
                {view === 'bands' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Grade Salary Bands</CardTitle>
                            <CardDescription>Minimum, Midpoint, and Maximum salary ranges per grade code</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Grade</TableHead>
                                        <TableHead>Minimum</TableHead>
                                        <TableHead>Midpoint</TableHead>
                                        <TableHead>Maximum</TableHead>
                                        <TableHead>Spread %</TableHead>
                                        <TableHead>Currency</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {GRADE_BANDS.map((band) => {
                                        const spread = ((band.maxSalary - band.minSalary) / band.midSalary * 100).toFixed(0);
                                        return (
                                            <TableRow key={band.grade}>
                                                <TableCell className="font-bold">{band.grade}</TableCell>
                                                <TableCell className="text-destructive/80">{fmt(band.minSalary)}</TableCell>
                                                <TableCell className="font-semibold text-primary">{fmt(band.midSalary)}</TableCell>
                                                <TableCell className="text-yellow-600">{fmt(band.maxSalary)}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{spread}%</Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{band.currency}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Employee CompaRatio Table */}
                {view === 'employees' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Employee CompaRatio Analysis</CardTitle>
                            <CardDescription>CompaRatio = (Actual Salary ÷ Band Midpoint) × 100. Green = 80–120%, Red = &lt;80%, Yellow = &gt;120%</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Grade</TableHead>
                                        <TableHead>Salary</TableHead>
                                        <TableHead>Band Midpoint</TableHead>
                                        <TableHead>CompaRatio</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {EMPLOYEES.map((emp) => {
                                        const band = GRADE_BANDS.find((b) => b.grade === emp.grade);
                                        return (
                                            <TableRow key={emp.name}>
                                                <TableCell className="font-medium">{emp.name}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{emp.title}</TableCell>
                                                <TableCell><Badge variant="outline">{emp.grade}</Badge></TableCell>
                                                <TableCell>{fmt(emp.salary)}</TableCell>
                                                <TableCell className="text-muted-foreground">{band ? fmt(band.midSalary) : '—'}</TableCell>
                                                <TableCell><CompaStatus ratio={emp.ratio} /></TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </StandardPage>
    );
}
