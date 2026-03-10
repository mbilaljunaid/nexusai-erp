import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, MousePointerClick, Tag, Filter, Search, Copy, Download, Link as LinkIcon, BarChart3 } from "lucide-react";

interface UtmCampaign {
    id: string;
    campaignName: string;
    source: string;
    medium: string;
    term: string;
    content: string;
    clicks: number;
    bounceRate: number;
    conversions: number;
}

export default function UtmTracking() {
    const [baseUrl, setBaseUrl] = useState("https://nexusai.com/lp/fall-promo");
    const [source, setSource] = useState("linkedin");
    const [medium, setMedium] = useState("social");
    const [campaign, setCampaign] = useState("q4_launch");
    const [term, setTerm] = useState("");
    const [content, setContent] = useState("");

    const generatedUrl = `${baseUrl}?utm_source=${source}&utm_medium=${medium}&utm_campaign=${campaign}${term ? `&utm_term=${term}` : ''}${content ? `&utm_content=${content}` : ''}`;

    const performanceData: UtmCampaign[] = [
        { id: "C1", campaignName: "q4_launch", source: "linkedin", medium: "social", term: "erp_software", content: "video_ad", clicks: 12450, bounceRate: 42.5, conversions: 312 },
        { id: "C2", campaignName: "q4_launch", source: "google", medium: "cpc", term: "enterprise_erp_solutions", content: "text_ad_1", clicks: 8320, bounceRate: 55.2, conversions: 450 },
        { id: "C3", campaignName: "newsletter_oct", source: "email", medium: "newsletter", term: "", content: "hero_button", clicks: 4100, bounceRate: 31.8, conversions: 185 },
        { id: "C4", campaignName: "partner_referral", source: "acme_corp", medium: "affiliate", term: "", content: "sidebar_banner", clicks: 950, bounceRate: 28.4, conversions: 89 },
        { id: "C5", campaignName: "q4_launch", source: "twitter", medium: "social", term: "", content: "organic_post", clicks: 2150, bounceRate: 68.9, conversions: 12 },
    ];

    return (
        <StandardPage
            title="UTM Tracking & Web Beacons"
            description="Generate trackable URLs and analyze inbound traffic attribution across all marketing channels."
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "Marketing", href: "/crm/campaigns" },
                { label: "UTM Tracking" }
            ]}
            actions={
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" /> Export Data
                </Button>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="md:col-span-1 border-primary/20 bg-primary/5 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <LinkIcon className="h-5 w-5 text-primary" /> UTM Link Builder
                        </CardTitle>
                        <CardDescription>Instantly construct trackable URLs for your campaigns.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase">Base URL *</label>
                            <Input value={baseUrl} onChange={e => setBaseUrl(e.target.value)} placeholder="https://..." className="bg-white dark:bg-slate-900" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Source *</label>
                                <Input value={source} onChange={e => setSource(e.target.value)} placeholder="google, newsletter" className="bg-white dark:bg-slate-900" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Medium *</label>
                                <Input value={medium} onChange={e => setMedium(e.target.value)} placeholder="cpc, email, social" className="bg-white dark:bg-slate-900" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase">Campaign Name *</label>
                            <Input value={campaign} onChange={e => setCampaign(e.target.value)} placeholder="spring_sale" className="bg-white dark:bg-slate-900" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">Term <Badge variant="outline" className="text-[8px] h-3 px-1">Optional</Badge></label>
                                <Input value={term} onChange={e => setTerm(e.target.value)} placeholder="running+shoes" className="bg-white dark:bg-slate-900" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">Content <Badge variant="outline" className="text-[8px] h-3 px-1">Optional</Badge></label>
                                <Input value={content} onChange={e => setContent(e.target.value)} placeholder="logolink" className="bg-white dark:bg-slate-900" />
                            </div>
                        </div>
                        <div className="pt-4 border-t mt-4">
                            <label className="text-xs font-bold text-primary uppercase mb-2 block">Generated URL</label>
                            <div className="flex gap-2">
                                <Input value={generatedUrl} readOnly className="bg-slate-100 dark:bg-black font-mono text-xs" />
                                <Button size="icon" variant="secondary" className="shrink-0" title="Copy to clipboard">
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="md:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card className="border-l-4 border-l-blue-500">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Tracked Clicks (30d)</p>
                                        <p className="text-3xl font-black text-blue-600">27,970</p>
                                    </div>
                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><MousePointerClick className="h-5 w-5" /></div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-emerald-500">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">UTM Conversions</p>
                                        <p className="text-3xl font-black text-emerald-600">1,048</p>
                                    </div>
                                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Globe className="h-5 w-5" /></div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-purple-500">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Engagement Rate</p>
                                        <p className="text-3xl font-black text-purple-600">54.2%</p>
                                    </div>
                                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><BarChart3 className="h-5 w-5" /></div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border shadow-sm">
                        <CardHeader className="pb-4">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Tag className="h-5 w-5 text-primary" /> Campaign Performance Matrix
                                    </CardTitle>
                                    <CardDescription>Analyze inbound traffic quality based on URL parameters.</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="relative w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="Filter campaigns..." className="pl-9 h-9" />
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
                                    <TableHead>Campaign</TableHead>
                                    <TableHead>Source / Medium</TableHead>
                                    <TableHead>Term / Content</TableHead>
                                    <TableHead className="text-right">Clicks</TableHead>
                                    <TableHead className="text-right">Bounce Rate</TableHead>
                                    <TableHead className="text-right">Conversions</TableHead>
                                    <TableHead className="text-right">Conv. Rate</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {performanceData.map(data => (
                                    <TableRow key={data.id} className="hover:bg-muted/30">
                                        <TableCell className="font-semibold text-primary">{data.campaignName}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <Badge variant="outline" className="w-fit bg-slate-50 text-slate-700">{data.source}</Badge>
                                                <span className="text-xs text-muted-foreground ml-1">{data.medium}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {data.term && <div><span className="font-semibold text-slate-500">T:</span> {data.term}</div>}
                                            {data.content && <div><span className="font-semibold text-slate-500">C:</span> {data.content}</div>}
                                            {!data.term && !data.content && <span className="opacity-50">--</span>}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">{data.clicks.toLocaleString()}</TableCell>
                                        <TableCell className="text-right text-muted-foreground">{data.bounceRate}%</TableCell>
                                        <TableCell className="text-right font-bold text-emerald-600">{data.conversions}</TableCell>
                                        <TableCell className="text-right font-medium">
                                            {((data.conversions / data.clicks) * 100).toFixed(2)}%
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
