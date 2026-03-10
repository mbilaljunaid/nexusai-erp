import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, HandMetal } from "lucide-react";
import { format, addDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function ShiftBiddingBoard() {
    const tenantId = "default-tenant";
    const personId = "EMP-10042";
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: openShifts, isLoading } = useQuery<any>({
        queryKey: ["wfm-open-shifts", tenantId],
        queryFn: async () => {
            // Mock open shifts
            const today = new Date();
            return [
                { id: "SHF-101", role: "Registered Nurse - ER", location: "Main Campus, East Wing", date: format(addDays(today, 2), "yyyy-MM-dd"), startTime: "07:00", endTime: "19:00", premium: true, reqId: "REQ-001" },
                { id: "SHF-102", role: "Float Pool RN", location: "North Clinic", date: format(addDays(today, 3), "yyyy-MM-dd"), startTime: "19:00", endTime: "07:00", premium: false, reqId: "REQ-002" },
                { id: "SHF-103", role: "Registered Nurse - ICU", location: "Main Campus, West Wing", date: format(addDays(today, 5), "yyyy-MM-dd"), startTime: "07:00", endTime: "19:00", premium: true, reqId: "REQ-003" },
            ];
        }
    });

    const bidMut = useMutation({
        mutationFn: async (shiftId: string) => {
            await new Promise(r => setTimeout(r, 600));
            return { success: true };
        },
        onSuccess: () => {
            toast({ title: "Bid Submitted", description: "Your schedule request has been sent for manager approval." });
            // Invalidate shifts
        }
    });

    return (
        <StandardPage title="Shift Bidding Board">
            <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">Browse open shifts and submit requests to pick up extra hours.</p>
                <div className="flex gap-4">
                    <div className="text-right">
                        <div className="text-xl font-bold text-emerald-600">36.0</div>
                        <div className="text-xs text-muted-foreground">Scheduled Hours</div>
                    </div>
                    <div className="text-right pl-4 border-l">
                        <div className="text-xl font-bold">40.0</div>
                        <div className="text-xs text-muted-foreground">Target Hours</div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    <div className="col-span-3 py-12 text-center text-muted-foreground text-sm border border-dashed rounded-xl">Loading open shifts...</div>
                ) : openShifts?.map((shift: any) => (
                    <Card key={shift.id} className="flex flex-col border-border hover:border-emerald-200 hover:shadow-sm transition-all">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant="outline" className="text-xs font-mono">{shift.id}</Badge>
                                {shift.premium && <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 text-white border-0">+ Premium Pay</Badge>}
                            </div>
                            <CardTitle className="text-lg">{shift.role}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 flex-1">
                            <div className="flex items-center text-sm font-medium">
                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                {format(new Date(shift.date), "EEEE, MMM d, yyyy")}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="h-4 w-4 mr-2" />
                                {shift.startTime} - {shift.endTime} (12h)
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4 mr-2" />
                                {shift.location}
                            </div>
                        </CardContent>
                        <CardFooter className="pt-0">
                            <Button
                                className="w-full gap-2"
                                variant={bidMut.isPending ? "secondary" : "default"}
                                onClick={() => bidMut.mutate(shift.id)}
                                disabled={bidMut.isPending}
                            >
                                <HandMetal className="h-4 w-4" /> Pick Up Shift
                            </Button>
                        </CardFooter>
                    </Card>
                ))}

                {openShifts?.length === 0 && (
                    <div className="col-span-3 py-12 text-center text-muted-foreground text-sm border border-dashed rounded-xl">No open shifts matching your qualifications and location.</div>
                )}
            </div>

        </StandardPage>
    );
}
