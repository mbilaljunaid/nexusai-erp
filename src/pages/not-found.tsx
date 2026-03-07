import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";


export default function NotFound() {
  return (
    <StandardPage title="404 Page Not Found">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Did you forget to add the page to the router?
          </p>
        </CardContent>
      </Card>
    </StandardPage>
  );
}
