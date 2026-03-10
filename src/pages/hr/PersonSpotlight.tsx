import React from "react";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { useNexusAI } from "@/contexts/NexusAIContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { User, Briefcase, DollarSign, CalendarHeart, Target, Award, MapPin, Mail, Phone } from "lucide-react";

export default function PersonSpotlight() {
    const personId = "default-person"; // Ideally selected from a list

    // Fetch Spotlight Data (Aggregated profile)
    const { data: profile, isLoading } = useQuery<any>({
        queryKey: ["hcm-person-spotlight", personId],
        queryFn: async () => {
            // Mock response simulating a 360 aggregated backend view
            return {
                person: {
                    firstName: "Jane",
                    lastName: "Doe",
                    personNumber: "EMP-10042",
                    email: "jane.doe@nexusai.com",
                    phone: "+1 (555) 123-4567",
                    position: "Senior Software Engineer",
                    department: "Engineering",
                    location: "San Francisco, CA",
                    manager: "John Smith",
                    hireDate: "2022-03-15",
                    status: "ACTIVE"
                },
                employment: {
                    legalEmployer: "NexusAI US Corp",
                    businessUnit: "US Technology Division",
                    grade: "IC4",
                    fte: 1.0,
                    workerType: "Employee"
                },
                compensation: {
                    salary: "$165,000",
                    currency: "USD",
                    lastIncrease: "2025-01-01",
                    bonusTarget: "15%",
                    compaRatio: 1.05
                },
                performance: {
                    latestRating: "Exceeds Expectations",
                    ratingYear: "2025",
                    activeGoals: 4,
                    completedGoals: 12
                },
                absence: {
                    vacationBalance: "120 Hours",
                    sickBalance: "48 Hours",
                    upcomingLeave: null
                }
            };
        }
    });

    if (isLoading) return <StandardPage title="Person Spotlight"><TableSkeleton rows={8} /></StandardPage>;

    return (
        <StandardPage title="Person Spotlight">
            <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="flex-shrink-0">
                    <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary">
                        {profile?.person.firstName[0]}{profile?.person.lastName[0]}
                    </div>
                </div>
                <div className="flex bg-card p-6 flex-1 rounded-xl border border-border justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">{profile?.person.firstName} {profile?.person.lastName}</h1>
                        <p className="text-lg text-muted-foreground flex items-center gap-2 mt-1">
                            <Briefcase className="h-4 w-4" /> {profile?.person.position}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {profile?.person.location}</span>
                            <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {profile?.person.email}</span>
                            <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> {profile?.person.phone}</span>
                            <span className="flex items-center gap-1 text-foreground font-medium"><User className="h-4 w-4 text-muted-foreground" /> Mgr: {profile?.person.manager}</span>
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <Badge variant="default" className="text-sm mb-2">{profile?.person.status}</Badge>
                        <p className="text-sm text-muted-foreground">ID: {profile?.person.personNumber}</p>
                        <p className="text-sm text-muted-foreground">Tenure: Since {profile?.person.hireDate}</p>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="employment" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="employment">Employment info</TabsTrigger>
                    <TabsTrigger value="compensation">Compensation</TabsTrigger>
                    <TabsTrigger value="performance">Performance & Goals</TabsTrigger>
                    <TabsTrigger value="absence">Absence</TabsTrigger>
                </TabsList>

                <TabsContent value="employment">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assignment Details</CardTitle>
                            <CardDescription>Current active work relationship and assignment.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Legal Employer</p>
                                <p className="font-medium">{profile?.employment.legalEmployer}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Business Unit</p>
                                <p className="font-medium">{profile?.employment.businessUnit}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Department</p>
                                <p className="font-medium">{profile?.person.department}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Worker Type</p>
                                <p className="font-medium">{profile?.employment.workerType}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Grade</p>
                                <p className="font-medium">{profile?.employment.grade}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">FTE (Full Time Equivalent)</p>
                                <p className="font-medium">{profile?.employment.fte}</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="compensation">
                    <Card>
                        <CardHeader>
                            <CardTitle>Compensation Summary</CardTitle>
                            <CardDescription>Current salary, compa-ratio, and bonus targets.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="bg-muted/30 p-4 rounded-xl border border-border">
                                <DollarSign className="h-5 w-5 text-emerald-600 mb-2" />
                                <p className="text-xs text-muted-foreground mb-1">Annual Salary</p>
                                <p className="font-bold text-xl">{profile?.compensation.salary} <span className="text-sm font-normal text-muted-foreground">{profile?.compensation.currency}</span></p>
                            </div>
                            <div className="bg-muted/30 p-4 rounded-xl border border-border">
                                <Award className="h-5 w-5 text-purple-600 mb-2" />
                                <p className="text-xs text-muted-foreground mb-1">Bonus Target</p>
                                <p className="font-bold text-xl">{profile?.compensation.bonusTarget}</p>
                            </div>
                            <div className="bg-muted/30 p-4 rounded-xl border border-border">
                                <Target className="h-5 w-5 text-blue-600 mb-2" />
                                <p className="text-xs text-muted-foreground mb-1">Compa-Ratio</p>
                                <p className="font-bold text-xl">{profile?.compensation.compaRatio}</p>
                            </div>
                            <div className="bg-muted/30 p-4 rounded-xl border border-border">
                                <CalendarHeart className="h-5 w-5 text-rose-600 mb-2" />
                                <p className="text-xs text-muted-foreground mb-1">Last Increase</p>
                                <p className="font-bold text-xl">{profile?.compensation.lastIncrease}</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="performance">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Latest Review ({profile?.performance.ratingYear})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-primary">{profile?.performance.latestRating}</div>
                                <p className="text-sm text-muted-foreground mt-2">Overall Performance Rating</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Active Goals</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{profile?.performance.activeGoals} <span className="text-sm font-normal text-muted-foreground">In Progress</span></div>
                                <p className="text-sm text-muted-foreground mt-2">{profile?.performance.completedGoals} goals completed historically.</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="absence">
                    <Card>
                        <CardHeader>
                            <CardTitle>Time Off Balances</CardTitle>
                            <CardDescription>Accrued and available time off.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Vacation Balance</p>
                                <p className="font-bold text-lg">{profile?.absence.vacationBalance}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Sick Balance</p>
                                <p className="font-bold text-lg">{profile?.absence.sickBalance}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Upcoming Leave</p>
                                <p className="font-medium text-lg">{profile?.absence.upcomingLeave || "None Scheduled"}</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </StandardPage>
    );
}
