import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Users, Award, TrendingUp, DollarSign, Building, CheckCircle, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ContextualSearch } from "@/components/ContextualSearch";
import { StatusBadge } from "@/components/shared/StatusBadge";

interface Partner {
    id: string;
    name: string;
    tier: "PLATINUM" | "GOLD" | "SILVER" | "BRONZE";
    type: "RESELLER" | "REFERRAL" | "TECHNOLOGY" | "CONSULTANT";
    status: "ACTIVE" | "INACTIVE" | "PENDING";
    certificationLevel: string;
    dealsRegistered: number;
    revenue: number;
    winRate: number;
    contactName: string;
    contactEmail: string;
}

export default function PartnerManagement() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Fetch partners
    const { data: partners = [] } = useQuery<Partner[]>({
        queryKey: ["partners"],
        queryFn: async () => {
            const res = await fetch("/api/crm/partners");
            return res.json();
        }
    });

    // Update partner mutation
    const updatePartnerMutation = useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<Partner> }) => {
            const res = await fetch(`/api/crm/partners/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates)
            });
            if (!res.ok) throw new Error("Failed to update");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["partners"] });
            toast({
                title: "Partner Updated",
                description: "Partner information updated successfully"
            });
            setSelectedPartner(null);
            setIsEditing(false);
        }
    });

    const activePartners = partners.filter(p => p.status === "ACTIVE");
    const platinumPartners = partners.filter(p => p.tier === "PLATINUM");
    const totalRevenue = partners.reduce((sum, p) => sum + p.revenue, 0);
    const totalDeals = partners.reduce((sum, p) => sum + p.dealsRegistered, 0);

    const getTierColor = (tier: string) => {
        switch (tier) {
            case "PLATINUM": return "bg-purple-100 text-purple-800 border-purple-200";
            case "GOLD": return "bg-amber-100 text-amber-800 border-amber-200";
            case "SILVER": return "bg-gray-100 text-gray-800 border-gray-200";
            case "BRONZE": return "bg-orange-100 text-orange-800 border-orange-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };



    return (
        <StandardPage
            title="Partner Management"
            description="Manage partner relationships and track partner performance"
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "Partners", href: "/crm/partners" },
                { label: "Management" }
            ]}
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-blue-50 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Total Partners
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900">{partners.length}</div>
                            <div className="text-xs text-blue-700">{activePartners.length} active</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-50 border-purple-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-purple-800 uppercase flex items-center gap-1">
                                <Award className="h-3 w-3" />
                                Platinum Tier
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-900">{platinumPartners.length}</div>
                            <div className="text-xs text-purple-700">Top performers</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                Partner Revenue
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900">${(totalRevenue / 1000000).toFixed(1)}M</div>
                            <div className="text-xs text-green-700">Total sourced</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-amber-50 border-amber-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-amber-800 uppercase flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                Deals Registered
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-900">{totalDeals}</div>
                            <div className="text-xs text-amber-700">All time</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between bg-card p-4 rounded-lg border">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="w-72">
                            <ContextualSearch
                                placeholder="Search partners..."
                                fields={[{ key: "query", label: "Search", type: "text" }]}
                                onSearch={() => { }}
                            />
                        </div>
                        <Select defaultValue="all">
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Tiers</SelectItem>
                                <SelectItem value="platinum">Platinum</SelectItem>
                                <SelectItem value="gold">Gold</SelectItem>
                                <SelectItem value="silver">Silver</SelectItem>
                                <SelectItem value="bronze">Bronze</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={() => { setSelectedPartner({ status: "PENDING" } as Partner); setIsEditing(true); }}>
                        <Users className="h-4 w-4 mr-2" />
                        Add Partner
                    </Button>
                </div>

                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="all">All ({partners.length})</TabsTrigger>
                        <TabsTrigger value="active">Active ({activePartners.length})</TabsTrigger>
                        <TabsTrigger value="platinum">Platinum ({platinumPartners.length})</TabsTrigger>
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all">
                        <Card>
                            <CardContent className="pt-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Partner Name</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Tier</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Deals</TableHead>
                                            <TableHead className="text-right">Revenue</TableHead>
                                            <TableHead className="text-right">Win Rate</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {partners.map((partner) => (
                                            <TableRow key={partner.id}>
                                                <TableCell>
                                                    <div className="font-medium">{partner.name}</div>
                                                    <div className="text-xs text-muted-foreground">{partner.contactName}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{partner.type}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getTierColor(partner.tier)}>
                                                        {partner.tier}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge status={partner.status} />
                                                </TableCell>
                                                <TableCell className="text-right font-mono">{partner.dealsRegistered}</TableCell>
                                                <TableCell className="text-right font-mono">
                                                    ${(partner.revenue / 1000).toFixed(0)}K
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className={`font-semibold ${partner.winRate >= 50 ? 'text-green-700' : 'text-amber-700'}`}>
                                                        {partner.winRate}%
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => { setSelectedPartner(partner); setIsEditing(true); }}
                                                    >
                                                        View
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="active">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {activePartners.map((partner) => (
                                <Card key={partner.id} className="border-l-4 border-l-green-500">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <CardTitle className="text-lg">{partner.name}</CardTitle>
                                                    <Badge className={getTierColor(partner.tier)}>
                                                        {partner.tier}
                                                    </Badge>
                                                </div>
                                                <CardDescription className="mt-1">
                                                    {partner.type} Partner • {partner.certificationLevel}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-3 gap-4 text-center text-sm mb-4">
                                            <div>
                                                <div className="text-2xl font-bold text-blue-700">{partner.dealsRegistered}</div>
                                                <div className="text-xs text-muted-foreground">Deals</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-green-700">${(partner.revenue / 1000).toFixed(0)}K</div>
                                                <div className="text-xs text-muted-foreground">Revenue</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-purple-700">{partner.winRate}%</div>
                                                <div className="text-xs text-muted-foreground">Win Rate</div>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="w-full"
                                            variant="outline"
                                            onClick={() => { setSelectedPartner(partner); setIsEditing(true); }}
                                        >
                                            Manage Partner
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="platinum">
                        <div className="grid gap-4">
                            {platinumPartners.map((partner) => (
                                <Card key={partner.id} className="border-l-4 border-l-purple-500 bg-purple-50/30">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Award className="h-5 w-5 text-purple-700" />
                                                    <CardTitle className="text-lg">{partner.name}</CardTitle>
                                                    <Badge className={getTierColor(partner.tier)}>
                                                        {partner.tier}
                                                    </Badge>
                                                </div>
                                                <CardDescription className="mt-2">
                                                    Elite partner with {partner.dealsRegistered} deals registered • ${(partner.revenue / 1000000).toFixed(2)}M in revenue
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm">
                                                <div className="font-medium">Contact: {partner.contactName}</div>
                                                <div className="text-muted-foreground">{partner.contactEmail}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-purple-900">{partner.winRate}%</div>
                                                <div className="text-xs text-muted-foreground">Win Rate</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="performance">
                        <Card>
                            <CardHeader>
                                <CardTitle>Partner Performance Metrics</CardTitle>
                                <CardDescription>Ranked by revenue contribution</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[...partners].sort((a, b) => b.revenue - a.revenue).slice(0, 10).map((partner, idx) => (
                                        <div key={partner.id} className="flex items-center gap-4">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold text-sm flex-shrink-0">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="font-medium">{partner.name}</div>
                                                    <div className="text-sm font-semibold">${(partner.revenue / 1000).toFixed(0)}K</div>
                                                </div>
                                                <Progress value={(partner.revenue / totalRevenue) * 100} className="h-2" />
                                            </div>
                                            <Badge className={getTierColor(partner.tier)} variant="outline">
                                                {partner.tier}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Partner Editor */}
                {isEditing && selectedPartner && (
                    <Card className="border-t-4 border-t-blue-500">
                        <CardHeader>
                            <CardTitle>
                                {selectedPartner.id ? `Partner: ${selectedPartner.name}` : "New Partner"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Partner Name</label>
                                    <Input defaultValue={selectedPartner.name} placeholder="Company name" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Type</label>
                                    <Select defaultValue={selectedPartner.type}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="RESELLER">Reseller</SelectItem>
                                            <SelectItem value="REFERRAL">Referral</SelectItem>
                                            <SelectItem value="TECHNOLOGY">Technology</SelectItem>
                                            <SelectItem value="CONSULTANT">Consultant</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Tier</label>
                                    <Select defaultValue={selectedPartner.tier}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PLATINUM">Platinum</SelectItem>
                                            <SelectItem value="GOLD">Gold</SelectItem>
                                            <SelectItem value="SILVER">Silver</SelectItem>
                                            <SelectItem value="BRONZE">Bronze</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Status</label>
                                    <Select defaultValue={selectedPartner.status}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE">Active</SelectItem>
                                            <SelectItem value="INACTIVE">Inactive</SelectItem>
                                            <SelectItem value="PENDING">Pending</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Contact Name</label>
                                    <Input defaultValue={selectedPartner.contactName} placeholder="Primary contact" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Contact Email</label>
                                    <Input defaultValue={selectedPartner.contactEmail} type="email" placeholder="email@partner.com" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => { setSelectedPartner(null); setIsEditing(false); }}>
                                    Cancel
                                </Button>
                                <Button onClick={() => updatePartnerMutation.mutate({ id: selectedPartner.id, updates: selectedPartner })}>
                                    Save Partner
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </StandardPage>
    );
}
