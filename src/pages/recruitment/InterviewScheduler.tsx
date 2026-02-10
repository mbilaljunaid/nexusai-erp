import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Calendar as CalendarIcon,
    Clock,
    Video,
    MapPin,
    Users,
    ArrowRight,
    CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function InterviewScheduler() {
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        candidateId: "",
        interviewerId: "",
        date: "",
        startTime: "",
        duration: "60",
        type: "Remote",
        location: "Zoom"
    });

    const scheduleMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const res = await fetch("/api/recruitment/interviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to schedule");
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Interview Scheduled", description: "Invitations have been sent to panelist and candidate." });
            setStep(3);
        }
    });

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Interview Scheduler</h1>
                    <p className="text-muted-foreground mt-1">Coordinate interview panels and candidate availability</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className={step >= 1 ? "text-primary font-semibold" : ""}>Select Details</span>
                    <ArrowRight className="w-4 h-4" />
                    <span className={step >= 2 ? "text-primary font-semibold" : ""}>Panelists</span>
                    <ArrowRight className="w-4 h-4" />
                    <span className={step >= 3 ? "text-primary font-semibold" : ""}>Confirm</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Interview Details</CardTitle>
                            <CardDescription>Configure the time and format for the interview session.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input type="date" onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Start Time</Label>
                                    <Input type="time" onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Duration (Minutes)</Label>
                                    <Select defaultValue="60" onValueChange={(v) => setFormData({ ...formData, duration: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="30">30 Minutes</SelectItem>
                                            <SelectItem value="45">45 Minutes</SelectItem>
                                            <SelectItem value="60">1 Hour</SelectItem>
                                            <SelectItem value="90">1.5 Hours</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Interview Type</Label>
                                    <Select defaultValue="Remote" onValueChange={(v) => setFormData({ ...formData, type: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Remote">Remote (Virtual)</SelectItem>
                                            <SelectItem value="Onsite">Onsite (Office)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Meeting Location / Link</Label>
                                <div className="relative">
                                    {formData.type === "Remote" ? <Video className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /> : <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />}
                                    <Input
                                        className="pl-9"
                                        placeholder={formData.type === "Remote" ? "Zoom/Teams Link" : "Conference Room Name"}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Select Panelists</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { name: "John Smith", role: "Hiring Manager", dept: "Engineering", available: true },
                                    { name: "Sarah Wilson", role: "Senior Developer", dept: "Engineering", available: false },
                                    { name: "Mike Ross", role: "HR Representative", dept: "People Operations", available: true }
                                ].map((p) => (
                                    <div key={p.name} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold">
                                                {p.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium">{p.name}</p>
                                                <p className="text-xs text-muted-foreground">{p.role} • {p.dept}</p>
                                            </div>
                                        </div>
                                        <Button size="sm" variant={p.available ? "outline" : "ghost"} disabled={!p.available}>
                                            {p.available ? "Add to Panel" : "Busy"}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-lg">Schedule Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-start gap-2">
                                    <CalendarIcon className="w-4 h-4 text-primary mt-1" />
                                    <div>
                                        <p className="text-sm font-semibold">{formData.date || "Date Not Selected"}</p>
                                        <p className="text-xs text-muted-foreground">Local Time Zone</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Clock className="w-4 h-4 text-primary mt-1" />
                                    <div>
                                        <p className="text-sm font-semibold">{formData.startTime || "--:--"}</p>
                                        <p className="text-xs text-muted-foreground">{formData.duration} Minutes Duration</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Users className="w-4 h-4 text-primary mt-1" />
                                    <div>
                                        <p className="text-sm font-semibold">2 Panelists Selected</p>
                                        <p className="text-xs text-muted-foreground">Engineering Team</p>
                                    </div>
                                </div>
                            </div>
                            <Button
                                className="w-full bg-primary"
                                disabled={scheduleMutation.isPending || !formData.date || !formData.startTime}
                                onClick={() => scheduleMutation.mutate(formData)}
                            >
                                {scheduleMutation.isPending ? "Scheduling..." : "Send Invitations"}
                            </Button>
                        </CardContent>
                    </Card>

                    {step === 3 && (
                        <Card className="bg-green-50 border-green-200">
                            <CardContent className="pt-6 text-center space-y-4">
                                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                                <div className="space-y-2">
                                    <p className="font-bold text-green-800">Confirmed!</p>
                                    <p className="text-xs text-green-700">Interview has been synchronized with Outlook/Google calendars.</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
