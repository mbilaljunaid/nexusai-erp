import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, AlertTriangle, User, TrendingUp, Calendar, Award } from "lucide-react";

interface Candidate {
    id: string;
    employeeId: string;
    employeeName: string;
    currentRole: string;
    performance: number;
    potential: number;
    readiness: string;
    developmentPlan?: string;
}

interface CandidateComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidates: Candidate[];
}

export function CandidateComparisonModal({ isOpen, onClose, candidates }: CandidateComparisonModalProps) {
    if (candidates.length < 2) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                            Cannot Compare Candidates
                        </DialogTitle>
                        <DialogDescription>
                            Please select at least 2 candidates to compare.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={onClose}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    const maxCandidates = candidates.slice(0, 4); // Limit to 4 for UI clarity

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Compare Candidates ({maxCandidates.length} selected)</DialogTitle>
                    <DialogDescription>
                        Side-by-side comparison of key metrics and qualifications
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Header Row - Candidate Names */}
                    <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${maxCandidates.length}, 1fr)` }}>
                        <div className="font-semibold text-muted-foreground">Candidate</div>
                        {maxCandidates.map((candidate) => (
                            <Card key={candidate.id} className="bg-gradient-to-br from-blue-50 to-blue-100">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-blue-600" />
                                        <div>
                                            <div className="font-semibold text-blue-900 dark:text-blue-200">{candidate.employeeName}</div>
                                            <div className="text-xs text-blue-700">{candidate.employeeId}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Current Role */}
                    <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${maxCandidates.length}, 1fr)` }}>
                        <div className="font-medium text-sm flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            Current Role
                        </div>
                        {maxCandidates.map((candidate) => (
                            <div key={candidate.id} className="p-3 border rounded-lg bg-slate-500/10">
                                <div className="text-sm font-medium">{candidate.currentRole}</div>
                            </div>
                        ))}
                    </div>

                    {/* Performance Rating */}
                    <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${maxCandidates.length}, 1fr)` }}>
                        <div className="font-medium text-sm flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            Performance
                        </div>
                        {maxCandidates.map((candidate) => (
                            <div key={candidate.id} className="p-3 border rounded-lg bg-slate-500/10">
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <span
                                            key={i}
                                            className={i < candidate.performance ? "text-amber-500" : "text-gray-300"}
                                        >
                                            ★
                                        </span>
                                    ))}
                                    <span className="ml-2 text-sm font-semibold">{candidate.performance}/5</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Potential Rating */}
                    <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${maxCandidates.length}, 1fr)` }}>
                        <div className="font-medium text-sm flex items-center gap-2">
                            <Award className="h-4 w-4 text-muted-foreground" />
                            Potential
                        </div>
                        {maxCandidates.map((candidate) => (
                            <div key={candidate.id} className="p-3 border rounded-lg bg-slate-500/10">
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <span
                                            key={i}
                                            className={i < candidate.potential ? "text-emerald-500" : "text-gray-300"}
                                        >
                                            ★
                                        </span>
                                    ))}
                                    <span className="ml-2 text-sm font-semibold">{candidate.potential}/5</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Readiness Level */}
                    <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${maxCandidates.length}, 1fr)` }}>
                        <div className="font-medium text-sm flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            Readiness
                        </div>
                        {maxCandidates.map((candidate) => (
                            <div key={candidate.id} className="p-3 border rounded-lg bg-slate-500/10">
                                <Badge
                                    variant={
                                        candidate.readiness === "READY_NOW" ? "default" :
                                            candidate.readiness === "6_MONTHS" ? "secondary" :
                                                "outline"
                                    }
                                >
                                    {candidate.readiness?.replace(/_/g, " ")}
                                </Badge>
                            </div>
                        ))}
                    </div>

                    {/* Development Plan */}
                    <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${maxCandidates.length}, 1fr)` }}>
                        <div className="font-medium text-sm">Development Plan</div>
                        {maxCandidates.map((candidate) => (
                            <div key={candidate.id} className="p-3 border rounded-lg bg-slate-500/10">
                                <div className="text-sm text-muted-foreground">
                                    {candidate.developmentPlan || "Not specified"}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 9-Box Position */}
                    <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${maxCandidates.length}, 1fr)` }}>
                        <div className="font-medium text-sm">9-Box Position</div>
                        {maxCandidates.map((candidate) => {
                            const perfLabel = candidate.performance >= 4 ? "High" : candidate.performance >= 3 ? "Medium" : "Low";
                            const potLabel = candidate.potential >= 4 ? "High" : candidate.potential >= 3 ? "Medium" : "Low";
                            return (
                                <div key={candidate.id} className="p-3 border rounded-lg bg-slate-500/10">
                                    <div className="text-sm font-medium">
                                        {perfLabel} Performance / {potLabel} Potential
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                    <Button>Export Comparison</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface RemoveCandidateDialogProps {
    isOpen: boolean;
    onClose: () => void;
    candidate: Candidate | null;
    onConfirm: () => void;
    isLoading?: boolean;
}

export function RemoveCandidateDialog({
    isOpen,
    onClose,
    candidate,
    onConfirm,
    isLoading
}: RemoveCandidateDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-rose-600" />
                        Remove Candidate
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. The candidate will be removed from this succession plan.
                    </DialogDescription>
                </DialogHeader>

                {candidate && (
                    <div className="p-4 border border-rose-200 bg-rose-500/10 rounded-lg">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-rose-900 dark:text-rose-200">Candidate:</span>
                                <span className="text-sm text-rose-700">{candidate.employeeName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-rose-900 dark:text-rose-200">Employee ID:</span>
                                <span className="text-sm text-rose-700">{candidate.employeeId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-rose-900 dark:text-rose-200">Current Role:</span>
                                <span className="text-sm text-rose-700">{candidate.currentRole}</span>
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
                        {isLoading ? "Removing..." : "Remove Candidate"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
