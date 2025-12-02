import { Card } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

export default function TrainingGuideCRM() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-900 dark:to-green-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8" />
            <h1 className="text-4xl font-bold">CRM Module Training Guide</h1>
          </div>
          <p className="text-green-100 text-lg">Complete guide to using the Customer Relationship Management module</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Learning Objectives</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex gap-3"><span className="text-green-600">✓</span> Understand the CRM module structure and workflow</li>
            <li className="flex gap-3"><span className="text-green-600">✓</span> Create and manage customer accounts and contacts</li>
            <li className="flex gap-3"><span className="text-green-600">✓</span> Track leads through the sales pipeline</li>
            <li className="flex gap-3"><span className="text-green-600">✓</span> Manage opportunities and close deals</li>
            <li className="flex gap-3"><span className="text-green-600">✓</span> Track customer interactions and activities</li>
            <li className="flex gap-3"><span className="text-green-600">✓</span> Generate sales reports and forecasts</li>
          </ul>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="font-bold text-lg text-foreground mb-2">Getting Started</h3>
            <p className="text-sm text-muted-foreground">Learn the basics of navigating the CRM interface and setting up your workspace.</p>
          </Card>
          <Card className="p-6">
            <h3 className="font-bold text-lg text-foreground mb-2">Lead Management</h3>
            <p className="text-sm text-muted-foreground">Master how to capture, qualify, and nurture leads through the sales funnel.</p>
          </Card>
          <Card className="p-6">
            <h3 className="font-bold text-lg text-foreground mb-2">Sales Operations</h3>
            <p className="text-sm text-muted-foreground">Learn to manage opportunities, forecasts, and sales pipelines effectively.</p>
          </Card>
        </div>

        <Card className="p-8 mt-8 bg-green-50 dark:bg-green-950">
          <h3 className="font-bold text-lg text-foreground mb-4">Key Features</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>• Account Management</div>
            <div>• Contact Database</div>
            <div>• Lead Tracking</div>
            <div>• Opportunity Pipeline</div>
            <div>• Activity Timeline</div>
            <div>• Sales Forecasting</div>
            <div>• Custom Reports</div>
            <div>• Mobile Access</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
