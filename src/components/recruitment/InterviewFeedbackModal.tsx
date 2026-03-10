import { cn } from "@/lib/utils";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Star, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InterviewFeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    interviewId: string;
    candidateName?: string;
    jobTitle?: string;
    interviewType?: string;
}

interface CompetencyRating {
    technical: number;
    communication: number;
    cultureFit: number;
    problemSolving: number;
}

export function InterviewFeedbackModal({
    isOpen,
    onClose,
    interviewId,
    candidateName = "Candidate",
    jobTitle = "Position",
    interviewType = "Interview"
}: InterviewFeedbackModalProps) {
    const queryClient = useQueryClient();
    const [overallRating, setOverallRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [competencies, setCompetencies] = useState<CompetencyRating>({
        technical: 0,
        communication: 0,
        cultureFit: 0,
        problemSolving: 0
    });
    const [formData, setFormData] = useState({
        strengths: '',
        improvements: '',
        observations: '',
        recommendation: ''
    });

    const submitFeedbackMutation = useMutation({
        mutationFn: async () => {
            if (overallRating === 0) {
                throw new Error('Overall rating is required');
            }

            const payload = {
                feedback: JSON.stringify({
                    strengths: formData.strengths,
                    improvements: formData.improvements,
                    observations: formData.observations,
                    competencies
                }),
                rating: overallRating / 5, // Convert to 0-1 scale
                recommendation: formData.recommendation
            };

            const res = await fetch(`/api/recruitment/interviews/${interviewId}/feedback`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to submit feedback');
            }

            return res.json();
        },
        onSuccess: () => {
            toast({
                title: 'Feedback Submitted',
                description: 'Thank you for providing interview feedback'
            });
            queryClient.invalidateQueries({ queryKey: ['/api/recruitment/my-interviews'] });
            onClose();
            // Reset form
            setOverallRating(0);
            setCompetencies({
                technical: 0,
                communication: 0,
                cultureFit: 0,
                problemSolving: 0
            });
            setFormData({
                strengths: '',
                improvements: '',
                observations: '',
                recommendation: ''
            });
        },
        onError: (error: Error) => {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message
            });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.recommendation) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Please select a hiring recommendation'
            });
            return;
        }

        submitFeedbackMutation.mutate();
    };

    const StarRating = ({
        value,
        onChange,
        label
    }: {
        value: number;
        onChange: (rating: number) => void;
        label: string;
    }) => {
        const [hovered, setHovered] = useState(0);

        return (
            <div className="space-y-1">
                <Label className="text-sm">{label}</Label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            className={cn(`h-6 w-6 cursor-pointer transition-colors ${star <= (hovered || value)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-muted-foreground'
                                }`)}
                            onMouseEnter={() => setHovered(star)}
                            onMouseLeave={() => setHovered(0)}
                            onClick={() => onChange(star)}
                        />
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">
                        {value > 0 ? `${value}/5` : 'Not rated'}
                    </span>
                </div>
            </div>
        );
    };

    const ratingLabels = ['Poor', 'Below Average', 'Average', 'Good', 'Excellent'];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Interview Feedback
                    </DialogTitle>
                    <DialogDescription>
                        Provide feedback for {candidateName} - {jobTitle} ({interviewType})
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-6 py-4">
                        {/* Overall Rating */}
                        <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
                            <Label className="text-base font-semibold">Overall Rating *</Label>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={cn(`h-8 w-8 cursor-pointer transition-all ${star <= (hoveredRating || overallRating)
                                                ? 'fill-yellow-400 text-yellow-400 scale-110'
                                                : 'text-muted-foreground hover:text-yellow-200'
                                            }`)}
                                        onMouseEnter={() => setHoveredRating(star)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                        onClick={() => setOverallRating(star)}
                                    />
                                ))}
                                {overallRating > 0 && (
                                    <Badge variant="outline" className="ml-2">
                                        {ratingLabels[overallRating - 1]}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Competency Ratings */}
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">Competency Ratings</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <StarRating
                                    label="Technical Skills"
                                    value={competencies.technical}
                                    onChange={(rating) => setCompetencies({ ...competencies, technical: rating })}
                                />
                                <StarRating
                                    label="Communication"
                                    value={competencies.communication}
                                    onChange={(rating) => setCompetencies({ ...competencies, communication: rating })}
                                />
                                <StarRating
                                    label="Culture Fit"
                                    value={competencies.cultureFit}
                                    onChange={(rating) => setCompetencies({ ...competencies, cultureFit: rating })}
                                />
                                <StarRating
                                    label="Problem Solving"
                                    value={competencies.problemSolving}
                                    onChange={(rating) => setCompetencies({ ...competencies, problemSolving: rating })}
                                />
                            </div>
                        </div>

                        {/* Structured Feedback */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="strengths" className="flex items-center gap-2">
                                    <ThumbsUp className="h-4 w-4 text-green-600" />
                                    Strengths
                                </Label>
                                <Textarea
                                    id="strengths"
                                    value={formData.strengths}
                                    onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                                    placeholder="What did the candidate do well?"
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="improvements" className="flex items-center gap-2">
                                    <ThumbsDown className="h-4 w-4 text-orange-600" />
                                    Areas for Improvement
                                </Label>
                                <Textarea
                                    id="improvements"
                                    value={formData.improvements}
                                    onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
                                    placeholder="What could the candidate improve on?"
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="observations">Key Observations</Label>
                                <Textarea
                                    id="observations"
                                    value={formData.observations}
                                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                                    placeholder="Notable moments, responses, or behaviors during the interview..."
                                    rows={3}
                                />
                            </div>
                        </div>

                        {/* Recommendation */}
                        <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
                            <Label htmlFor="recommendation" className="text-base font-semibold">
                                Hiring Recommendation *
                            </Label>
                            <Select
                                value={formData.recommendation}
                                onValueChange={(value) => setFormData({ ...formData, recommendation: value })}
                            >
                                <SelectTrigger id="recommendation">
                                    <SelectValue placeholder="Select your recommendation" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="STRONG_HIRE">
                                        <span className="flex items-center gap-2">
                                            <Badge variant="default" className="bg-green-600">Strong Hire</Badge>
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="HIRE">
                                        <span className="flex items-center gap-2">
                                            <Badge variant="default">Hire</Badge>
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="NO_HIRE">
                                        <span className="flex items-center gap-2">
                                            <Badge variant="secondary">No Hire</Badge>
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="STRONG_NO_HIRE">
                                        <span className="flex items-center gap-2">
                                            <Badge variant="destructive">Strong No Hire</Badge>
                                        </span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitFeedbackMutation.isPending}>
                            {submitFeedbackMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Feedback'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
