import { formatDate } from "@/lib/dateUtils";
import { useState } from "react";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, Globe, Mail, Phone, MapPin, Users, Briefcase, MessageSquare, TrendingUp, MoreVertical } from "lucide-react";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import type { Account, Contact, Opportunity, Case } from "@/types/erp-types";
import { Link } from "wouter";
import { StandardPage } from "@/components/layout/StandardPage";
import { formatNumber } from '@/lib/formatters';

export default function AccountDetail() {
    const [, params] = useRoute("/crm/accounts/:id") as [boolean, { id?: string } | null];
    const accountId = params?.id;

    const { data: account } = useQuery<Account>({
        queryKey: ["/api/crm/accounts", accountId],
        queryFn: async () => {
            if (!accountId) return null;
            // Fetch single account. Note: We need to ensure we have a GET /api/crm/accounts/:id
            // The list endpoint supports search, but let's try direct ID fetch if available or fallback
            const res = await fetch(`/api/crm/accounts/${accountId}`);
            if (res.ok) return res.json();
            return {};
        },
        enabled: !!accountId
    });

    const { data: contacts = [] } = useQuery<{ data: Contact[] }>({
        queryKey: ["/api/crm/contacts", accountId],
        queryFn: () => fetch(`/api/crm/contacts?search=${account?.name?.split(' ')[0] || ''}`).then(r => r.json()), // Ideally should filter by accountId directly
        // Note: Contact list currently filters by SEARCH string. 
        // TODO: Add accountId filter to contacts endpoint in future. 
        // valid assumption for now: generic search might find relevant contacts.
        enabled: !!account
    });

    const { data: opportunitiesRes } = useQuery<{ data: Opportunity[] }>({
        queryKey: ["/api/crm/opportunities", accountId],
        queryFn: () => fetch(`/api/crm/opportunities?accountId=${accountId}`).then(r => r.json()),
        enabled: !!accountId
    });
    const opportunities = opportunitiesRes?.data || [];

    const { data: cases = [] } = useQuery<Case[]>({
        queryKey: ["/api/crm/cases", accountId],
        // Assuming cases endpoint supports filtering or we mock it for now as part of Account 360 structure
        queryFn: () => fetch(`/api/crm/cases?accountId=${accountId}`).then(r => r.json())
    });

    if (!account) return <PageSkeleton />;

    return (
        <StandardPage title="Account Overview" description="Manage account data and relationships">
            <div className="space-y-6 flex flex-col flex-1 overflow-y-auto pb-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                    <div className="flex items-center gap-4">
                        <Link href="/crm">
                            <Button variant="outline" size="icon" className="rounded-full" aria-label="Go back">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Building2 className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">{account.name}</h1>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {account.billingCity || 'No Location'}, {account.billingCountry}</span>
                                    <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {account.website || 'No Website'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">Edit</Button>
                        <Button>Create Opportunity</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Sidebar: Info */}
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <h3 className="font-semibold mb-4">Account Info</h3>
                                <div className="grid grid-cols-1 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Industry</p>
                                        <p className="font-medium">{account.industry || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Annual Revenue</p>
                                        <p className="font-medium">${formatNumber(Number(account.annualRevenue || 0))}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Phone</p>
                                        <p className="font-medium text-blue-600">{account.phone || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Owner</p>
                                        <p className="font-medium">{account.ownerId || 'Unassigned'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content: Tabs */}
                    <div className="lg:col-span-2">
                        <Tabs defaultValue="opportunities">
                            <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto">
                                <TabsTrigger value="opportunities" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">
                                    Opportunities <Badge variant="secondary" className="ml-2">{opportunities.length}</Badge>
                                </TabsTrigger>
                                <TabsTrigger value="contacts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">
                                    Contacts <Badge variant="secondary" className="ml-2">{(contacts as any).data?.length || 0}</Badge>
                                </TabsTrigger>
                                <TabsTrigger value="cases" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">
                                    Cases <Badge variant="secondary" className="ml-2">{cases.length}</Badge>
                                </TabsTrigger>
                            </TabsList>

                            <div className="pt-6">
                                <TabsContent value="opportunities">
                                    <InteractiveSpreadsheet
                                        data={opportunities}
                                        columns={[
                                            { id: "name", header: "Name", width: "40%", cell: (o: any) => <div className="p-2 font-medium">{o.name}</div> },
                                            { id: "stage", header: "Stage", width: "20%", cell: (o: any) => <div className="p-2"><Badge variant="outline">{o.stage}</Badge></div> },
                                            { id: "amount", header: "Amount", width: "20%", cell: (o: any) => <div className="p-2">${formatNumber(Number(o.amount))}</div> },
                                            { id: "closeDate", header: "Close Date", width: "20%", cell: (o: any) => <div className="p-2">{o.closeDate ? formatDate(o.closeDate) : '-'}</div> }
                                        ]}
                                        virtualized={true}
                                        containerHeight="400px"
                                        onChange={() => { }}
                                    />
                                </TabsContent>

                                <TabsContent value="contacts">
                                    <InteractiveSpreadsheet
                                        data={(contacts as any).data || []}
                                        columns={[
                                            { id: "name", header: "Name", width: "40%", cell: (c: any) => <div className="p-2 font-medium">{c.firstName} {c.lastName}</div> },
                                            { id: "email", header: "Email", width: "40%", cell: (c: any) => <div className="p-2">{c.email}</div> },
                                            { id: "role", header: "Role", width: "20%", cell: () => <div className="p-2">Decision Maker</div> } // Mock
                                        ]}
                                        virtualized={true}
                                        containerHeight="400px"
                                        onChange={() => { }}
                                    />
                                </TabsContent>

                                <TabsContent value="cases">
                                    <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        No open support cases
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </div>
            </div>
        </StandardPage>
    );
}
