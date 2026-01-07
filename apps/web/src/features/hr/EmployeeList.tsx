import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Loader2 } from "lucide-react";

interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    department: string;
    status: string;
    joinDate: string;
}

export function EmployeeList() {
    const [search, setSearch] = useState("");
    const tenantId = "tenant-1";

    const { data: employees = [], isLoading } = useQuery<Employee[]>({
        queryKey: [`/api/erp/${tenantId}/hr/employees`],
    });

    const createEmployeeMutation = useMutation({
        mutationFn: async (newEmp: Partial<Employee>) => {
            return apiRequest("POST", `/api/erp/${tenantId}/hr/employees`, newEmp);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/erp/${tenantId}/hr/employees`] });
        },
    });

    const handleCreateMockEmployee = () => {
        createEmployeeMutation.mutate({
            firstName: `John`,
            lastName: `Doe ${Math.floor(Math.random() * 100)}`,
            department: "Engineering",
            status: "ACTIVE",
            joinDate: new Date().toISOString().split('T')[0],
        });
    };

    if (isLoading) return <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">HR: Employees</h1>
                <Button onClick={handleCreateMockEmployee} disabled={createEmployeeMutation.isPending}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Employee
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="relative max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search employees..."
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
                                <TableHead>Name</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Join Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees.filter(e => e.lastName.toLowerCase().includes(search.toLowerCase())).map((emp) => (
                                <TableRow key={emp.id}>
                                    <TableCell className="font-medium">{emp.firstName} {emp.lastName}</TableCell>
                                    <TableCell>{emp.department}</TableCell>
                                    <TableCell>
                                        <Badge variant={emp.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                            {emp.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{emp.joinDate}</TableCell>
                                </TableRow>
                            ))}
                            {employees.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No employees found
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
