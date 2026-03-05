import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Calendar as CalendarIcon, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { StandardPage } from "@/components/layout/StandardPage";


export default function AbsenceManagement() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [leaveType, setLeaveType] = useState("");
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [reason, setReason] = useState("");

    const { data: requests } = useQuery<any>({
        queryKey: ["/api/wfm/absence-requests"],
        queryFn: () => apiRequest("GET", "/api/wfm/absence-requests?status=PENDING").then(res => res.json()),
    });

    const submitMutation = useMutation({
        mutationFn: (data: any) =>
            apiRequest("POST", "/api/wfm/absence-requests", data),
        onSuccess: () => {
            toast({ title: "Success", description: "Absence request submitted" });
            queryClient.invalidateQueries({ queryKey: ["/api/wfm/absence-requests"] });
        },
    });

    const approveMutation = useMutation({
        mutationFn: (requestId: number) =>
            apiRequest("POST", `/api/wfm/absence-requests/${requestId}/approve`),
        onSuccess: () => {
            toast({ title: "Success", description: "Request approved" });
            queryClient.invalidateQueries({ queryKey: ["/api/wfm/absence-requests"] });
        },
    });

    return (
        <StandardPage title="Absence Management">
            <div>

                <p className="text-muted-foreground">Leave requests and approvals</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Request Time Off</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Leave Type</label>
                            <Select value={leaveType} onValueChange={setLeaveType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="VACATION">Vacation</SelectItem>
                                    <SelectItem value="SICK">Sick Leave</SelectItem>
                                    <SelectItem value="PERSONAL">Personal</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Start Date</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {startDate ? format(startDate, "PPP") : "Pick a date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div>
                                <label className="text-sm font-medium">End Date</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {endDate ? format(endDate, "PPP") : "Pick a date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Reason</label>
                            <Textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Enter reason for absence..."
                                rows={3}
                            />
                        </div>
                        <Button
                            className="w-full"
                            onClick={() => submitMutation.mutate({ leaveType, startDate, endDate, reason })}
                            disabled={submitMutation.isPending || !leaveType || !startDate || !endDate}
                        >
                            Submit Request
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Pending Requests ({requests?.length || 0})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
                        {requests?.map((request: any) => (
                            <div key={request.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-medium">{request.employeeName}</div>
                                        <div className="text-sm text-muted-foreground">{request.leaveType}</div>
                                        <div className="text-sm mt-1">
                                            {format(new Date(request.startDate), "MMM d")} - {format(new Date(request.endDate), "MMM d, yyyy")}
                                        </div>
                                    </div>
                                    <Badge>{request.days} days</Badge>
                                </div>
                                <div className="flex gap-2 mt-3">
                                    <Button size="sm" onClick={() => approveMutation.mutate(request.id)}>
                                        <Check className="h-3 w-3 mr-1" />
                                        Approve
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        <X className="h-3 w-3 mr-1" />
                                        Deny
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
