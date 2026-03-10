import React, { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, AlertTriangle, UserMinus, UserCheck, Merge } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CandidateMerge() {
    const { toast } = useToast();
    const [selectedMaster, setSelectedMaster] = useState<'A' | 'B'>('A');

    // Mock candidates
    const candidateA = { id: "CAN-5012", name: "Jonathan Smith", email: "jon.smith@gmail.com", applications: 2, created: "2025-10-12", source: "LinkedIn" };
    const candidateB = { id: "CAN-8921", name: "Jon Smith", email: "jonathan.s@hotmail.com", applications: 1, created: "2026-02-04", source: "Direct Referral" };

    const handleMerge = () => {
        toast({ title: "Candidates Merged", description: `Selected master profile: ${selectedMaster === 'A' ? candidateA.id : candidateB.id}` });
    };

    return (
        <StandardPage title="Candidate Deduplication & Merge">
            <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">Resolve duplicate applicants by merging their histories into a single master profile.</p>
                <Badge variant="outline" className="gap-2 bg-amber-50 text-amber-700 border-amber-200">
                    <AlertTriangle className="h-4 w-4" /> 14 Potential Duplicates Found
                </Badge>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Candidate A */}
                <Card className={`flex-1 transition-all ${selectedMaster === 'A' ? 'border-primary ring-1 ring-primary' : 'opacity-70 border-dashed'}`}>
                    <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    {candidateA.name}
                                </CardTitle>
                                <CardDescription className="font-mono text-xs mt-1">{candidateA.id}</CardDescription>
                            </div>
                            <Checkbox
                                checked={selectedMaster === 'A'}
                                onCheckedChange={() => setSelectedMaster('A')}
                                className="h-5 w-5 rounded-full"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="grid grid-cols-3 gap-2 py-2 border-b">
                            <span className="text-muted-foreground font-semibold">Email</span>
                            <span className="col-span-2">{candidateA.email}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 py-2 border-b">
                            <span className="text-muted-foreground font-semibold">Created</span>
                            <span className="col-span-2">{candidateA.created}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 py-2 border-b">
                            <span className="text-muted-foreground font-semibold">Source</span>
                            <span className="col-span-2">{candidateA.source}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 py-2">
                            <span className="text-muted-foreground font-semibold">Applications</span>
                            <span className="col-span-2 font-bold">{candidateA.applications}</span>
                        </div>

                        {selectedMaster === 'A' && (
                            <div className="mt-4 bg-primary/10 text-primary px-3 py-2 rounded text-xs flex items-center justify-center font-bold">
                                Master Record (Will Retain ID)
                            </div>
                        )}
                        {selectedMaster === 'B' && (
                            <div className="mt-4 bg-destructive/10 text-destructive px-3 py-2 rounded text-xs flex items-center justify-center font-bold gap-2">
                                <UserMinus className="h-4 w-4" /> Slated for Deletion
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex items-center justify-center pt-8 md:pt-0">
                    <div className="hidden md:flex flex-col items-center gap-2 px-2 text-muted-foreground">
                        <Merge className="h-8 w-8" />
                        <span className="text-xs font-bold uppercase tracking-widest">Merge</span>
                    </div>
                </div>

                {/* Candidate B */}
                <Card className={`flex-1 transition-all ${selectedMaster === 'B' ? 'border-primary ring-1 ring-primary' : 'opacity-70 border-dashed'}`}>
                    <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="flex items-center gap-2">{candidateB.name}</CardTitle>
                                <CardDescription className="font-mono text-xs mt-1">{candidateB.id}</CardDescription>
                            </div>
                            <Checkbox
                                checked={selectedMaster === 'B'}
                                onCheckedChange={() => setSelectedMaster('B')}
                                className="h-5 w-5 rounded-full"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="grid grid-cols-3 gap-2 py-2 border-b">
                            <span className="text-muted-foreground font-semibold">Email</span>
                            <span className="col-span-2">{candidateB.email}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 py-2 border-b">
                            <span className="text-muted-foreground font-semibold">Created</span>
                            <span className="col-span-2">{candidateB.created}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 py-2 border-b">
                            <span className="text-muted-foreground font-semibold">Source</span>
                            <span className="col-span-2">{candidateB.source}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 py-2">
                            <span className="text-muted-foreground font-semibold">Applications</span>
                            <span className="col-span-2 font-bold">{candidateB.applications}</span>
                        </div>

                        {selectedMaster === 'B' && (
                            <div className="mt-4 bg-primary/10 text-primary px-3 py-2 rounded text-xs flex items-center justify-center font-bold">
                                Master Record (Will Retain ID)
                            </div>
                        )}
                        {selectedMaster === 'A' && (
                            <div className="mt-4 bg-destructive/10 text-destructive px-3 py-2 rounded text-xs flex items-center justify-center font-bold gap-2">
                                <UserMinus className="h-4 w-4" /> Slated for Deletion
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-6 border-blue-200 bg-blue-50/50">
                <CardContent className="flex items-center justify-between py-4">
                    <div className="text-sm text-blue-800">
                        <span className="font-bold">Merge Summary:</span> The non-master profile will be deactivated. All
                        applications, communication logs, and uploaded documents will be transferred to
                        {" "}<span className="font-bold">{selectedMaster === 'A' ? candidateA.id : candidateB.id}</span>.
                    </div>
                    <Button onClick={handleMerge} className="gap-2 shrink-0 ml-4"><Merge className="h-4 w-4" /> Confirm Merge</Button>
                </CardContent>
            </Card>

        </StandardPage>
    );
}


