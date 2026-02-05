import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Users, Package, TrendingUp, Database } from 'lucide-react';
import { Header, Footer } from "@/components/Navigation";
import { Breadcrumbs } from '@/components/Breadcrumbs';

interface ProcessFlowStep {
  label: string;
  description: string;
}

interface ModuleMapping {
  module: string;
  forms: string[];
  impact: string;
}

interface PublicProcessPageTemplateProps {
  processName: string;
  processCode: string;
  criticality: 'CRITICAL' | 'HIGH';
  category: string;
  cycletime: string;
  description: string;
  flowSteps: ProcessFlowStep[];
  moduleMappings: ModuleMapping[];
  keyBenefits: string[];
  glAccounts: string[];
  children?: React.ReactNode;
}

export function PublicProcessPageTemplate({
  processName,
  processCode,
  criticality,
  category,
  cycletime,
  description,
  flowSteps,
  moduleMappings,
  keyBenefits,
  glAccounts,
  children
}: PublicProcessPageTemplateProps) {
  const criticalityColor = criticality === 'CRITICAL' ? 'text-red-600 font-bold' : 'text-orange-600 font-bold';
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <Breadcrumbs items={[{ label: 'Processes', path: '/public/processes' }, { label: processName, path: '' }]} />
        </div>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-900 dark:to-blue-800 text-white py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-mono bg-white/20 px-3 py-1 rounded">{processCode}</span>
                  <span className={`text-sm font-semibold ${criticality === 'CRITICAL' ? 'bg-red-500' : 'bg-orange-500'} px-3 py-1 rounded`}>
                    {criticality}
                  </span>
                </div>
                <h1 className="text-4xl font-bold mb-2">{processName}</h1>
                <p className="text-blue-100 text-lg">{description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur rounded p-3">
                <div className="text-blue-200 text-sm">Category</div>
                <div className="text-white font-semibold">{category}</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded p-3">
                <div className="text-blue-200 text-sm">Cycle Time</div>
                <div className="text-white font-semibold">{cycletime}</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded p-3">
                <div className="text-blue-200 text-sm">GL Accounts</div>
                <div className="text-white font-semibold">{glAccounts.length}+ Mapped</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded p-3">
                <div className="text-blue-200 text-sm">Status</div>
                <div className="text-white font-semibold">Documented</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          <Tabs defaultValue="flow" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="flow">Process Flow</TabsTrigger>
              <TabsTrigger value="modules">Module Mapping</TabsTrigger>
              <TabsTrigger value="benefits">Benefits</TabsTrigger>
              <TabsTrigger value="gl">GL Integration</TabsTrigger>
            </TabsList>

            {/* Process Flow Tab */}
            <TabsContent value="flow" className="space-y-6">
              <Card className="p-8 bg-white dark:bg-slate-800">
                <h2 className="text-2xl font-bold mb-6 text-foreground">Process Flow</h2>
                
                {/* Flow Diagram */}
                <div className="flex flex-col space-y-4 mb-8">
                  {flowSteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex items-center gap-4 w-full">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center font-bold text-blue-600 dark:text-blue-200">
                          {index + 1}
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-semibold text-foreground">{step.label}</h3>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                        {index < flowSteps.length - 1 && (
                          <ArrowRight className="w-5 h-5 text-blue-400 flex-shrink-0 hidden sm:block" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Module Mapping Tab */}
            <TabsContent value="modules" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {moduleMappings.map((mapping, idx) => (
                  <Card key={idx} className="p-6 bg-white dark:bg-slate-800">
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-bold text-lg text-foreground">{mapping.module}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{mapping.impact}</p>
                    <div className="space-y-2">
                      {mapping.forms.map((form, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="text-sm text-muted-foreground">{form}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Benefits Tab */}
            <TabsContent value="benefits" className="space-y-6">
              <Card className="p-8 bg-white dark:bg-slate-800">
                <h2 className="text-2xl font-bold mb-6 text-foreground">Key Benefits & KPIs</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {keyBenefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950 rounded">
                      <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* GL Integration Tab */}
            <TabsContent value="gl" className="space-y-6">
              <Card className="p-8 bg-white dark:bg-slate-800">
                <h2 className="text-2xl font-bold mb-6 text-foreground">GL Account Integration</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {glAccounts.map((account, idx) => (
                    <div key={idx} className="p-4 bg-slate-100 dark:bg-slate-900 rounded text-center">
                      <Database className="w-5 h-5 text-slate-600 dark:text-slate-400 mx-auto mb-2" />
                      <div className="font-mono font-bold text-foreground">{account}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
