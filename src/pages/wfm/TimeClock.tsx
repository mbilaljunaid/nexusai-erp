import { useState } from "react";
import { useMutation, useQueryClient } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Clock, LogIn, LogOut, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TimeClock() {
    const { toast } = useToast();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isOnBreak, setIsOnBreak] = useState(false);

    const clockInMutation = useMutation({
        mutationFn: (location: { lat: number; lng: number }) =>
            apiRequest("/api/wfm/clock-in", {
                method: "POST",
                body: JSON.stringify({ timestamp: new Date(), location }),
            }),
        onSuccess: () => {
            toast({ title: "Success", description: "Clocked in successfully" });
        },
    });

    const clockOutMutation = useMutation({
        mutationFn: () =>
            apiRequest("/api/wfm/clock-out", {
                method: "POST",
                body: JSON.stringify({ timestamp: new Date() }),
            }),
        onSuccess: () => {
            toast({ title: "Success", description: "Clocked out successfully" });
        },
    });

    const handleClockIn = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    clockInMutation.mutate({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                () => {
                    clockInMutation.mutate({ lat: 0, lng: 0 });
                }
            );
        } else {
            clockInMutation.mutate({ lat: 0, lng: 0 });
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Time Clock</h1>
                <p className="text-muted-foreground">GPS-enabled time tracking and attendance</p>
            </div>

            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-center">Current Time</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center">
                        <Clock className="h-16 w-16 mx-auto mb-4 text-primary" />
                        <div className="text-5xl font-bold">{currentTime.toLocaleTimeString()}</div>
                        <div className="text-muted-foreground mt-2">{currentTime.toLocaleDateString()}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button size="lg" onClick={handleClockIn} disabled={clockInMutation.isPending} className="h-20">
                            <LogIn className="h-6 w-6 mr-2" />
                            Clock In
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={() => clockOutMutation.mutate()}
                            disabled={clockOutMutation.isPending}
                            className="h-20"
                        >
                            <LogOut className="h-6 w-6 mr-2" />
                            Clock Out
                        </Button>
                    </div>

                    <div className="border-t pt-4">
                        <div className="text-sm text-muted-foreground mb-2">Today's Summary</div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <div className="text-xs text-muted-foreground">Clock In</div>
                                <div className="font-medium">8:00 AM</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">Hours Worked</div>
                                <div className="font-medium">3.5 hrs</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">Status</div>
                                <Badge variant="default">On Duty</Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
