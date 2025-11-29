import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Heart, DollarSign, Users, BookOpen, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { BenefitsPlan, PayrollConfig, SuccessionPlan, LearningPath, CompensationPlan } from "@shared/schema";

export default function HRAdvanced() {
  const { data: benefits = [] } = useQuery<BenefitsPlan[]>({ queryKey: ["/api/hr/benefits-plans"] });
  const { data: payroll = [] } = useQuery<PayrollConfig[]>({ queryKey: ["/api/hr/payroll-configs"] });
  const { data: succession = [] } = useQuery<SuccessionPlan[]>({ queryKey: ["/api/hr/succession-plans"] });
  const { data: learning = [] } = useQuery<LearningPath[]>({ queryKey: ["/api/hr/learning-paths"] });
  const { data: compensation = [] } = useQuery<CompensationPlan[]>({ queryKey: ["/api/hr/compensation-plans"] });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Advanced HR Features</h1>
        <p className="text-muted-foreground">Benefits, payroll, succession, learning, compensation</p>
      </div>

      <Tabs defaultValue="benefits" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="succession">Succession</TabsTrigger>
          <TabsTrigger value="learning">Learning</TabsTrigger>
          <TabsTrigger value="compensation">Compensation</TabsTrigger>
        </TabsList>

        <TabsContent value="benefits">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Benefits Administration
              </CardTitle>
              <CardDescription>Health, dental, vision, retirement, PTO plans</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="mb-4"><Plus className="w-4 h-4 mr-2" />Add Plan</Button>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                {benefits.map((plan) => (
                  <Card key={plan.id} className="border">
                    <CardContent className="pt-4 text-sm">
                      <div className="space-y-2">
                        <strong>{plan.name}</strong>
                        <Badge variant="outline">{plan.benefitType}</Badge>
                        {plan.providerName && <div>Provider: {plan.providerName}</div>}
                        {plan.costPerEmployee && <div>Cost/Emp: ${plan.costPerEmployee}</div>}
                        {plan.employeeContribution && <div>Employee: ${plan.employeeContribution}</div>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {benefits.length === 0 && <p className="text-muted-foreground col-span-3 text-center py-8">No benefits plans</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Payroll Configuration
              </CardTitle>
              <CardDescription>Tax rates, minimum wage, pay frequency by country</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="mb-4"><Plus className="w-4 h-4 mr-2" />Add Config</Button>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {payroll.map((config) => (
                  <Card key={config.id} className="border">
                    <CardContent className="pt-4 text-sm">
                      <div className="space-y-2">
                        <strong className="text-base">{config.country}</strong>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Fed Tax: {config.federalTaxRate}%</div>
                          <div>State Tax: {config.stateTaxRate}%</div>
                          <div>SS: {config.socialSecurityRate}%</div>
                          <div>Medicare: {config.medicareRate}%</div>
                        </div>
                        <div>Min Wage: ${config.minimumWage}</div>
                        <Badge variant="outline">{config.payFrequency}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {payroll.length === 0 && <p className="text-muted-foreground text-center py-8">No payroll configs</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="succession">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Succession Planning
              </CardTitle>
              <CardDescription>Critical role identification and talent development</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="mb-4"><Plus className="w-4 h-4 mr-2" />Create Plan</Button>
              <div className="space-y-2">
                {succession.map((plan) => (
                  <Card key={plan.id} className="border">
                    <CardContent className="pt-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <strong>Position: {plan.positionId}</strong>
                          <Badge>{plan.criticalityLevel}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>Readiness: {plan.readinessPercent}%</div>
                          <div>Successors: {[plan.successor1Id, plan.successor2Id, plan.successor3Id].filter(Boolean).length}</div>
                          <div>{plan.status}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {succession.length === 0 && <p className="text-muted-foreground text-center py-8">No succession plans</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Learning Paths
              </CardTitle>
              <CardDescription>Career development and skills training</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="mb-4"><Plus className="w-4 h-4 mr-2" />Create Path</Button>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                {learning.map((path) => (
                  <Card key={path.id} className="border">
                    <CardContent className="pt-4 text-sm">
                      <div className="space-y-2">
                        <strong>{path.name}</strong>
                        <div className="w-full bg-secondary h-2 rounded-full">
                          <div className="bg-primary h-2 rounded-full" style={{width: `${path.progressPercent}%`}}></div>
                        </div>
                        <div className="flex justify-between text-xs">
                          <div>Progress: {path.progressPercent}%</div>
                          <div>{path.courseIds?.length || 0} courses</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {learning.length === 0 && <p className="text-muted-foreground col-span-3 text-center py-8">No learning paths</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compensation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Compensation Plans
              </CardTitle>
              <CardDescription>Salary, bonus, stock options, performance incentives</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="mb-4"><Plus className="w-4 h-4 mr-2" />Create Plan</Button>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                {compensation.map((plan) => (
                  <Card key={plan.id} className="border">
                    <CardContent className="pt-4 text-sm">
                      <div className="space-y-2">
                        <div className="text-lg font-bold text-primary">${plan.baseSalary}</div>
                        <div className="space-y-1 text-xs">
                          {plan.bonusPercentage && <div>Bonus: {plan.bonusPercentage}%</div>}
                          {plan.stockOptions && <div>Stock: ${plan.stockOptions}</div>}
                          {plan.performanceBonus && <div>Perf Bonus: ${plan.performanceBonus}</div>}
                        </div>
                        <Badge variant="outline">{plan.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {compensation.length === 0 && <p className="text-muted-foreground col-span-3 text-center py-8">No compensation plans</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
