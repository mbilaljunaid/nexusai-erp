import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/Breadcrumbs";

interface ProcessPageProps {
  title: string;
  description: string;
  steps: { name: string; description: string; glAccounts?: string[] }[];
  kpis?: { metric: string; target: string; current: string }[];
}

export function PublicProcessTemplate({ title, description, steps, kpis }: ProcessPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Breadcrumbs />
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{title}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">{description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Flow */}
          <div className="lg:col-span-2">
            <Card className="p-8 dark:bg-slate-800 dark:border-slate-700">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Process Flow</h2>
              <div className="space-y-4">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{step.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{step.description}</p>
                      {step.glAccounts && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {step.glAccounts.map((acc) => (
                            <Badge key={acc} variant="secondary">{acc}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* KPIs */}
          <div>
            <Card className="p-8 dark:bg-slate-800 dark:border-slate-700">
              <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">KPIs</h2>
              <div className="space-y-6">
                {kpis?.map((kpi, idx) => (
                  <div key={idx} className="pb-6 border-b dark:border-slate-700 last:border-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{kpi.metric}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{kpi.current}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Target: {kpi.target}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
