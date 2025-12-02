import { useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumb } from "@/components/Breadcrumb";
import { MetadataFormRenderer } from "@/components/forms/MetadataFormRenderer";
import { getFormMetadata } from "@/lib/formMetadata";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormPageProps {
  formId?: string;
}

export default function FormPage({ formId: propFormId }: FormPageProps) {
  // Extract formId from URL search params or use prop
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const formId = propFormId || searchParams.get('formId') || 'default';
  const formMetadata = getFormMetadata(formId);

  const handleBack = () => {
    if (window.opener) {
      window.close();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="flex items-center justify-between p-4 gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleBack}
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">{formMetadata?.name || 'Form'}</h1>
              <p className="text-sm text-muted-foreground">{formMetadata?.breadcrumbs?.[0]?.label || 'Enter your information'}</p>
            </div>
          </div>
          <SidebarTrigger data-testid="button-sidebar-toggle" />
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="px-6 pt-4">
        <Breadcrumb items={formMetadata?.breadcrumbs?.slice(1) || []} />
      </div>

      {/* Form Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-lg border p-6">
            <MetadataFormRenderer
              formId={formId}
              formMetadata={formMetadata}
              onSubmit={async (data) => {
                // Form submission is handled by MetadataFormRenderer
                // Close window after successful submission
                setTimeout(() => {
                  if (window.opener) {
                    window.opener.location.reload();
                    window.close();
                  } else {
                    window.history.back();
                  }
                }, 1000);
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
