import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Shield, Wrench, Search, Filter, Plus, UserCheck, Star } from "lucide-react";

interface Technician {
    id: string;
    name: string;
    level: "Junior" | "Senior" | "Master";
    skills: string[];
    zones: string[];
    certification: string;
    utilization: number;
}

export default function TechnicianSkillsZones() {

    const technicians: Technician[] = [
        { id: "TECH-01", name: "Marcus Johnson", level: "Master", skills: ["HVAC", "Electrical Level 3", "Industrial Chillers"], zones: ["Downtown Core", "North Suburbs"], certification: "Valid until Nov 2027", utilization: 92 },
        { id: "TECH-02", name: "Alisha Patel", level: "Senior", skills: ["Plumbing", "HVAC"], zones: ["East District", "Downtown Core"], certification: "Valid until Mar 2026", utilization: 85 },
        { id: "TECH-03", name: "David Chen", level: "Junior", skills: ["General Maintenance", "Appliance Repair"], zones: ["West District", "South Suburbs"], certification: "Valid until Jan 2028", utilization: 68 },
        { id: "TECH-04", name: "Sarah Connor", level: "Master", skills: ["Cybernetics", "Heavy Machinery", "Electrical Level 3"], zones: ["Industrial Park", "West District"], certification: "Valid until Dec 2029", utilization: 98 },
    ];

    const getUtilizationColor = (utilization: number) => {
        if (utilization > 90) return "text-red-600 bg-red-100";
        if (utilization < 70) return "text-amber-600 bg-amber-100";
        return "text-emerald-600 bg-emerald-100";
    };

    return (
        <StandardPage
            title="Technician Skills & Zones"
            description="Manage field service workforce capabilities, certifications, and geographic territories."
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "Field Service", href: "/crm/field-service" },
                { label: "Skills & Zones" }
            ]}
            actions={
                <Button>
                    <Plus className="h-4 w-4 mr-2" /> Add/Invite Technician
                </Button>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Total Technicians</p>
                        <p className="text-3xl font-black text-slate-800">42</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Master Level</p>
                        <p className="text-3xl font-black text-slate-800">12</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-emerald-500">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Active Certifications</p>
                        <p className="text-3xl font-black text-slate-800">100%</p>
                        <p className="text-xs text-muted-foreground mt-1">0 expiring within 30 days</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-amber-500">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Avg Utilization</p>
                        <p className="text-3xl font-black text-amber-600">86.5%</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border shadow-sm">
                <CardHeader className="pb-4 border-b">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <UserCheck className="h-5 w-5 text-primary" /> Workforce Roster
                            </CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search technicians, skills..." className="pl-9 h-9" />
                            </div>
                            <Button variant="outline" size="sm" className="h-9">
                                <Filter className="h-4 w-4 mr-2" /> Filter
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead>Technician</TableHead>
                            <TableHead className="w-[300px]">Certified Skills</TableHead>
                            <TableHead>Service Zones</TableHead>
                            <TableHead>Compliance</TableHead>
                            <TableHead className="text-right">Weekly Utilization</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {technicians.map(tech => (
                            <TableRow key={tech.id} className="hover:bg-muted/30">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                {tech.name.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-bold text-slate-800 flex items-center gap-1">
                                                {tech.name}
                                                {tech.level === "Master" && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
                                                {tech.level === "Senior" && <Star className="h-3 w-3 text-slate-400 fill-slate-400" />}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{tech.id} • {tech.level}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {tech.skills.map((skill, i) => (
                                            <Badge key={i} variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] py-0">
                                                <Wrench className="h-2 w-2 mr-1" />{skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {tech.zones.map((zone, i) => (
                                            <Badge key={i} variant="outline" className="text-slate-600 border-slate-200 text-[10px] py-0">
                                                <MapPin className="h-2 w-2 mr-1" />{zone}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                                        <Shield className="h-3.5 w-3.5" />
                                        {tech.certification}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Badge className={`${getUtilizationColor(tech.utilization)} border-none shadow-none`}>
                                        {tech.utilization}%
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </StandardPage>
    );
}
