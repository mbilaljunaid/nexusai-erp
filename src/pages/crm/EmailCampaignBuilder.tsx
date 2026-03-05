import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, Users, BarChart3, Eye, Calendar, Target, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";

interface EmailCampaign {
    id: string;
    name: string;
    subject: string;
    fromName: string;
    fromEmail: string;
    segment: string;
    status: "DRAFT" | "SCHEDULED" | "SENT" | "PAUSED";
    scheduledDate?: string;
    stats?: {
        sent: number;
        delivered: number;
        opened: number;
        clicked: number;
        bounced: number;
    };
}

interface Segment {
    id: string;
    name: string;
    count: number;
    criteria: string;
}

export default function EmailCampaignBuilder() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Fetch campaigns
    const { data: campaigns = [] } = useQuery<EmailCampaign[]>({
        queryKey: ["email-campaigns"],
        queryFn: async () => {
            const res = await fetch("/api/crm/marketing/campaigns");
            return res.json();
        }
    });

    // Fetch segments
    const { data: segments = [] } = useQuery<Segment[]>({
        queryKey: ["marketing-segments"],
        queryFn: async () => {
            const res = await fetch("/api/crm/marketing/segments");
            return res.json();
        }
    });

    // Save campaign mutation
    const saveCampaignMutation = useMutation({
        mutationFn: async (campaign: Partial<EmailCampaign>) => {
            const method = campaign.id ? "PUT" : "POST";
            const url = campaign.id
                ? `/api/crm/marketing/campaigns/${campaign.id}`
                : "/api/crm/marketing/campaigns";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(campaign)
            });
            if (!res.ok) throw new Error("Failed to save");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["email-campaigns"] });
            toast({
                title: "Campaign Saved",
                description: "Email campaign saved successfully"
            });
            setSelectedCampaign(null);
            setIsEditing(false);
        }
    });

    // Send campaign mutation
    const sendCampaignMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/crm/marketing/campaigns/${id}/send`, {
                method: "POST"
            });
            if (!res.ok) throw new Error("Failed to send");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["email-campaigns"] });
            toast({
                title: "Campaign Sent",
                description: "Email campaign is being sent"
            });
        }
    });

    const draftCampaigns = campaigns.filter(c => c.status === "DRAFT");
    const scheduledCampaigns = campaigns.filter(c => c.status === "SCHEDULED");
    const sentCampaigns = campaigns.filter(c => c.status === "SENT");



    return (
        <StandardPage
            title="Email Campaign Builder"
            description="Create, manage, and analyze email marketing campaigns"
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "Marketing", href: "/crm/marketing" },
                { label: "Campaigns" }
            ]}
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-purple-50 border-purple-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-purple-800 uppercase flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                Total Campaigns
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-900">{campaigns.length}</div>
                            <div className="text-xs text-purple-700">{draftCampaigns.length} drafts</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-50 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Scheduled
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900">{scheduledCampaigns.length}</div>
                            <div className="text-xs text-blue-700">Ready to send</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase flex items-center gap-1">
                                <Send className="h-3 w-3" />
                                Sent
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900">{sentCampaigns.length}</div>
                            <div className="text-xs text-green-700">Completed</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-amber-50 border-amber-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-amber-800 uppercase flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Segments
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-900">{segments.length}</div>
                            <div className="text-xs text-amber-700">Target audiences</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between bg-card p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground">
                        Manage email campaigns and track performance
                    </div>
                    <Button onClick={() => { setSelectedCampaign({ status: "DRAFT" } as EmailCampaign); setIsEditing(true); }}>
                        <Mail className="h-4 w-4 mr-2" />
                        New Campaign
                    </Button>
                </div>

                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="all">All ({campaigns.length})</TabsTrigger>
                        <TabsTrigger value="draft">Drafts ({draftCampaigns.length})</TabsTrigger>
                        <TabsTrigger value="scheduled">Scheduled ({scheduledCampaigns.length})</TabsTrigger>
                        <TabsTrigger value="sent">Sent ({sentCampaigns.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all">
                        <Card>
                            <CardHeader>
                                <CardTitle>All Campaigns</CardTitle>
                                <CardDescription>View and manage all email campaigns</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Campaign Name</TableHead>
                                            <TableHead>Subject Line</TableHead>
                                            <TableHead>Segment</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Recipients</TableHead>
                                            <TableHead className="text-right">Open Rate</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {campaigns.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7}>
                                                    <EmptyState compact title="No campaigns yet" description="Create your first campaign to get started." />
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            campaigns.map((campaign) => {
                                                const openRate = campaign.stats
                                                    ? ((campaign.stats.opened / campaign.stats.delivered) * 100).toFixed(1)
                                                    : "0";

                                                return (
                                                    <TableRow key={campaign.id}>
                                                        <TableCell className="font-medium">{campaign.name}</TableCell>
                                                        <TableCell className="max-w-xs truncate">{campaign.subject}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="text-xs">
                                                                <Users className="h-3 w-3 mr-1" />
                                                                {campaign.segment}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <StatusBadge status={campaign.status} />
                                                        </TableCell>
                                                        <TableCell className="text-right font-mono">
                                                            {campaign.stats?.sent.toLocaleString() || "—"}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {campaign.stats ? (
                                                                <span className={`font-semibold ${Number(openRate) >= 20 ? 'text-green-700' : 'text-amber-700'}`}>
                                                                    {openRate}%
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted-foreground">—</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                {campaign.status === "DRAFT" && (
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => sendCampaignMutation.mutate(campaign.id)}
                                                                    >
                                                                        <Send className="h-4 w-4 mr-1" />
                                                                        Send
                                                                    </Button>
                                                                )}
                                                                {campaign.status === "SENT" && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => setSelectedCampaign(campaign)}
                                                                    >
                                                                        <BarChart3 className="h-4 w-4 mr-1" />
                                                                        Stats
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => { setSelectedCampaign(campaign); setIsEditing(true); }}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="draft">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    {draftCampaigns.map((campaign) => (
                                        <Card key={campaign.id} className="border-l-4 border-l-gray-500">
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <CardTitle className="text-lg">{campaign.name}</CardTitle>
                                                        <CardDescription className="mt-1">
                                                            Subject: {campaign.subject}
                                                        </CardDescription>
                                                    </div>
                                                    <StatusBadge status={campaign.status} />
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm text-muted-foreground">
                                                        Segment: <span className="font-medium">{campaign.segment}</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => { setSelectedCampaign(campaign); setIsEditing(true); }}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => sendCampaignMutation.mutate(campaign.id)}
                                                        >
                                                            <Send className="h-4 w-4 mr-1" />
                                                            Send Now
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {draftCampaigns.length === 0 && (
                                        <EmptyState compact title="No draft campaigns" />
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="scheduled">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    {scheduledCampaigns.map((campaign) => (
                                        <Card key={campaign.id} className="border-l-4 border-l-blue-500">
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <CardTitle className="text-lg">{campaign.name}</CardTitle>
                                                        <CardDescription className="mt-1">
                                                            Scheduled: {campaign.scheduledDate}
                                                        </CardDescription>
                                                    </div>
                                                    <StatusBadge status={campaign.status} />
                                                </div>
                                            </CardHeader>
                                        </Card>
                                    ))}
                                    {scheduledCampaigns.length === 0 && (
                                        <EmptyState compact title="No scheduled campaigns" />
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="sent">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    {sentCampaigns.map((campaign) => (
                                        <Card key={campaign.id} className="border-l-4 border-l-green-500">
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <CardTitle className="text-lg">{campaign.name}</CardTitle>
                                                        <CardDescription className="mt-1">
                                                            {campaign.subject}
                                                        </CardDescription>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setSelectedCampaign(campaign)}
                                                    >
                                                        <BarChart3 className="h-4 w-4 mr-2" />
                                                        View Analytics
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                {campaign.stats && (
                                                    <div className="grid grid-cols-5 gap-4 text-center">
                                                        <div>
                                                            <div className="text-2xl font-bold">{campaign.stats.sent.toLocaleString()}</div>
                                                            <div className="text-xs text-muted-foreground">Sent</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-2xl font-bold">{campaign.stats.delivered.toLocaleString()}</div>
                                                            <div className="text-xs text-muted-foreground">Delivered</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-2xl font-bold text-blue-700">{campaign.stats.opened.toLocaleString()}</div>
                                                            <div className="text-xs text-muted-foreground">Opened</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-2xl font-bold text-green-700">{campaign.stats.clicked.toLocaleString()}</div>
                                                            <div className="text-xs text-muted-foreground">Clicked</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-2xl font-bold text-red-700">{campaign.stats.bounced.toLocaleString()}</div>
                                                            <div className="text-xs text-muted-foreground">Bounced</div>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {sentCampaigns.length === 0 && (
                                        <EmptyState compact title="No sent campaigns" />
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Campaign Editor (simplified for this implementation) */}
                {isEditing && selectedCampaign && (
                    <Card className="border-t-4 border-t-purple-500">
                        <CardHeader>
                            <CardTitle>
                                {selectedCampaign.id ? "Edit Campaign" : "New Campaign"}
                            </CardTitle>
                            <CardDescription>Configure your email campaign details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Campaign Name</Label>
                                    <Input defaultValue={selectedCampaign.name} placeholder="Q1 Product Launch" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Target Segment</Label>
                                    <Select defaultValue={selectedCampaign.segment}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select segment..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {segments.map(seg => (
                                                <SelectItem key={seg.id} value={seg.name}>
                                                    {seg.name} ({seg.count} contacts)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label>Subject Line</Label>
                                    <Input defaultValue={selectedCampaign.subject} placeholder="Exciting news about..." />
                                </div>
                                <div className="space-y-2">
                                    <Label>From Name</Label>
                                    <Input defaultValue={selectedCampaign.fromName} placeholder="Marketing Team" />
                                </div>
                                <div className="space-y-2">
                                    <Label>From Email</Label>
                                    <Input defaultValue={selectedCampaign.fromEmail} type="email" placeholder="marketing@company.com" />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label>Email Body</Label>
                                    <Textarea rows={6} placeholder="Enter your email content here..." />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => { setSelectedCampaign(null); setIsEditing(false); }}>
                                    Cancel
                                </Button>
                                <Button onClick={() => saveCampaignMutation.mutate(selectedCampaign)}>
                                    Save Campaign
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </StandardPage>
    );
}
