import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, ArrowLeft } from "lucide-react";

export default function LearningPlayer() {
    const params = useParams() as { enrollmentId?: string };
    const enrollmentId = params.enrollmentId;
    const [location, setLocation] = useLocation();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [progress, setProgress] = useState(0);

    // Fetch Launch Data
    const { data: launchData, isLoading, error } = useQuery<any>({
        queryKey: ["learning-launch", enrollmentId],
        queryFn: async () => {
            const res = await fetch(`/api/learning/player/${enrollmentId}/launch`);
            if (!res.ok) throw new Error("Failed to launch content");
            return res.json();
        }
    });

    // Tracking Mutation
    const trackMutation = useMutation({
        mutationFn: async (status: string) => {
            await fetch(`/api/learning/player/${enrollmentId}/progress`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-learning"] });
            toast({ title: "Progress Saved", description: "Your progress has been recorded." });
        }
    });

    if (isLoading) return <div className="h-screen w-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-indigo-600" /></div>;
    if (error) return <div className="p-10 text-center text-red-500">Error loading content: {(error as Error).message}</div>;

    const handleComplete = () => {
        trackMutation.mutate("COMPLETED");
        setTimeout(() => setLocation("/hr/learning/me"), 1000);
    };

    return (
        <div className="h-screen flex flex-col bg-slate-950 text-white">
            {/* Header */}
            <div className="h-16 border-b border-slate-800 flex items-center px-6 justify-between bg-slate-900">
                <Button variant="ghost" className="text-white hover:bg-slate-800" onClick={() => setLocation("/hr/learning/me")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
                <div className="font-semibold text-lg">{launchData.studentName}'s Learning Session</div>
                <div>
                    {/* Timer or Status could go here */}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative bg-black">
                {launchData.contentType === "VIDEO" ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <video
                            controls
                            className="max-h-full max-w-full"
                            src={launchData.contentUrl}
                            onEnded={() => trackMutation.mutate("COMPLETED")}
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                ) : (
                    <div className="h-full w-full flex items-center justify-center">
                        <iframe
                            src={launchData.contentUrl}
                            className="w-full h-full border-0"
                            title="Learning Content"
                        />
                    </div>
                )}
            </div>

            {/* Footer / Controls */}
            <div className="h-20 border-t border-slate-800 bg-slate-900 flex items-center justify-between px-8">
                <div className="text-sm text-slate-400">
                    Status: <span className="text-white font-medium">{launchData.initialStatus}</span>
                </div>

                <div className="flex gap-4">
                    <Button
                        onClick={handleComplete}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        disabled={trackMutation.isPending}
                    >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark Complete
                    </Button>
                </div>
            </div>
        </div>
    );
}
