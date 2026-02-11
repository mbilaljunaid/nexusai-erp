import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    Filter,
    Download,
    Eye,
    MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Clash {
    id: string;
    clashNumber: string;
    status: "ACTIVE" | "RESOLVED" | "APPROVED";
    severity: "CRITICAL" | "MAJOR" | "MINOR";
    discipline1: string;
    discipline2: string;
    location: string;
    description: string;
    detectedDate: string;
    assignedTo?: string;
    resolvedDate?: string;
    distance: number; // Distance between clashing elements in mm
}

interface ClashDetectionPanelProps {
    projectId: string;
    onViewClash?: (clash: Clash) => void;
}

export function ClashDetectionPanel({ projectId, onViewClash }: ClashDetectionPanelProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [severityFilter, setSeverityFilter] = useState<string>("all");

    // Mock clash data - in production, fetch from Navisworks/BIM360 API
    const clashes: Clash[] = [
        {
            id: "clash-001",
            clashNumber: "CLH-2026-001",
            status: "ACTIVE",
            severity: "CRITICAL",
            discipline1: "Structure",
            discipline2: "MEP",
            location: "Level 3 - Grid B4",
            description: "Structural beam conflicts with HVAC duct",
            detectedDate: "2026-02-10",
            assignedTo: "John Martinez",
            distance: 45
        },
        {
            id: "clash-002",
            clashNumber: "CLH-2026-002",
            status: "ACTIVE",
            severity: "MAJOR",
            discipline1: "Architecture",
            discipline2: "MEP",
            location: "Level 2 - Grid C3",
            description: "Wall penetration needed for electrical conduit",
            detectedDate: "2026-02-09",
            assignedTo: "Sarah Chen",
            distance: 120
        },
        {
            id: "clash-003",
            clashNumber: "CLH-2026-003",
            status: "RESOLVED",
            severity: "CRITICAL",
            discipline1: "Structure",
            discipline2: "Architecture",
            location: "Level 1 - Grid A2",
            description: "Column placement conflicts with door opening",
            detectedDate: "2026-02-05",
            assignedTo: "Mike Johnson",
            resolvedDate: "2026-02-08",
            distance: 200
        },
        {
            id: "clash-004",
            clashNumber: "CLH-2026-004",
            status: "APPROVED",
            severity: "MINOR",
            discipline1: "MEP",
            discipline2: "MEP",
            location: "Level 4 - Grid D5",
            description: "Fire suppression pipe clearance issue",
            detectedDate: "2026-02-07",
            assignedTo: "Sarah Chen",
            resolvedDate: "2026-02-09",
            distance: 25
        }
    ];

    const statusConfig = {
        ACTIVE: { color: "bg-red-100 text-red-800 border-red-300", label: "Active", icon: AlertTriangle },
        RESOLVED: { color: "bg-yellow-100 text-yellow-800 border-yellow-300", label: "Resolved", icon: Clock },
        APPROVED: { color: "bg-green-100 text-green-800 border-green-300", label: "Approved", icon: CheckCircle2 }
    };

    const severityConfig = {
        CRITICAL: { color: "text-red-600", label: "Critical", icon: XCircle },
        MAJOR: { color: "text-orange-600", label: "Major", icon: AlertTriangle },
        MINOR: { color: "text-yellow-600", label: "Minor", icon: AlertTriangle }
    };

    const filteredClashes = clashes.filter(clash => {
        const matchesSearch = clash.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            clash.clashNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            clash.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || clash.status === statusFilter;
        const matchesSeverity = severityFilter === "all" || clash.severity === severityFilter;
        return matchesSearch && matchesStatus && matchesSeverity;
    });

    const stats = {
        total: clashes.length,
        active: clashes.filter(c => c.status === "ACTIVE").length,
        critical: clashes.filter(c => c.severity === "CRITICAL" && c.status === "ACTIVE").length
    };

    return (
        <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold">{stats.total}</div>
                            <div className="text-sm text-muted-foreground mt-1">Total Clashes</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-red-600">{stats.active}</div>
                            <div className="text-sm text-muted-foreground mt-1">Active</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-orange-600">{stats.critical}</div>
                            <div className="text-sm text-muted-foreground mt-1">Critical</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Search */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search clashes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="RESOLVED">Resolved</SelectItem>
                                <SelectItem value="APPROVED">Approved</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={severityFilter} onValueChange={setSeverityFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Severity" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Severity</SelectItem>
                                <SelectItem value="CRITICAL">Critical</SelectItem>
                                <SelectItem value="MAJOR">Major</SelectItem>
                                <SelectItem value="MINOR">Minor</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Clash List */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                            Clash Detection Results ({filteredClashes.length})
                        </CardTitle>
                        <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Export Report
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {filteredClashes.map(clash => {
                            const statusCfg = statusConfig[clash.status];
                            const severityCfg = severityConfig[clash.severity];
                            const StatusIcon = statusCfg.icon;
                            const SeverityIcon = severityCfg.icon;

                            return (
                                <div
                                    key={clash.id}
                                    className="border-2 rounded-lg p-4 hover:border-primary/50 transition-colors"
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-mono font-bold text-sm">{clash.clashNumber}</span>
                                                <Badge variant="outline" className={statusCfg.color}>
                                                    <StatusIcon className="h-3 w-3 mr-1" />
                                                    {statusCfg.label}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <SeverityIcon className={cn("h-4 w-4", severityCfg.color)} />
                                                <span className={severityCfg.color}>{severityCfg.label}</span>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onViewClash?.(clash)}
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            View in 3D
                                        </Button>
                                    </div>

                                    {/* Description */}
                                    <div className="mb-3">
                                        <div className="font-medium mb-1">{clash.description}</div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="h-3 w-3" />
                                            {clash.location}
                                        </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                        <div>
                                            <div className="text-xs text-muted-foreground mb-1">Discipline 1</div>
                                            <div className="font-medium">{clash.discipline1}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground mb-1">Discipline 2</div>
                                            <div className="font-medium">{clash.discipline2}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground mb-1">Clearance</div>
                                            <div className="font-medium text-red-600">{clash.distance} mm</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground mb-1">Assigned To</div>
                                            <div className="font-medium">{clash.assignedTo || "-"}</div>
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <div className="mt-3 pt-3 border-t flex items-center gap-4 text-xs text-muted-foreground">
                                        <span>Detected: {clash.detectedDate}</span>
                                        {clash.resolvedDate && (
                                            <span>Resolved: {clash.resolvedDate}</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {filteredClashes.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>No clashes found matching your filters.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
