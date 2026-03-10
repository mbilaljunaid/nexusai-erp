import { cn } from "@/lib/utils";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Brain,
    Target,
    Zap,
    ArrowRight,
    Star,
    ShieldCheck,
    MessageSquare,
    AlertCircle
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function CandidateMatchingView() {
    const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);

    const { data: matches = [] } = useQuery<any>({
        queryKey: ["/api/recruitment/ai-matching"],
        queryFn: async () => {
            return [
                {
                    id: "C-1",
                    name: "Alice Johnson",
                    score: 94,
                    skills: ["React", "TypeScript", "Node.js", "AWS"],
                    missing: ["GraphQL"],
                    experience: "8 years",
                    sentiment: "Highly Positive",
                    culturalFit: 88
                },
                {
                    id: "C-2",
                    name: "Bob Smith",
                    score: 72,
                    skills: ["React", "JavaScript", "Python"],
                    missing: ["TypeScript", "AWS"],
                    experience: "5 years",
                    sentiment: "Neutral",
                    culturalFit: 65
                },
                {
                    id: "C-3",
                    name: "Charlie Brown",
                    score: 81,
                    skills: ["Node.js", "Docker", "Go"],
                    missing: ["React", "TypeScript"],
                    experience: "6 years",
                    sentiment: "Positive",
                    culturalFit: 92
                }
            ];
        }
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Brain className="h-8 w-8 text-indigo-600" />
                        AI Candidate Matching
                    </h1>
                    <p className="text-muted-foreground mt-1">NEXUS AI Ranker: Analyzing candidate profiles against job requirements.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline"><Target className="w-4 h-4 mr-2" /> Re-Scan Requisition</Button>
                    <Button>Compare Selected</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Ranking List */}
                <Card className="lg:col-span-1 h-full overflow-hidden">
                    <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-sm">Ranked Candidates</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {matches.map((c: any) => (
                            <Button variant="ghost" className="h-auto p-0 w-full justify-start font-normal text-left overflow-hidden border-none shadow-none bg-transparent active:scale-[0.98] hover:bg-transparent transition-all" asChild onClick={() => setSelectedCandidate(c.id)}>
                            <div
                                                            key={c.id}
                                                            className={cn(`p-4 border-b cursor-pointer transition-colors hover:bg-slate-500/10 ${selectedCandidate === c.id ? "bg-indigo-500/10 border-l-4 border-l-indigo-600" : ""}`)}
                                                        >
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="space-y-0.5">
                                                                    <p className="font-bold text-sm">{c.name}</p>
                                                                    <p className="text-xs text-muted-foreground">{c.experience}</p>
                                                                </div>
                                                                <div className={cn(`p-1.5 rounded-lg text-xs font-bold ${c.score > 90 ? "bg-green-100 text-green-700" : "bg-muted text-foreground/90"}`)}>
                                                                    {c.score}%
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1">
                                                                {c.skills.slice(0, 3).map((s: string) => (
                                                                    <Badge key={s} variant="secondary" className="px-1 text-[9px] uppercase">{s}</Badge>
                                                                ))}
                                                                {c.skills.length > 3 && <span className="text-[10px] text-muted-foreground">+{c.skills.length - 3}</span>}
                                                            </div>
                                                        </div>
                            </Button>
                        ))}
                    </CardContent>
                </Card>

                {/* Detailed Analysis */}
                <Card className="lg:col-span-2">
                    {selectedCandidate ? (
                        <>
                            <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-500/10">
                                <div>
                                    <CardTitle>AI Suitability Analysis</CardTitle>
                                    <CardDescription>Matching: {matches.find(c => c.id === selectedCandidate)?.name}</CardDescription>
                                </div>
                                <ShieldCheck className="h-8 w-8 text-indigo-500" />
                            </CardHeader>
                            <CardContent className="p-6 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <p className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
                                                <Zap className="w-3 h-3 text-yellow-500" /> Skills Calibration
                                            </p>
                                            <span className="text-sm font-bold">92% Match</span>
                                        </div>
                                        <Progress value={92} className="h-2 bg-muted" />

                                        <div className="flex justify-between items-end pt-2">
                                            <p className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
                                                <Target className="w-3 h-3 text-red-500" /> Experience Fit
                                            </p>
                                            <span className="text-sm font-bold">85% Match</span>
                                        </div>
                                        <Progress value={85} className="h-2 bg-muted" />
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-xs font-semibold uppercase text-muted-foreground">Sentiment Analysis</p>
                                        <div className="p-3 bg-green-500/10 rounded-lg border border-green-100 flex items-center gap-3">
                                            <MessageSquare className="w-5 h-5 text-green-600" />
                                            <div>
                                                <p className="text-xs font-bold text-green-800">Highly Positive Engagement</p>
                                                <p className="text-[10px] text-green-700">Interview feedback shows strong technical confidence.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-bold text-sm tracking-tight flex items-center gap-2">
                                        <Star className="w-4 h-4 text-indigo-600" /> Key Skill Match & Gaps
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-500/10 rounded-xl border border-border">
                                            <p className="text-[10px] font-bold uppercase text-muted-foreground mb-3">Matching Skills</p>
                                            <div className="flex flex-wrap gap-2">
                                                {matches.find(c => c.id === selectedCandidate)?.skills.map((s: string) => (
                                                    <div key={s} className="flex items-center gap-1.5 px-2 py-1 bg-card border rounded-md text-xs font-medium">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                        {s}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-red-50/30 rounded-xl border border-red-100">
                                            <p className="text-[10px] font-bold uppercase text-red-500 mb-3">Gap Identification</p>
                                            <div className="flex flex-wrap gap-2">
                                                {matches.find(c => c.id === selectedCandidate)?.missing.map((s: string) => (
                                                    <div key={s} className="flex items-center gap-1.5 px-2 py-1 bg-card border border-red-100 rounded-md text-xs font-medium text-red-700">
                                                        <AlertCircle className="w-3 h-3" />
                                                        {s}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-indigo-600 rounded-xl text-white">
                                    <p className="text-xs font-bold uppercase opacity-80 mb-2">Nexus Intelligence Recommendation</p>
                                    <p className="text-sm font-medium">
                                        "Candidate matches 94% of core technical requirements. Strong overlap in cloud-native paradigms.
                                        Recommendation: Fast-track to final executive review."
                                    </p>
                                </div>
                            </CardContent>
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground p-12 text-center">
                            <div className="space-y-2">
                                <Brain className="h-12 w-12 mx-auto opacity-20" />
                                <p className="text-sm">Select a candidate for AI analysis</p>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
