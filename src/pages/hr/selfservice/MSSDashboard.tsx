import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
   Users,
   UserPlus,
   BarChart3,
   ClipboardCheck,
   AlertCircle,
   ChevronRight,
   Target,
   CalendarDays,
   Network,
   TrendingUp,
   ArrowUpRight,
   MoreHorizontal,
   ExternalLink,
   Banknote,
   Zap as ZapIcon,
   FileDown,
   ShieldCheck,
   Zap
} from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { OrgChart } from "@/components/hr/OrgChart";
import { WorkforceAnalyticsCard } from "@/components/hr/WorkforceAnalyticsCard";
import ActionWizard from "@/components/hr/ActionWizard";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { StandardPage } from "@/components/layout/StandardPage";
import { useToast } from "@/hooks/use-toast";

export default function MSSDashboard() {
   const { toast } = useToast();
   const [isActionOpen, setIsActionOpen] = React.useState(false);
   const [actionType, setActionType] = React.useState<"TRANSFER" | "PROMOTE" | "TERMINATE" | "SALARY_CHANGE" | null>(null);
   const [selectedEmployeeName, setSelectedEmployeeName] = React.useState("Direct Report");

   const { data: orgData } = useQuery<any[]>({
      queryKey: ["/api/hr-self-service/organization/chart"],
   });

   const { data: teamDocs } = useQuery<any[]>({
      queryKey: ["/api/hr-self-service/team/performance"],
   });

   const { data: analytics } = useQuery<any>({
      queryKey: ["/api/hr-self-service/team/analytics"],
   });

   const teamStats = [
      { label: "Total Team", value: "12", icon: Users, color: "text-blue-500" },
      { label: "Pending Approvals", value: "3", icon: AlertCircle, color: "text-red-500" },
      { label: "Active Requisitions", value: "2", icon: UserPlus, color: "text-green-500" },
      { label: "Retention Risk", value: "Low", icon: BarChart3, color: "text-teal-500" },
   ];

   const teamMembers = [
      { name: "Alice Smith", role: "Product Designer", status: "In Office", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100" },
      { name: "Bob Johnson", role: "Frontend Dev", status: "On Leave", avatar: "" },
      { name: "Carol White", role: "Backend Dev", status: "Remote", avatar: "" },
   ];

   return (
      <StandardPage
         title="My Team"
         description="Manage your directs, approvals, and hiring."
         actions={
            <div className="flex gap-3">
               <Button variant="outline" className="border-teal-500/20 text-teal-600 hover:bg-teal-500/5">
                  <UserPlus className="h-4 w-4 mr-2" /> Request Requisition
               </Button>
               <Button
                  className="bg-teal-600 hover:bg-teal-700"
                  onClick={() => {
                     setSelectedEmployeeName("Team Member");
                     setActionType("TRANSFER");
                     setIsActionOpen(true);
                  }}
               >
                  <ArrowUpRight className="h-4 w-4 mr-2" /> Quick Transfer
               </Button>
            </div>
         }
      >
         <div className="space-y-8 pb-12">

            <ActionWizard
               isOpen={isActionOpen}
               onClose={() => setIsActionOpen(false)}
               actionType={actionType}
               employeeName={selectedEmployeeName}
               onComplete={(data) => {
                  console.log("Action Wizard Completed:", data);
                  // Here you would typically invalidate queries or show a success toast
               }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               {teamStats.map((stat, i) => (
                  <Card key={i} className="border-none shadow-sm bg-background/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50">
                     <CardContent className="p-6 flex items-center justify-between">
                        <div>
                           <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                           <p className="text-2xl font-bold">{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 ${stat.color}`}>
                           <stat.icon className="h-6 w-6" />
                        </div>
                     </CardContent>
                  </Card>
               ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 space-y-6">
                  <Tabs defaultValue="list" className="w-full">
                     <div className="flex items-center justify-between mb-4">
                        <TabsList className="bg-zinc-100/50 dark:bg-zinc-800/50 p-1">
                           <TabsTrigger value="list" className="flex items-center gap-2">
                              <Users className="h-4 w-4" /> Team List
                           </TabsTrigger>
                           <TabsTrigger value="org" className="flex items-center gap-2">
                              <Network className="h-4 w-4" /> Org Chart
                           </TabsTrigger>
                           <TabsTrigger value="perf" className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" /> Performance
                           </TabsTrigger>
                        </TabsList>
                     </div>

                     <TabsContent value="list">
                        <Card className="border-zinc-200/50 dark:border-zinc-800/50 shadow-md">
                           <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-50 dark:border-zinc-900">
                              <CardTitle className="text-xl flex items-center gap-2">
                                 <Users className="h-5 w-5 text-teal-600" /> Direct Reports
                              </CardTitle>
                              <Button variant="ghost" size="sm" className="text-teal-600">Quick Filters</Button>
                           </CardHeader>
                           <CardContent className="p-0">
                              <div className="divide-y divide-zinc-50 dark:divide-zinc-900">
                                 {(teamDocs || teamMembers).map((member, i) => (
                                    <div key={i} className="flex items-center justify-between p-6 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                                       <div className="flex items-center gap-4">
                                          <Avatar className="h-12 w-12 border border-zinc-200 dark:border-zinc-800 font-bold bg-teal-500/10 text-teal-600">
                                             <AvatarImage src={member.avatar} />
                                             <AvatarFallback>{member.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                                          </Avatar>
                                          <div>
                                             <p className="font-semibold">{member.name}</p>
                                             <p className="text-sm text-muted-foreground">{member.role || "Direct Report"}</p>
                                          </div>
                                       </div>
                                       <div className="flex items-center gap-6">
                                          <div className="text-right hidden sm:block">
                                             <p className="text-sm font-medium">{member.status || "Active"}</p>
                                             <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tight py-0 text-teal-600 border-teal-600/20">Active</Badge>
                                          </div>
                                          <DropdownMenu>
                                             <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                   <MoreHorizontal className="h-5 w-5 text-zinc-400" />
                                                </Button>
                                             </DropdownMenuTrigger>
                                             <DropdownMenuContent align="end" className="w-56">
                                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50 rounded-t-sm">
                                                   Quick Actions
                                                </div>
                                                <DropdownMenuItem
                                                   className="gap-2 cursor-pointer"
                                                   onClick={() => {
                                                      setSelectedEmployeeName(member.name);
                                                      setActionType("PROMOTE");
                                                      setIsActionOpen(true);
                                                   }}
                                                >
                                                   <TrendingUp className="h-4 w-4 text-teal-600" /> Promote
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                   className="gap-2 cursor-pointer"
                                                   onClick={() => {
                                                      setSelectedEmployeeName(member.name);
                                                      setActionType("TRANSFER");
                                                      setIsActionOpen(true);
                                                   }}
                                                >
                                                   <ArrowUpRight className="h-4 w-4 text-blue-600" /> Transfer
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                   className="gap-2 cursor-pointer"
                                                   onClick={() => {
                                                      setSelectedEmployeeName(member.name);
                                                      setActionType("SALARY_CHANGE");
                                                      setIsActionOpen(true);
                                                   }}
                                                >
                                                   <Banknote className="h-4 w-4 text-green-600" /> Change Salary
                                                </DropdownMenuItem>

                                                <div className="my-1 border-t border-muted" />

                                                <DropdownMenuItem className="gap-2">
                                                   <ExternalLink className="h-4 w-4" /> View Full Profile
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-2 text-primary" onClick={() => window.open(`/api/hr-self-service/me/documents/verification/pdf`, '_blank')}>
                                                   <ShieldCheck className="h-4 w-4" /> Verify Employment
                                                </DropdownMenuItem>
                                             </DropdownMenuContent>
                                          </DropdownMenu>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </CardContent>
                        </Card>
                     </TabsContent>

                     <TabsContent value="org">
                        <Card>
                           <CardHeader>
                              <CardTitle>Supervisory Hierarchy</CardTitle>
                              <CardDescription>Interactive organization chart based on assignments.</CardDescription>
                           </CardHeader>
                           <CardContent className="max-h-[600px] overflow-auto">
                              {orgData ? <OrgChart data={orgData} /> : <div className="p-12 text-center text-muted-foreground italic">Loading hierarchy...</div>}
                           </CardContent>
                        </Card>
                     </TabsContent>

                     <TabsContent value="perf">
                        <Card>
                           <CardHeader>
                              <CardTitle>Team Performance Summary</CardTitle>
                              <CardDescription>Overview of goal completion and current ratings.</CardDescription>
                           </CardHeader>
                           <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {teamDocs?.map((perf: any) => (
                                    <div key={perf.personId} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                                       <div className="flex justify-between items-start mb-4">
                                          <div>
                                             <p className="font-semibold">{perf.name}</p>
                                             <p className="text-xs text-muted-foreground">{perf.status}</p>
                                          </div>
                                          <Badge variant="secondary" className="bg-teal-500/10 text-teal-600 border-none">Rating: {perf.rating}</Badge>
                                       </div>
                                       <div className="space-y-2">
                                          <div className="flex justify-between text-xs">
                                             <span>Goal Completion</span>
                                             <span>{perf.goalsCompletion}%</span>
                                          </div>
                                          <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                             <div className="bg-teal-500 h-full transition-all duration-500" style={{ width: `${perf.goalsCompletion}%` }} />
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </CardContent>
                        </Card>
                     </TabsContent>
                  </Tabs>
               </div>

               <div className="space-y-6">
                  <WorkforceAnalyticsCard
                     metrics={analytics?.metrics}
                     skillGaps={analytics?.skillGaps}
                  />

                  <Card className="border-dashed border-2 border-zinc-200 dark:border-zinc-800 bg-transparent">
                     <CardHeader>
                        <CardTitle className="text-lg font-medium text-muted-foreground flex items-center gap-2">
                           <CalendarDays className="h-5 w-5" /> Team Calendar
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <p className="text-sm text-center text-muted-foreground py-8 italic">No upcoming absences this week.</p>
                     </CardContent>
                  </Card>

                  <Card className="bg-teal-600 text-white border-none shadow-lg overflow-hidden relative">
                     <Zap className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
                     <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                           <ZapIcon className="h-5 w-5 fill-white" /> Productivity Actions
                        </CardTitle>
                        <CardDescription className="text-teal-100">Tier-1 Manager utilities</CardDescription>
                     </CardHeader>
                     <CardContent className="grid gap-2 relative z-10">
                        <Button
                           variant="secondary"
                           size="sm"
                           className="w-full justify-start bg-white/20 hover:bg-white/30 border-none text-white"
                           onClick={async () => {
                              const res = await fetch('/api/hr-self-service/admin/workflow/escalate', { method: 'POST' });
                              const data = await res.json();
                              toast({ description: `Escalated ${data.escalatedCount} pending approvals to the next level.` });
                           }}
                        >
                           <ShieldCheck className="h-4 w-4 mr-2" /> Escalate Stalled Approvals
                        </Button>
                        <Button
                           variant="secondary"
                           size="sm"
                           className="w-full justify-start bg-white/20 hover:bg-white/30 border-none text-white"
                        >
                           <FileDown className="h-4 w-4 mr-2" /> Batch Export Team Payslips
                        </Button>
                     </CardContent>
                  </Card>
               </div>
            </div>
         </div>
      </StandardPage>
   );
}
