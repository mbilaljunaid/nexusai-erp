import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Loader2 } from "lucide-react";

interface Project {
    id: string;
    name: string;
    description: string;
    status: string;
    startDate: string;
    endDate: string;
}

export function ProjectList() {
    const [search, setSearch] = useState("");
    const tenantId = "tenant-1";

    const { data: projects = [], isLoading } = useQuery<Project[]>({
        queryKey: [`/api/erp/${tenantId}/projects`],
    });

    const createProjectMutation = useMutation({
        mutationFn: async (newProj: Partial<Project>) => {
            return apiRequest("POST", `/api/erp/${tenantId}/projects`, newProj);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/erp/${tenantId}/projects`] });
        },
    });

    const handleCreateMockProject = () => {
        createProjectMutation.mutate({
            name: `Project ${Math.floor(Math.random() * 100)}`,
            description: "Implementation of ERP module",
            status: "PLANNED",
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 86400000 * 90).toISOString().split('T')[0],
        });
    };

    if (isLoading) return <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Active Projects</h2>
                <Button onClick={handleCreateMockProject} disabled={createProjectMutation.isPending}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="relative max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search projects..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Project Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map((proj) => (
                                <TableRow key={proj.id}>
                                    <TableCell className="font-medium">{proj.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={proj.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                            {proj.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{proj.startDate}</TableCell>
                                    <TableCell>{proj.endDate}</TableCell>
                                </TableRow>
                            ))}
                            {projects.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No projects found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
