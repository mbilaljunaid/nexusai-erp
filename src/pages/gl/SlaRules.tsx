import { useState, useEffect } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JournalLineRuleTable } from "@/components/sla/JournalLineRuleTable";

interface EventClass {
    id: string;
    name: string;
    description?: string;
}

export default function SlaRules() {
    const [eventClasses, setEventClasses] = useState<EventClass[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>("");

    useEffect(() => {
        fetch("/api/sla/event-classes")
            .then(res => res.json())
            .then(data => {
                setEventClasses(data);
                if (data.length > 0) setSelectedClassId(data[0].id);
            });
    }, []);

    return (
        <StandardPage
            title="SLA Configuration Rules"
            description="Manage Accounting Methods, Journal Line Types, and Event Models."
            actions={
                <a href="/gl/config/sla/adr">
                    <Button variant="outline">Manage Account Derivation Rules (ADR)</Button>
                </a>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Select Event Class</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Event Class" />
                            </SelectTrigger>
                            <SelectContent>
                                {eventClasses.map(cls => (
                                    <SelectItem key={cls.id} value={cls.id}>
                                        {cls.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="mt-4 text-xs text-muted-foreground p-2 bg-muted rounded">
                            Select an object (e.g., AP Invoice) to configure its accounting templates.
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle>Journal Line Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {selectedClassId ? (
                            <JournalLineRuleTable eventClassId={selectedClassId} />
                        ) : (
                            <div className="flex h-40 items-center justify-center text-muted-foreground">
                                Select an Event Class to view rules.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
