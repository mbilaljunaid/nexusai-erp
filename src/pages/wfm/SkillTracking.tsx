import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { Award, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function SkillTracking() {
    const [searchTerm, setSearchTerm] = useState("");

    const { data: employees } = useQuery({
        queryKey: ["/api/wfm/employees-with-skills", searchTerm],
        queryFn: () => apiRequest(`/api/wfm/employees-with-skills?search=${searchTerm}`),
    });

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Skill Tracking & Certification</h1>
                <p className="text-muted-foreground">Employee competencies and certifications</p>
            </div>

            <div className="flex gap-4">
                <div className="flex-1">
                    <Input
                        placeholder="Search employees or skills..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                    />
                </div>
                <Button variant="outline">
                    <Search className="h-4 w-4 mr-2" />
                    Advanced Search
                </Button>
            </div>

            <div className="space-y-4">
                {employees?.map((employee: any) => (
                    <Card key={employee.id}>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Award className="h-5 w-5 text-primary" />
                                        <div className="font-semibold text-lg">{employee.name}</div>
                                        <Badge>{employee.title}</Badge>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium mb-2">Skills</div>
                                        <div className="flex flex-wrap gap-2">
                                            {employee.skills?.map((skill: any) => (
                                                <Badge key={skill.id} variant="outline">
                                                    {skill.name} - Level {skill.level}/5
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <div className="text-sm font-medium mb-2">Certifications</div>
                                        <div className="flex flex-wrap gap-2">
                                            {employee.certifications?.map((cert: any) => (
                                                <Badge
                                                    key={cert.id}
                                                    className={cert.isExpiringSoon ? "bg-orange-100 text-orange-700" : ""}
                                                >
                                                    {cert.name}
                                                    {cert.expiryDate && ` (Exp: ${new Date(cert.expiryDate).toLocaleDateString()})`}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <Button size="sm">View Profile</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
