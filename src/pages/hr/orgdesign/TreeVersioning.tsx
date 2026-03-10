import React from 'react';
import { StandardPage } from '@/components/layout/StandardPage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { History, GitCommit, GitBranch } from 'lucide-react';

export default function TreeVersioning() {
    const { toast } = useToast();

    const handleRestore = () => {
        toast({
            title: "Version Restored",
            description: "The organizational structure tree has been rolled back."
        });
    };

    return (
        <StandardPage
            title="Workforce Tree Versioning"
            description="Manage and audit historical states of the organizational reporting hierarchy using DateTrack versions."
        >
            <Card>
                <CardHeader>
                    <CardTitle>Department Hierarchy Tree Versions</CardTitle>
                    <CardDescription>Track complete structural re-organizations and effective dates</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tree Name</TableHead>
                                <TableHead>Version ID</TableHead>
                                <TableHead>Effective Date Range</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Change Summary</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className="bg-muted/30">
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <GitCommit className="h-4 w-4 text-primary" />
                                        Global Enterprise Depts
                                    </div>
                                </TableCell>
                                <TableCell>v4.0.0</TableCell>
                                <TableCell>Jan 01, 2026 – End of Time</TableCell>
                                <TableCell><Badge variant="default">Active</Badge></TableCell>
                                <TableCell className="text-sm text-muted-foreground">Consolidated APAC and EMEA IT into Global Tech</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">View</Button>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <GitBranch className="h-4 w-4 text-muted-foreground" />
                                        Global Enterprise Depts
                                    </div>
                                </TableCell>
                                <TableCell>v3.1.2</TableCell>
                                <TableCell>Oct 15, 2025 – Dec 31, 2025</TableCell>
                                <TableCell><Badge variant="outline">Historic</Badge></TableCell>
                                <TableCell className="text-sm text-muted-foreground">Added New Product Division node under CEO</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={handleRestore}>Restore</Button>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <GitBranch className="h-4 w-4 text-muted-foreground" />
                                        Global Enterprise Depts
                                    </div>
                                </TableCell>
                                <TableCell>v3.0.0</TableCell>
                                <TableCell>Jan 01, 2024 – Oct 14, 2025</TableCell>
                                <TableCell><Badge variant="outline">Historic</Badge></TableCell>
                                <TableCell className="text-sm text-muted-foreground">Initial IPO restructuring tree</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">View</Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
