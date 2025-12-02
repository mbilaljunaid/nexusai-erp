import { Card } from '@/components/ui/card';
import { Code2 } from 'lucide-react';
import { Header, Footer } from "@/components/Navigation";

export default function TechnicalAPIReference() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-900 dark:to-purple-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Code2 className="w-8 h-8" />
            <h1 className="text-4xl font-bold">REST API Reference</h1>
          </div>
          <p className="text-purple-100 text-lg">Complete API documentation for NexusAI ERP</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <Card className="p-8 mb-8 bg-slate-100 dark:bg-slate-800">
          <h2 className="text-2xl font-bold text-foreground mb-4">Base URL</h2>
          <code className="text-sm bg-slate-900 text-green-400 p-4 rounded block">https://api.nexusai.com/v1</code>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="font-bold text-lg text-foreground mb-3">Authentication</h3>
            <p className="text-sm text-muted-foreground mb-3">All requests require JWT token in Authorization header</p>
            <code className="text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded block">Authorization: Bearer YOUR_TOKEN</code>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-lg text-foreground mb-3">Rate Limiting</h3>
            <p className="text-sm text-muted-foreground">1000 requests per hour per API key. Responses include rate limit headers.</p>
          </Card>
        </div>

        <Card className="p-8">
          <h3 className="font-bold text-2xl text-foreground mb-4">Main Endpoints</h3>
          
          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <code className="text-sm font-mono text-blue-600 dark:text-blue-400">GET /api/forms</code>
              <p className="text-sm text-muted-foreground mt-2">Retrieve list of all available forms</p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <code className="text-sm font-mono text-green-600 dark:text-green-400">POST /api/forms/{'{formId}'}/submit</code>
              <p className="text-sm text-muted-foreground mt-2">Submit form data with validation</p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <code className="text-sm font-mono text-purple-600 dark:text-purple-400">GET /api/gl/accounts</code>
              <p className="text-sm text-muted-foreground mt-2">Retrieve GL account chart</p>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <code className="text-sm font-mono text-orange-600 dark:text-orange-400">POST /api/workflows/trigger</code>
              <p className="text-sm text-muted-foreground mt-2">Trigger workflow automation</p>
            </div>
          </div>
        </Card>
      </div>
      </div>
      <Footer />
    </>
  );
}
