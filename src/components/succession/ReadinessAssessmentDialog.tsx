import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, TrendingUp, Users, Building, Calendar } from "lucide-react";

interface ReadinessAssessmentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    candidate: {
        id: string;
        employeeName: string;
        currentRole: string;
    } | null;
    onSubmit: (assessment: AssessmentData) => void;
    isLoading?: boolean;
}

interface AssessmentData {
    candidateId: string;
    technicalCompetence: number;
    leadershipCapability: number;
    culturalFit: number;
    developmentNeeds: string;
    readinessTimeline: string;
}

export function ReadinessAssessmentDialog({
    isOpen,
    onClose,
    candidate,
    onSubmit,
    isLoading
}: ReadinessAssessmentDialogProps) {
    const [technicalCompetence, setTechnicalCompetence] = useState([3]);
    const [leadershipCapability, setLeadershipCapability] = useState([3]);
    const [culturalFit, setCulturalFit] = useState([3]);
    const [developmentNeeds, setDevelopmentNeeds] = useState("");
    const [readinessTimeline, setReadinessTimeline] = useState("");

    // Calculate overall readiness score
    const overallReadiness = Math.round(
        (technicalCompetence[0] * 0.35 +
            leadershipCapability[0] * 0.40 +
            culturalFit[0] * 0.25) / 5 * 100
    );

    const handleSubmit = () => {
        if (!candidate || !readinessTimeline) return;

        onSubmit({
            candidateId: candidate.id,
            technicalCompetence: technicalCompetence[0],
            leadershipCapability: leadershipCapability[0],
            culturalFit: culturalFit[0],
            developmentNeeds,
            readinessTimeline
        });

        // Reset form
        setTechnicalCompetence([3]);
        setLeadershipCapability([3]);
        setCulturalFit([3]);
        setDevelopmentNeeds("");
        setReadinessTimeline("");
    };

    if (!candidate) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ClipboardCheck className="h-5 w-5 text-blue-600" />
                        Readiness Assessment
                    </DialogTitle>
                    <DialogDescription>
                        Evaluate {candidate.employeeName}'s readiness for succession
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Candidate Info */}
                    <Card className="bg-slate-500/10 border-border">
                        <CardContent className="p-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Candidate:</span>
                                    <div className="font-semibold">{candidate.employeeName}</div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Current Role:</span>
                                    <div className="font-semibold">{candidate.currentRole}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Assessment Criteria */}
                    <div className="space-y-4">
                        {/* Technical Competence */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-blue-600" />
                                <Label className="text-base font-semibold">Technical Competence</Label>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Role-specific technical skills, industry knowledge, and problem-solving ability
                            </p>
                            <div className="flex items-center gap-4">
                                <Slider
                                    value={technicalCompetence}
                                    onValueChange={setTechnicalCompetence}
                                    min={1}
                                    max={5}
                                    step={1}
                                    className="flex-1"
                                />
                                <Badge variant="outline" className="w-16 justify-center">
                                    {technicalCompetence[0]}/5
                                </Badge>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Needs Development</span>
                                <span>Proficient</span>
                                <span>Expert</span>
                            </div>
                        </div>

                        {/* Leadership Capability */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-emerald-600" />
                                <Label className="text-base font-semibold">Leadership Capability</Label>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Team management, strategic thinking, and decision-making
                            </p>
                            <div className="flex items-center gap-4">
                                <Slider
                                    value={leadershipCapability}
                                    onValueChange={setLeadershipCapability}
                                    min={1}
                                    max={5}
                                    step={1}
                                    className="flex-1"
                                />
                                <Badge variant="outline" className="w-16 justify-center">
                                    {leadershipCapability[0]}/5
                                </Badge>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Emerging</span>
                                <span>Competent</span>
                                <span>Strong Leader</span>
                            </div>
                        </div>

                        {/* Cultural Fit */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-amber-600" />
                                <Label className="text-base font-semibold">Cultural Fit</Label>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Alignment with company values, collaboration, and adaptability
                            </p>
                            <div className="flex items-center gap-4">
                                <Slider
                                    value={culturalFit}
                                    onValueChange={setCulturalFit}
                                    min={1}
                                    max={5}
                                    step={1}
                                    className="flex-1"
                                />
                                <Badge variant="outline" className="w-16 justify-center">
                                    {culturalFit[0]}/5
                                </Badge>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Misaligned</span>
                                <span>Aligned</span>
                                <span>Culture Champion</span>
                            </div>
                        </div>
                    </div>

                    {/* Overall Readiness Score */}
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-blue-900 dark:text-blue-200">Overall Readiness Score</div>
                                    <div className="text-xs text-blue-700 mt-1">
                                        Technical (35%) + Leadership (40%) + Cultural Fit (25%)
                                    </div>
                                </div>
                                <div className="text-4xl font-bold text-blue-600">
                                    {overallReadiness}%
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Development Needs */}
                    <div className="space-y-2">
                        <Label htmlFor="developmentNeeds">Development Needs</Label>
                        <Textarea
                            id="developmentNeeds"
                            placeholder="Identify skill gaps, recommended training, and mentorship needs..."
                            value={developmentNeeds}
                            onChange={(e) => setDevelopmentNeeds(e.target.value)}
                            rows={4}
                        />
                    </div>

                    {/* Readiness Timeline */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <Label htmlFor="readinessTimeline">Readiness Timeline *</Label>
                        </div>
                        <Select value={readinessTimeline} onValueChange={setReadinessTimeline}>
                            <SelectTrigger id="readinessTimeline">
                                <SelectValue placeholder="Select readiness timeline" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="READY_NOW">Ready Now</SelectItem>
                                <SelectItem value="6_MONTHS">6 Months</SelectItem>
                                <SelectItem value="12_MONTHS">12 Months</SelectItem>
                                <SelectItem value="18_MONTHS">18 Months</SelectItem>
                                <SelectItem value="24_MONTHS">24 Months</SelectItem>
                                <SelectItem value="24_PLUS">24+ Months</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading || !readinessTimeline}
                    >
                        {isLoading ? "Submitting..." : "Submit Assessment"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
