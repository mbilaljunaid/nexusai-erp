import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Users, Package, TrendingUp, Database } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
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
                        <div className="font-bold text-foreground">{step.label}</div>
                        <div className="text-muted-foreground text-sm">{step.description}</div>
                      </div>
                    </div>
                    {index < flowSteps.length - 1 && (
                      <ArrowRight className="flex-shrink-0 text-blue-500 mt-8" />
                    )}
                  </div>
                ))}
              </div>

              {/* Visual Process Flow */}
              <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg overflow-x-auto">
                <div className="flex items-center justify-between gap-2 min-w-max">
                  {flowSteps.map((step, index) => (
                    <React.Fragment key={index}>
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm text-center px-2">
                          {step.label}
                        </div>
                      </div>
                      {index < flowSteps.length - 1 && (
                        <div className="w-12 h-1 bg-blue-300 dark:bg-blue-700"></div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Module Mapping Tab */}
          <TabsContent value="modules" className="space-y-6">
            <Card className="p-8 bg-white dark:bg-slate-800">
              <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
                <Package className="w-6 h-6" />
                Module Mapping
              </h2>
              
              <div className="space-y-4">
                {moduleMappings.map((mapping, index) => (
                  <Card key={index} className="p-4 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-foreground">{mapping.module}</h3>
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-2 py-1 rounded">
                        {mapping.forms.length} forms
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{mapping.impact}</p>
                    <div className="flex flex-wrap gap-2">
                      {mapping.forms.map((form, fIdx) => (
                        <span 
                          key={fIdx}
                          className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-2 py-1 rounded text-foreground"
                        >
                          {form}
                        </span>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Benefits Tab */}
          <TabsContent value="benefits" className="space-y-6">
            <Card className="p-8 bg-white dark:bg-slate-800">
              <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Key Benefits
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {keyBenefits.map((benefit, index) => (
                  <Card key={index} className="p-4 border-l-4 border-l-blue-500 bg-blue-50 dark:bg-slate-900">
                    <p className="text-foreground font-semibold">{benefit}</p>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* GL Integration Tab */}
          <TabsContent value="gl" className="space-y-6">
            <Card className="p-8 bg-white dark:bg-slate-800">
              <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
                <Database className="w-6 h-6" />
                General Ledger Integration
              </h2>
              
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-4">
                  This process integrates with the following GL accounts for real-time financial tracking:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {glAccounts.map((account, index) => (
                    <div key={index} className="font-mono text-sm bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
                      {account}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Additional Content */}
        {children && (
          <div className="mt-12">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
