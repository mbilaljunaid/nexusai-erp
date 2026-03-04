import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export default function DataImport() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Data Import</h1>
        <p className="text-muted-foreground mt-1">Import data from CSV or API</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Import Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed rounded p-6 text-center">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm">Drop CSV file or click to upload</p>
          </div>
          <Button className="w-full" data-testid="button-upload">Upload File</Button>
        </CardContent>
      </Card>
    </div>
  );
}
