import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, Search, Calendar, ChevronRight, Menu, Bell, Clock, Briefcase, User, MapPin, Send, CheckCircle, TrendingUp, Target } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { Progress } from "@/components/ui/progress";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Mobile styling wrapper to simulate a PWA in the browser
export default function MobileSalesApp() {
    const [activeTab, setActiveTab] = useState("TODAY");
    const [isRecording, setIsRecording] = useState(false);
    const { toast } = useToast();

    const syncMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", "/api/mobile/sales/sync", {
                userId: "current_user",
                payload: { type: "full" }
            });
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "Sync Complete",
                description: "Offline data successfully merged with CRM.",
            });
        }
    });

    const dictationMutation = useMutation({
        mutationFn: async (text: string) => {
            const res = await apiRequest("POST", "/api/mobile/sales/dictation", { text });
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "Note Saved",
                description: "Voice dictation logged as a new Activity.",
            });
            setIsRecording(false);
        }
    });

    const handleMicClick = () => {
        if (!isRecording) {
            setIsRecording(true);
            // Simulate dictation duration, then send payload
            setTimeout(() => {
                dictationMutation.mutate("Met with John regarding the Q4 expansion. He wants a proposal by Friday.");
            }, 2500);
        } else {
            setIsRecording(false);
        }
    };

    const todayMeetings = [
        { id: "M1", time: "10:00 AM", client: "Acme Corp", type: "Discovery Call", location: "Zoom" },
        { id: "M2", time: "1:30 PM", client: "Stark Industries", type: "Proposal Review", location: "On-Site (NY)" },
        { id: "M3", time: "4:00 PM", client: "Globex", type: "Check-in", location: "Phone" }
    ];

    const pipeline = [
        { id: "OPP-1", name: "Acme Enterprise License", amount: 150000, stage: "Proposal", probability: 60 },
        { id: "OPP-2", name: "Stark Upgrades", amount: 45000, stage: "Negotiation", probability: 80 }
    ];

    return (
        <div className="flex h-[calc(100vh-80px)] items-center justify-center bg-slate-100 dark:bg-slate-900 p-6 overflow-hidden">

            {/* Context/Explanation Panel for the App */}
            <div className="hidden lg:block w-[400px] mr-12 space-y-4">
                <Badge className="bg-primary/20 text-primary border-none">Module 27: Sales Core</Badge>
                <h2 className="text-3xl font-black">Mobile Sales App</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                    A dedicated, mobile-optimized PWA view for field sales representatives.
                </p>
                <ul className="space-y-3 mt-6 text-sm">
                    <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" /> <b>Offline Sync:</b> Cache active opportunities and calendars for flight mode.</li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" /> <b>Voice-to-Text:</b> Quickly dictate meeting notes directly into the CRM immediately after a client visit.</li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" /> <b>Quick Commits:</b> Swipe to update forecast categories on the go.</li>
                </ul>
            </div>

            {/* Simulated Phone Device Frame */}
            <div className="w-full max-w-[390px] h-[844px] bg-black rounded-[50px] shadow-2xl overflow-hidden relative border-[12px] border-slate-800 shrink-0">
                {/* Dynamic Island / Notch area */}
                <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-50">
                    <div className="w-32 h-7 bg-slate-800 rounded-b-3xl"></div>
                </div>

                {/* App Content */}
                <div className="w-full h-full bg-slate-50 dark:bg-slate-950 flex flex-col pt-8 relative overflow-y-auto overflow-x-hidden no-scrollbar">

                    {/* Header */}
                    <header className="px-6 pb-4 pt-2 flex items-center justify-between sticky top-0 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur z-40 border-b">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-muted/50">
                                <Menu className="h-5 w-5 text-primary" />
                            </Button>
                            <div>
                                <h1 className="text-lg font-bold leading-tight">Good Morning,</h1>
                                <p className="text-xs text-muted-foreground">Sarah Jenkins</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 relative"
                            onClick={() => syncMutation.mutate()}
                            disabled={syncMutation.isPending}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={syncMutation.isPending ? "animate-spin" : ""}><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 21v-5h5" /></svg>
                        </Button>
                    </header>

                    {/* Content Body */}
                    <div className="px-5 py-4 space-y-6 pb-24">

                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search accounts, info..." className="pl-11 h-12 rounded-2xl bg-white dark:bg-slate-900 border-none shadow-sm" />
                        </div>

                        {/* Quota Pacing */}
                        <Card className="rounded-3xl border-none shadow-md bg-gradient-to-br from-primary to-blue-700 text-primary-foreground overflow-hidden">
                            <CardContent className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="font-medium opacity-80 text-sm">Q3 Attainment</p>
                                        <h2 className="text-2xl font-black mt-1">$450K <span className="text-sm font-normal opacity-70">/ $600K</span></h2>
                                    </div>
                                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-none">75%</Badge>
                                </div>
                                <Progress value={75} className="h-1.5 bg-black/20" indicatorClassName="bg-white" />
                            </CardContent>
                        </Card>

                        {/* Voice Note Quick Action */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm flex items-center gap-4">
                            <Button
                                size="icon"
                                className={`h-14 w-14 rounded-full shrink-0 transition-all duration-300 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-primary'}`}
                                onClick={handleMicClick}
                                disabled={dictationMutation.isPending}
                            >
                                {dictationMutation.isPending ? (
                                    <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                ) : (
                                    <Mic className={`h-6 w-6 ${isRecording ? 'text-white' : ''}`} />
                                )}
                            </Button>
                            <div>
                                <h3 className="font-bold">Dictate Note</h3>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                    {isRecording ? "Listening... 'Met with John regarding the Q4 expansion...'" : "Tap to record meeting notes and auto-sync to CRM via AI."}
                                </p>
                            </div>
                        </div>

                        {/* Today's Itinerary */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Today's Itinerary</h3>
                                <span className="text-xs font-semibold text-primary">See All</span>
                            </div>
                            <div className="space-y-3">
                                {todayMeetings.map((mtg, i) => (
                                    <div key={mtg.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm flex items-start gap-4">
                                        <div className="flex flex-col items-center justify-center w-12 pt-1 border-r pr-4">
                                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{mtg.time.split(' ')[0]}</span>
                                            <span className="text-[10px] text-muted-foreground">{mtg.time.split(' ')[1]}</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm">{mtg.client}</p>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className="flex items-center text-[10px] text-muted-foreground"><Briefcase className="h-3 w-3 mr-1" /> {mtg.type}</span>
                                                <span className="flex items-center text-[10px] text-muted-foreground"><MapPin className="h-3 w-3 mr-1" /> {mtg.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Hot Opportunities */}
                        <div>
                            <h3 className="font-bold flex items-center gap-2 mb-3"><TrendingUp className="h-4 w-4 text-primary" /> Hot Pipeline</h3>
                            <ScrollArea className="w-full whitespace-nowrap pb-4">
                                <div className="flex w-max space-x-4">
                                    {pipeline.map(opp => (
                                        <Card key={opp.id} className="w-[240px] rounded-2xl border-none shadow-sm flex-shrink-0 bg-white dark:bg-slate-900">
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <Badge variant="outline" className="text-[10px] border-primary/20 text-primary">{opp.stage}</Badge>
                                                    <span className="text-xs font-bold text-emerald-600">{opp.probability}%</span>
                                                </div>
                                                <p className="font-bold text-sm truncate">{opp.name}</p>
                                                <p className="text-lg font-black mt-1">{formatCurrency(opp.amount)}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>

                    </div>

                    {/* Bottom Utility Bar */}
                    <div className="absolute bottom-0 inset-x-0 h-20 bg-white dark:bg-slate-950 border-t flex items-center justify-around pb-6 px-4 z-50">
                        <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 text-primary">
                            <Briefcase className="h-5 w-5" />
                            <span className="text-[10px] font-medium">Home</span>
                        </Button>
                        <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 text-muted-foreground">
                            <Target className="h-5 w-5" />
                            <span className="text-[10px] font-medium">Pipeline</span>
                        </Button>
                        <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 text-muted-foreground">
                            <Clock className="h-5 w-5" />
                            <span className="text-[10px] font-medium">History</span>
                        </Button>
                        <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 text-muted-foreground">
                            <User className="h-5 w-5" />
                            <span className="text-[10px] font-medium">Profile</span>
                        </Button>
                    </div>
                </div>
            </div>
            {/* Context CheckCircle Icon mapping for the outer list */}
            <CheckCircle className="hidden" />
        </div>
    );
}
