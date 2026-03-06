import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Clock,
    Calendar,
    ArrowRight,
    Briefcase,
    MapPin,
    Building2,
    User,
    ChevronDown,
    ChevronRight,
    Tag
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StandardPage } from '@/components/layout/StandardPage';
import { i18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useEnterpriseStore } from '@/lib/enterpriseStore';
import { format } from 'date-fns';

// Mock Oracle-style Action & Reason history for Effective Dating
const MOCK_ASSIGNMENT_HISTORY = [
    {
        id: 'hist_3',
        effectiveStartDate: '2025-01-01',
        effectiveEndDate: '4712-12-31', // Oracle standard EOT (End of Time)
        actionCode: 'PROMOTION',
        actionReasonCode: 'MERIT',
        jobCode: 'DIR-ENG-02',
        jobTitle: 'Senior Director, Engineering',
        department: 'Engineering (Platform)',
        location: 'New York HQ',
        manager: 'Sarah Chen (VP)',
        fte: 1.0,
        workingHours: 40,
        status: 'Active',
        contractType: 'Permanent',
        probationEndDate: null,
        sysCreationDate: '2024-12-15T14:30:00Z',
    },
    {
        id: 'hist_2',
        effectiveStartDate: '2023-06-15',
        effectiveEndDate: '2024-12-31', // End-dated due to promotion
        actionCode: 'TRANSFER',
        actionReasonCode: 'REORG',
        jobCode: 'DIR-ENG-01',
        jobTitle: 'Director, Engineering',
        department: 'Engineering (Platform)',
        location: 'New York HQ',
        manager: 'David Park (VP)',
        fte: 1.0,
        workingHours: 40,
        status: 'Active',
        contractType: 'Permanent',
        probationEndDate: null,
        sysCreationDate: '2023-06-01T09:15:00Z',
    },
    {
        id: 'hist_1',
        effectiveStartDate: '2021-03-01',
        effectiveEndDate: '2023-06-14',
        actionCode: 'HIRE',
        actionReasonCode: 'NEW_HIRE',
        jobCode: 'MGR-ENG-03',
        jobTitle: 'Engineering Manager',
        department: 'Core Infrastructure',
        location: 'San Francisco',
        manager: 'Elena Rostova (Director)',
        fte: 1.0,
        workingHours: 40,
        status: 'Active',
        contractType: 'Fixed-Term (6 Months)',
        probationEndDate: '2021-06-01',
        sysCreationDate: '2021-02-15T11:00:00Z',
    }
];

const ACTION_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    'HIRE': 'default',
    'PROMOTION': 'default',
    'TRANSFER': 'secondary',
    'TERMINATION': 'destructive',
    'DATA_CORRECTION': 'outline'
};

export default function AssignmentHistory() {
    const { legalEntityId } = useEnterpriseStore();
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['hist_3'])); // Expand the current one initially

    // In a real app this would use the global router context to fetch for a specific employee
    const { data: history = MOCK_ASSIGNMENT_HISTORY, isLoading } = useQuery<any>({
        queryKey: ['/api/hr-self-service/me/assignment-history', legalEntityId],
        queryFn: async () => {
            // Simulate network latency
            await new Promise(r => setTimeout(r, 600));
            return MOCK_ASSIGNMENT_HISTORY;
        }
    });

    const toggleExpand = (id: string) => {
        const next = new Set(expandedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedIds(next);
    };

    const isCurrent = (endDate: string) => {
        return endDate.startsWith('4712') || new Date(endDate) > new Date();
    };

    return (
        <StandardPage
            title="Employment History"
            description="View assignment changes tracked via Effective Dating (Action/Reason)."
            breadcrumbs={[
                { label: 'Self-Service', href: '/hr/self-service/me' },
                { label: 'Employment History' }
            ]}
        >
            <div className="max-w-4xl mx-auto space-y-6">

                <Card className="border-t-4 border-t-primary">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            DateTrack History timeline
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="py-12 flex justify-center text-muted-foreground">
                                Loading assignment history...
                            </div>
                        ) : (
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                                {history.map((record, idx) => {
                                    const expanded = expandedIds.has(record.id);
                                    const current = isCurrent(record.effectiveEndDate);

                                    return (
                                        <div key={record.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            {/* Timeline dot */}
                                            <div className={cn(
                                                "flex items-center justify-center w-10 h-10 rounded-full border-4 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10",
                                                current ? "bg-primary text-primary-foreground border-primary/20" : "bg-background border-border text-muted-foreground"
                                            )}>
                                                <Calendar className="h-4 w-4" />
                                            </div>

                                            {/* Card payload */}
                                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)]">
                                                <div role="button" tabIndex={0}
                                                    onClick={() => toggleExpand(record.id)}
                                                    className={cn(
                                                        "p-4 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow cursor-pointer",
                                                        current && "border-primary/50 shadow-primary/5"
                                                    )} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-semibold text-sm">
                                                                    {format(new Date(record.effectiveStartDate), "MMM d, yyyy")}
                                                                </span>
                                                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                                <span className={cn("text-sm", current ? "font-bold text-primary" : "text-muted-foreground")}>
                                                                    {current ? "Present" : format(new Date(record.effectiveEndDate), "MMM d, yyyy")}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <Badge variant={ACTION_COLORS[record.actionCode] || 'default'}>
                                                                    {record.actionCode}
                                                                </Badge>
                                                                <span className="text-xs text-muted-foreground border-l pl-2 border-border">
                                                                    Reason: {record.actionReasonCode}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="h-6 w-6 rounded-full bg-secondary/50 flex items-center justify-center">
                                                            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                        </div>
                                                    </div>

                                                    {/* Expanded snapshot details */}
                                                    {expanded && (
                                                        <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs">

                                                            <div className="flex items-start gap-2">
                                                                <Briefcase className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                                                                <div>
                                                                    <div className="font-medium text-foreground">{record.jobTitle}</div>
                                                                    <div className="text-muted-foreground">{record.jobCode}</div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-start gap-2">
                                                                <Building2 className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                                                                <div>
                                                                    <div className="font-medium text-foreground">{record.department}</div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-start gap-2">
                                                                <MapPin className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                                                                <div>
                                                                    <div className="font-medium text-foreground">{record.location}</div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-start gap-2">
                                                                <User className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                                                                <div>
                                                                    <div className="font-medium text-foreground">{record.manager}</div>
                                                                    <div className="text-muted-foreground">Manager</div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-start gap-2 sm:col-span-2 mt-1">
                                                                <Tag className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                                                                <div className="flex flex-wrap gap-4">
                                                                    <span className="text-muted-foreground">FTE: <span className="font-medium text-foreground">{record.fte}</span></span>
                                                                    <span className="text-muted-foreground">Hours: <span className="font-medium text-foreground">{record.workingHours}/wk</span></span>
                                                                    <span className="text-muted-foreground">Status: <span className="font-medium text-foreground">{record.status}</span></span>
                                                                    {record.contractType && <span className="text-muted-foreground">Contract: <span className="font-medium text-foreground">{record.contractType}</span></span>}
                                                                    {record.probationEndDate && <span className="text-muted-foreground">Probation Ends: <span className="font-medium text-amber-600">{format(new Date(record.probationEndDate), "MMM d, yyyy")}</span></span>}
                                                                </div>
                                                            </div>

                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
