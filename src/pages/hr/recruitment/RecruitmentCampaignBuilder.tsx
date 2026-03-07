import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from "@/components/layout/StandardPage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import {
    Megaphone,
    Save,
    Play,
    Plus,
    Users,
    Mail,
    Globe,
    LayoutTemplate,
    Search,
    Send,
    Eye,
    Target
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from '@/components/ui/DatePicker';

export default function RecruitmentCampaignBuilder() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("audience");

    // Campaign State
    const [campaignName, setCampaignName] = useState("Q3 Engineering Leadership Summit");
    const [campaignGoal, setCampaignGoal] = useState("SOURCING");

    // Audience State
    const [targetPool, setTargetPool] = useState("POOL_SD_MGR");
    const [audienceSize, setAudienceSize] = useState(482);

    const handleSave = () => {
        toast({
            title: "Campaign Saved",
            description: "Your recruitment marketing campaign draft has been saved."
        });
    };

    const handleLaunch = () => {
        toast({
            title: "Campaign Launched",
            description: `Emails scheduled for delivery to ${audienceSize} candidates. Landing page is active.`,
        });
    };

    return (
        <StandardPage
            title="Recruitment Marketing Campaigns"
            description="Build targeted sourcing campaigns, design landing pages, and engage passive talent."
            breadcrumbs={[
                { label: 'HR Admin', href: '/hr/dashboard' },
                { label: 'Recruitment', href: '/hr/recruitment' },
                { label: 'Campaign Builder' }
            ]}
        >
            <div className="max-w-6xl mx-auto pb-12 space-y-6">

                {/* Header Actions */}
                <div className="flex justify-between items-center bg-card dark:bg-zinc-950 p-4 rounded-xl border shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 rounded-lg">
                            <Megaphone className="h-6 w-6" />
                        </div>
                        <div>
                            <Input
                                value={campaignName}
                                onChange={(e) => setCampaignName(e.target.value)}
                                className="text-xl font-bold h-8 border-transparent hover:border-zinc-200 focus-visible:ring-1 bg-transparent px-2 w-72 md:w-[400px]"
                            />
                            <div className="flex items-center gap-2 mt-1 px-2">
                                <StatusBadge status="Draft" className="text-[10px]" />
                                <span className="text-xs text-muted-foreground">Last saved 4 mins ago</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={handleSave}><Save className="h-4 w-4 mr-2" /> Save Draft</Button>
                        <Button onClick={handleLaunch} className="bg-fuchsia-600 hover:bg-fuchsia-700"><Play className="h-4 w-4 mr-2" /> Launch Campaign</Button>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full lg:w-[600px] grid-cols-3">
                        <TabsTrigger value="audience"><Target className="w-4 h-4 mr-2" /> Audience</TabsTrigger>
                        <TabsTrigger value="email"><Mail className="w-4 h-4 mr-2" /> Email Sequence</TabsTrigger>
                        <TabsTrigger value="landing_page"><LayoutTemplate className="w-4 h-4 mr-2" /> Landing Page</TabsTrigger>
                    </TabsList>

                    {/* AUDIENCE TAB */}
                    <TabsContent value="audience" className="mt-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="md:col-span-2 shadow-sm">
                                <CardHeader className="border-b pb-4">
                                    <CardTitle className="text-base flex items-center gap-2">Target Pool Selection</CardTitle>
                                    <CardDescription>Define which passive candidates will receive this campaign.</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-6">
                                    <div className="space-y-2">
                                        <Label>Campaign Primary Goal</Label>
                                        <Select value={campaignGoal} onValueChange={setCampaignGoal}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="SOURCING">Sourcing & Pipeline Building</SelectItem>
                                                <SelectItem value="EVENT">Event Invitation (Webinar/Summit)</SelectItem>
                                                <SelectItem value="NEWSLETTER">Talent Community Newsletter</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t">
                                        <Label className="text-sm font-semibold">Select Talent Pools</Label>
                                        <div className="flex gap-2">
                                            <Select value={targetPool} onValueChange={setTargetPool}>
                                                <SelectTrigger className="flex-1"><SelectValue placeholder="Search existing pools..." /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="POOL_SD_MGR">Senior Dev Managers (US West)</SelectItem>
                                                    <SelectItem value="POOL_GOC_ALUM">Google/Meta Alumni Network</SelectItem>
                                                    <SelectItem value="POOL_UR">University Recruiting (Class of 2026)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button variant="secondary"><Plus className="h-4 w-4 mr-2" /> Add Selection</Button>
                                        </div>

                                        <div className="border rounded-lg p-4 bg-zinc-500/10 dark:bg-zinc-900/50 mt-4">
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="text-sm font-semibold">Included Pools</h4>
                                            </div>
                                            <div className="flex items-center justify-between p-2 bg-card dark:bg-zinc-950 border rounded-md">
                                                <div className="flex items-center gap-3">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm font-medium">Senior Dev Managers (US West)</span>
                                                </div>
                                                <Badge variant="secondary">482 Candidates</Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-semibold">Smart Filters (Optional)</Label>
                                        </div>
                                        <p className="text-xs text-muted-foreground -mt-2">Further refine your selected pools based on dynamic criteria.</p>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <Label className="text-xs">Last Engaged Before</Label>
                                                <DatePicker className="h-8 text-xs" onChange={() => { }} />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs">Required Profile Readiness</Label>
                                                <Select defaultValue="HIGH">
                                                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="ALL">Any Readiness</SelectItem>
                                                        <SelectItem value="HIGH">High (Ready to move)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm bg-purple-500/10 dark:bg-fuchsia-900/10 border-fuchsia-100 dark:border-fuchsia-900/40 border-2">
                                <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full space-y-4">
                                    <div className="h-16 w-16 bg-card dark:bg-zinc-950 rounded-full flex items-center justify-center shadow-sm border border-fuchsia-200">
                                        <Target className="h-8 w-8 text-fuchsia-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Estimated Audience</h3>
                                        <p className="text-5xl font-black mt-2 text-fuchsia-700 dark:text-fuchsia-400">{audienceSize}</p>
                                        <p className="text-xs text-muted-foreground mt-2 px-4 leading-relaxed">Passive candidates matching pool criteria and smart filters.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* EMAIL TAB */}
                    <TabsContent value="email" className="mt-6">
                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                                <div>
                                    <CardTitle className="text-base flex items-center gap-2">Email Sequence Designer</CardTitle>
                                    <CardDescription>Design the automated drip campaign.</CardDescription>
                                </div>
                                <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-2" /> Add Follow-up Step</Button>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-6 border-l-2 border-fuchsia-200 dark:border-fuchsia-900 ml-4 pl-6 relative">

                                    {/* Step 1 */}
                                    <div className="relative">
                                        <div className="absolute -left-9 top-2 h-4 w-4 rounded-full bg-fuchsia-600 border-4 border-white dark:border-zinc-950" />
                                        <div className="border rounded-lg shadow-sm">
                                            <div className="bg-zinc-500/10 dark:bg-zinc-900/50 p-3 px-4 border-b flex justify-between items-center rounded-t-lg">
                                                <span className="font-medium text-sm">Step 1: Initial Outreach</span>
                                                <Badge variant="outline" className="bg-card dark:bg-zinc-800">Day 1 (Send immediately)</Badge>
                                            </div>
                                            <div className="p-4 space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs">Subject Line</Label>
                                                    <Input defaultValue="Exclusive Invitation: Engineering Leadership Summit" className="font-medium" />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <Label className="text-xs">Email Body</Label>
                                                        <Button variant="link" className="h-auto p-0 text-[10px]">Insert Token {`{}`}</Button>
                                                    </div>
                                                    <Textarea
                                                        className="min-h-36 font-mono text-sm leading-relaxed"
                                                        defaultValue={`Hi {Candidate_First_Name},\n\nGiven your impressive background in distributed systems, I wanted to personally invite you to an exclusive leadership summit we are hosting.\n\nWe're bringing together top engineering minds to discuss scaling architecture.\n\n[Link_To_Landing_Page]\n\nBest,\n{Recruiter_Name}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* LANDING PAGE TAB */}
                    <TabsContent value="landing_page" className="mt-6">
                        <Card className="shadow-sm">
                            <CardHeader className="border-b pb-4">
                                <CardTitle className="text-base flex items-center gap-2">Landing Page Configuration</CardTitle>
                                <CardDescription>Setup the destination URL for your campaign calls-to-action.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                                    {/* Config Left */}
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label>Page Title</Label>
                                            <Input defaultValue="Join the Engineering Leadership Summit" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>URL Slug</Label>
                                            <div className="flex items-center">
                                                <span className="bg-muted px-3 border border-r-0 rounded-l-md h-9 flex items-center text-sm text-muted-foreground">careers.nexusai.com/c/</span>
                                                <Input defaultValue="eng-summit-q3" className="rounded-l-none" />
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t">
                                            <Label className="text-base font-semibold">Page Content Blocks</Label>

                                            <div className="border rounded-md p-4 space-y-4 bg-zinc-500/10 dark:bg-zinc-900/50">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">Hero Section</span>
                                                    <Switch defaultChecked />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs text-muted-foreground">Headline</Label>
                                                    <Input defaultValue="Scale Your Career with Us" className="h-8 text-sm bg-card dark:bg-zinc-950" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs text-muted-foreground">Background Image ID</Label>
                                                    <Input defaultValue="img_hero_summit_1" className="h-8 text-sm bg-card dark:bg-zinc-950 font-mono" />
                                                </div>
                                            </div>

                                            <div className="border rounded-md p-4 space-y-4 bg-zinc-500/10 dark:bg-zinc-900/50">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">Data Capture Form</span>
                                                    <Switch defaultChecked />
                                                </div>
                                                <p className="text-xs text-muted-foreground -mt-2">Fields to collect from visitors.</p>
                                                <div className="flex gap-2 flex-wrap">
                                                    <Badge variant="secondary">First Name</Badge>
                                                    <Badge variant="secondary">Last Name</Badge>
                                                    <Badge variant="secondary">Email</Badge>
                                                    <Badge variant="outline" className="border-dashed">+ Add Field</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preview Right */}
                                    <div className="border-l pl-8 hidden lg:block">
                                        <div className="flex items-center justify-between mb-4">
                                            <Label className="text-muted-foreground uppercase tracking-wider text-xs font-semibold">Live Preview</Label>
                                            <Button variant="ghost" size="sm" className="h-8"><Eye className="h-4 w-4 mr-2" /> Full Screen</Button>
                                        </div>

                                        {/* Mock Browser Window */}
                                        <div className="border rounded-xl shadow-lg bg-card dark:bg-zinc-950 overflow-hidden h-[500px] flex flex-col">
                                            <div className="h-10 bg-zinc-100 dark:bg-zinc-900 border-b flex items-center px-4 gap-2">
                                                <div className="flex gap-1.5">
                                                    <div className="w-3 h-3 rounded-full bg-red-400" />
                                                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                                                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                                                </div>
                                                <div className="mx-auto bg-card dark:bg-zinc-950 text-[10px] px-4 py-1 rounded text-muted-foreground border flex items-center gap-2">
                                                    <Globe className="h-3 w-3" /> careers.nexusai.com/c/eng-summit-q3
                                                </div>
                                            </div>
                                            <div className="flex-1 overflow-auto bg-zinc-500/10 dark:bg-zinc-950">
                                                <div className="h-48 bg-indigo-900 flex flex-col items-center justify-center p-6 text-center text-white">
                                                    <h2 className="text-2xl font-bold">Scale Your Career with Us</h2>
                                                    <p className="mt-2 text-indigo-200 text-sm max-w-sm">Join the Engineering Leadership Summit.</p>
                                                </div>
                                                <div className="max-w-sm mx-auto p-6 bg-card dark:bg-zinc-900 shadow-xl rounded-xl -mt-8 relative border">
                                                    <h3 className="font-semibold text-center mb-4 text-sm">Register Interest</h3>
                                                    <div className="space-y-3">
                                                        <div className="h-8 bg-muted rounded w-full" />
                                                        <div className="h-8 bg-muted rounded w-full" />
                                                        <div className="h-8 bg-muted rounded w-full" />
                                                        <div className="h-8 bg-indigo-600 rounded w-full mt-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

            </div>
        </StandardPage>
    );
}
