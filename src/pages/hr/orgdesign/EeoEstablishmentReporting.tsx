import React, { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Building2, ShieldAlert } from "lucide-react";

export default function EeoEstablishmentReporting() {
    const [year, setYear] = useState("2026");
    const [establishment, setEstablishment] = useState("HQ");

    // Mock EEO-1 Matrix Data format (Simplified)
    const eeoMatrix = [
        { category: "1.1 Exec/Senior Officials", mWhite: 4, mBlack: 1, mHisp: 0, mAsian: 2, fWhite: 2, fBlack: 1, fHisp: 0, fAsian: 1, total: 11 },
        { category: "1.2 First/Mid Officials", mWhite: 12, mBlack: 3, mHisp: 2, mAsian: 5, fWhite: 10, fBlack: 4, fHisp: 1, fAsian: 4, total: 41 },
        { category: "2 Professionals", mWhite: 45, mBlack: 8, mHisp: 6, mAsian: 25, fWhite: 38, fBlack: 10, fHisp: 5, fAsian: 18, total: 155 },
        { category: "3 Technicians", mWhite: 15, mBlack: 4, mHisp: 3, mAsian: 8, fWhite: 8, fBlack: 2, fHisp: 1, fAsian: 4, total: 45 },
        { category: "5 Admin Support", mWhite: 5, mBlack: 2, mHisp: 4, mAsian: 1, fWhite: 20, fBlack: 8, fHisp: 5, fAsian: 2, total: 47 }
    ];

    const renderData = (val: number) => {
        return (
            <span className={val === 0 ? "text-muted-foreground/30 font-normal" : "font-semibold"}>
                {val}
            </span>
        );
    };

    return (
        <StandardPage title="EEO-1 Compliance Reporting">
            <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">Generate the standardized federal EEO-1 demographic matrix for required establishments.</p>
                <div className="flex gap-3">
                    <Select value={establishment} onValueChange={setEstablishment}>
                        <SelectTrigger className="w-[180px] bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="HQ">San Francisco HQ</SelectItem>
                            <SelectItem value="NY">New York Office</SelectItem>
                            <SelectItem value="AUST">Austin Hub</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={year} onValueChange={setYear}>
                        <SelectTrigger className="w-[100px] bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2026">2026</SelectItem>
                            <SelectItem value="2025">2025</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button className="gap-2"><Download className="h-4 w-4" /> EEO-1 CSV Export</Button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
                <Card className="border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Included Headcount</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">299</div>
                        <p className="text-xs text-muted-foreground mt-1">Active W-2 employees at {establishment}</p>
                    </CardContent>
                </Card>
                <Card className="border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Missing Demographic Data</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-600">3</div>
                        <p className="text-xs text-amber-600/80 mt-1">Employees missing self-ID forms</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Employer Information Report EEO-1 Matrix</CardTitle>
                    <CardDescription>Consolidated federal reporting matrix (Section D: Employment Data).</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <Table className="whitespace-nowrap text-center text-xs">
                            <TableHeader>
                                <TableRow className="bg-muted/30">
                                    <TableHead rowSpan={2} className="border-r font-bold align-middle text-left min-w-[200px]">Job Categories</TableHead>
                                    <TableHead colSpan={4} className="border-r border-b text-center border-l-0 text-blue-800 bg-blue-50/50">Male</TableHead>
                                    <TableHead colSpan={4} className="border-r border-b text-center text-purple-800 bg-purple-50/50">Female</TableHead>
                                    <TableHead rowSpan={2} className="align-middle font-bold text-center min-w-[80px]">Total</TableHead>
                                </TableRow>
                                <TableRow className="bg-muted/30">
                                    {/* Male Headers */}
                                    <TableHead className="text-center font-normal px-2 bg-blue-50/20">White</TableHead>
                                    <TableHead className="text-center font-normal px-2 bg-blue-50/20">Black</TableHead>
                                    <TableHead className="text-center font-normal px-2 bg-blue-50/20">Hispanic</TableHead>
                                    <TableHead className="text-center font-normal px-2 border-r bg-blue-50/20">Asian</TableHead>

                                    {/* Female Headers */}
                                    <TableHead className="text-center font-normal px-2 bg-purple-50/20">White</TableHead>
                                    <TableHead className="text-center font-normal px-2 bg-purple-50/20">Black</TableHead>
                                    <TableHead className="text-center font-normal px-2 bg-purple-50/20">Hispanic</TableHead>
                                    <TableHead className="text-center font-normal px-2 border-r bg-purple-50/20">Asian</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {eeoMatrix.map((row, idx) => (
                                    <TableRow key={idx} className="hover:bg-muted/20 align-middle">
                                        <TableCell className="text-left font-medium border-r">{row.category}</TableCell>

                                        <TableCell>{renderData(row.mWhite)}</TableCell>
                                        <TableCell>{renderData(row.mBlack)}</TableCell>
                                        <TableCell>{renderData(row.mHisp)}</TableCell>
                                        <TableCell className="border-r bg-muted/10">{renderData(row.mAsian)}</TableCell>

                                        <TableCell>{renderData(row.fWhite)}</TableCell>
                                        <TableCell>{renderData(row.fBlack)}</TableCell>
                                        <TableCell>{renderData(row.fHisp)}</TableCell>
                                        <TableCell className="border-r bg-muted/10">{renderData(row.fAsian)}</TableCell>

                                        <TableCell className="font-bold bg-muted/30">{row.total}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="mt-4 flex gap-2">
                        <Badge variant="outline" className="text-[10px] text-muted-foreground border-dashed font-normal">Auto-Mapped from Core HR Demographics</Badge>
                        <Badge variant="outline" className="text-[10px] text-muted-foreground border-dashed font-normal">Excludes Non-Binary (Per EEO-1 Instructions)</Badge>
                    </div>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
