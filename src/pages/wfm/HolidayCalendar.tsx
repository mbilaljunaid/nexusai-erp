
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from "@/components/layout/StandardPage";


const MOCK_TENANT_ID = "test-tenant-wfm-001";

export default function HolidayCalendar() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [filterCountry, setFilterCountry] = useState("US");
    const [newHoliday, setNewHoliday] = useState({ date: "", name: "", countryCode: "US" });

    // 1. Fetch Holidays
    const { data: holidays, isLoading } = useQuery({
        queryKey: ["holidays", filterCountry],
        queryFn: async () => {
            const res = await fetch(`/api/wfm/holidays?tenantId=${MOCK_TENANT_ID}&countryCode=${filterCountry}`);
            if (!res.ok) throw new Error("Failed to fetch holidays");
            return res.json();
        }
    });

    // 2. Add Mutation
    const addHolidayMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/wfm/holidays", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newHoliday, tenantId: MOCK_TENANT_ID })
            });
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["holidays"] });
            toast({ title: "Holiday Added" });
            setNewHoliday({ ...newHoliday, name: "" }); // Reset name
        }
    });

    return (
        <StandardPage title="Public Holiday Calendar">
            <div className="flex justify-between items-center">
                
                <Select value={filterCountry} onValueChange={setFilterCountry}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="US">United States (US)</SelectItem>
                        <SelectItem value="UK">United Kingdom (UK)</SelectItem>
                        <SelectItem value="AE">United Arab Emirates (AE)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* LIST View */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Upcoming Holidays ({filterCountry})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading ? <p>Loading...</p> :
                            holidays?.length > 0 ? (
                                <div className="space-y-2">
                                    {holidays.map((h: any) => (
                                        <div key={h.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50">
                                            <div className="flex gap-4 items-center">
                                                <Badge variant="outline" className="w-24 justify-center">{h.date}</Badge>
                                                <span className="font-medium">{h.name}</span>
                                            </div>
                                            <Badge>{h.countryCode}</Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-muted-foreground">No holidays defined for this country.</p>
                        }
                    </CardContent>
                </Card>

                {/* ADD Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Add Holiday</CardTitle>
                        <CardDescription>Define a mandatory public holiday.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input
                                value={newHoliday.name}
                                onChange={e => setNewHoliday({ ...newHoliday, name: e.target.value })}
                                placeholder="e.g. Independence Day"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date</label>
                            <Input
                                type="date"
                                value={newHoliday.date}
                                onChange={e => setNewHoliday({ ...newHoliday, date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Country</label>
                            <Select value={newHoliday.countryCode} onValueChange={v => setNewHoliday({ ...newHoliday, countryCode: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="US">US</SelectItem>
                                    <SelectItem value="UK">UK</SelectItem>
                                    <SelectItem value="AE">AE</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            className="w-full"
                            onClick={() => addHolidayMutation.mutate()}
                            disabled={!newHoliday.name || !newHoliday.date || addHolidayMutation.isPending}
                        >
                            {addHolidayMutation.isPending ? "Adding..." : "Add Holiday"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
