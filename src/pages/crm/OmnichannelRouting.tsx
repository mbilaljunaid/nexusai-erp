import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    PhoneCall, Mail, MessageSquare, Plus, Users, ShieldAlert,
    GitMerge, CheckCircle2, ChevronRight, UserCircle2, HeadphonesIcon, Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function OmnichannelRouting() {
    const [queues, setQueues] = useState([
        { id: "q1", name: "High Priority Support", channel: "all", strategy: "longest_idle", activeAgents: 4, waitTime: "2m" },
        { id: "q2", name: "Billing Inquiries", channel: "email", strategy: "round_robin", activeAgents: 2, waitTime: "4h" },
        { id: "q3", name: "Technical Escalations", channel: "voice", strategy: "skill_based", activeAgents: 6, waitTime: "5m" }
    ]);

    const [selectedQueue, setSelectedQueue] = useState("q3");

    const channelIcons = {
        all: Globe,
        email: Mail,
        voice: PhoneCall,
        chat: MessageSquare
    };

    return (
        <StandardPage
            title="Omnichannel Routing"
            description="Manage service queues, skills-based routing rules, and agent capacity."
            className="h-[calc(100vh-80px)] flex flex-col"
            actions={
                <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-sm"><Plus className="h-4 w-4 mr-2" /> New Queue</Button>
            }
        >
            <div className="grid grid-cols-12 gap-6 flex-1 min-h-0 mt-4">

                {/* Left: Queues List */}
                <Card className="col-span-4 flex flex-col h-full bg-card shadow-sm border-none ring-1 ring-slate-200 rounded-xl overflow-hidden">
                    <CardHeader className="border-b bg-slate-50/50 px-6 py-4">
                        <CardTitle className="text-lg flex items-center gap-2 text-primary/80"><GitMerge className="h-5 w-5" /> Routing Queues</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                        <Input placeholder="Search queues..." className="mb-4 bg-background" />
                        {queues.map(q => {
                            const Icon = channelIcons[q.channel as keyof typeof channelIcons] || Globe;
                            return (
                                <div
                                    key={q.id}
                                    onClick={() => setSelectedQueue(q.id)}
                                    className={cn(
                                        "p-4 rounded-xl border cursor-pointer transition-all hover:shadow-sm",
                                        selectedQueue === q.id ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20" : "bg-card hover:border-slate-300"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-bold text-sm tracking-tight">{q.name}</div>
                                        <Badge variant="outline" className={cn("text-[10px] capitalize", q.channel === 'voice' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : '')}>
                                            <Icon className="h-3 w-3 mr-1" />{q.channel}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground font-medium">
                                        <div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {q.activeAgents} Agents</div>
                                        <div className="flex items-center gap-1.5"><ClockIcon className="h-3.5 w-3.5" /> {q.waitTime} Est. Wait</div>
                                    </div>
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>

                {/* Right: Queue Configuration */}
                {selectedQueue ? (
                    <Card className="col-span-8 h-full flex flex-col bg-card shadow-sm border-none ring-1 ring-slate-200 rounded-xl overflow-hidden">
                        <CardHeader className="border-b bg-slate-50/50 px-8 py-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-2xl font-bold">{queues.find(q => q.id === selectedQueue)?.name}</CardTitle>
                                    <CardDescription className="mt-1 font-medium">Configure routing rules and skill requirements.</CardDescription>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full ring-1 ring-emerald-200">
                                        <CheckCircle2 className="h-4 w-4" /> Active
                                    </span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-8 space-y-8">

                            {/* General Settings */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Routing Strategy</Label>
                                    <Select defaultValue="skill_based">
                                        <SelectTrigger className="font-medium h-11"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="longest_idle">Longest Idle Agent</SelectItem>
                                            <SelectItem value="round_robin">Round Robin</SelectItem>
                                            <SelectItem value="skill_based">Skills-Based Routing</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Max Capacity per Agent</Label>
                                    <Input defaultValue="3" type="number" className="font-medium h-11" />
                                </div>
                            </div>

                            {/* Skills Configuration */}
                            <div className="border rounded-xl overflow-hidden">
                                <div className="bg-muted/30 px-6 py-4 border-b flex justify-between items-center">
                                    <h3 className="font-bold tracking-tight flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-indigo-500" /> Required Skills for this Queue</h3>
                                    <Button size="sm" variant="outline" className="h-8 shadow-none"><Plus className="h-4 w-4 mr-2" /> Add Skill</Button>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-3">
                                        {['Product Knowledge: Level 3', 'Language: Spanish', 'Technical: API/Webhooks'].map((skill, i) => (
                                            <div key={i} className="flex justify-between items-center p-3 border rounded-lg bg-slate-50/50">
                                                <span className="font-semibold text-sm">{skill}</span>
                                                <Badge variant="secondary">Required</Badge>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-sm text-muted-foreground font-medium mt-4 bg-blue-50 text-blue-800 p-3 rounded-md flex items-start gap-2 border border-blue-100">
                                        <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
                                        Only agents matching all required skills will be routed cases from this queue.
                                    </p>
                                </div>
                            </div>

                            {/* Eligible Agents Preview */}
                            <div>
                                <h3 className="font-bold tracking-tight mb-4 flex items-center gap-2"><HeadphonesIcon className="h-4 w-4 text-primary" /> Eligible Agents Online</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <div key={i} className="p-3 border rounded-xl flex items-center gap-3 bg-card shadow-sm hover:shadow-md transition-shadow">
                                            <Avatar className="h-10 w-10 border-2 border-slate-100">
                                                <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">A{i}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-bold text-sm">Agent Workspace {i}</div>
                                                <div className="text-[10px] uppercase font-bold text-emerald-600 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Available</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                ) : (
                    <Card className="col-span-8 h-full flex items-center justify-center bg-slate-50 border-dashed border-2">
                        <div className="text-center opacity-50">
                            <GitMerge className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-lg font-bold">No Queue Selected</p>
                            <p className="text-sm">Select a queue from the sidebar to configure routing rules.</p>
                        </div>
                    </Card>
                )}

            </div>
        </StandardPage>
    );
}

function ClockIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}
