import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocationsTab } from "./LocationsTab";
import { OrganizationsTab } from "./OrganizationsTab";
import { LegalEmployersTab } from "./LegalEmployersTab";
import { JobsTab } from "./JobsTab";
import { GradesTab } from "./GradesTab";
import { PositionsTab } from "./PositionsTab";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function WorkforceStructures() {
    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold tracking-tight">Workforce Structures</h2>
                <p className="text-muted-foreground">
                    Define and manage the foundational structures of your enterprise, including locations, organizations, jobs, grades, and positions.
                </p>
            </div>

            <Tabs defaultValue="locations" className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto">
                    <TabsTrigger value="locations">Locations</TabsTrigger>
                    <TabsTrigger value="organizations">Organizations</TabsTrigger>
                    <TabsTrigger value="legal-employers">Legal Employers</TabsTrigger>
                    <TabsTrigger value="jobs">Jobs</TabsTrigger>
                    <TabsTrigger value="grades">Grades</TabsTrigger>
                    <TabsTrigger value="positions">Positions</TabsTrigger>
                </TabsList>

                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle>Manage Structures</CardTitle>
                        <CardDescription>View, create, and update structure definitions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TabsContent value="locations">
                            <LocationsTab />
                        </TabsContent>
                        <TabsContent value="organizations">
                            <OrganizationsTab />
                        </TabsContent>
                        <TabsContent value="legal-employers">
                            <LegalEmployersTab />
                        </TabsContent>
                        <TabsContent value="jobs">
                            <JobsTab />
                        </TabsContent>
                        <TabsContent value="grades">
                            <GradesTab />
                        </TabsContent>
                        <TabsContent value="positions">
                            <PositionsTab />
                        </TabsContent>
                    </CardContent>
                </Card>
            </Tabs>
        </div>
    );
}
