import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Download, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BulkTimeEntry() {
    const [entries, setEntries] = useState([
        { date: "2026-02-10", hours: 8, project: "P001" },
        { date: "2026-02-11", hours: 7.5, project: "P001" },
    ]);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Bulk Time Entry</h1>
                    <p className="text-muted-foreground">Spreadsheet-style time entry with templates</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Import
                    </Button>
                    <Button>
                        <Download className="h-4 w-4 mr-2" />
                        Save
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Time Entries</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="text-left p-3">Date</th>
                                    <th className="text-left p-3">Project</th>
                                    <th className="text-right p-3">Hours</th>
                                    <th className="text-left p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map((entry, i) => (
                                    <tr key={i} className="border-t">
                                        <td className="p-3">{entry.date}</td>
                                        <td className="p-3">{entry.project}</td>
                                        <td className="p-3 text-right">{entry.hours}</td>
                                        <td className="p-3">
                                            <Badge variant="secondary">Pending</Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
