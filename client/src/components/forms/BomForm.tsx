import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function BomForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    productId: "",
    description: "",
    uom: "each",
    quantity: "1",
    status: "active",
    revision: "1",
  });

  const [bomLines, setBomLines] = useState<Array<{
    componentId: string;
    quantity: string;
    uom: string;
    scrapPercentage: string;
  }>>([]);

  const uomOptions = [
    { value: "each", label: "Each" },
    { value: "kg", label: "Kilogram" },
    { value: "lb", label: "Pound" },
    { value: "meter", label: "Meter" },
    { value: "liter", label: "Liter" },
    { value: "gallon", label: "Gallon" },
    { value: "box", label: "Box" },
  ];

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addBomLine = () => {
    setBomLines([
      ...bomLines,
      { componentId: "", quantity: "1", uom: "each", scrapPercentage: "0" }
    ]);
  };

  const removeBomLine = (index: number) => {
    setBomLines(bomLines.filter((_, i) => i !== index));
  };

  const updateBomLine = (index: number, field: string, value: string) => {
    const newLines = [...bomLines];
    newLines[index] = { ...newLines[index], [field]: value };
    setBomLines(newLines);
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      const bomData = {
        name: formData.name,
        productId: formData.productId,
        description: formData.description,
        uom: formData.uom,
        quantity: formData.quantity,
        status: formData.status,
        revision: parseInt(formData.revision),
      };

      const response: any = await apiRequest("POST", "/api/manufacturing/boms", bomData);
      
      // Add BOM lines
      for (const line of bomLines) {
        if (line.componentId) {
          await apiRequest("POST", "/api/manufacturing/bom-lines", {
            bomId: response.id,
            lineNumber: bomLines.indexOf(line) + 1,
            componentId: line.componentId,
            quantity: line.quantity,
            uom: line.uom,
            scrapPercentage: line.scrapPercentage,
          });
        }
      }

      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "BOM created successfully",
      });
      setFormData({
        name: "",
        productId: "",
        description: "",
        uom: "each",
        quantity: "1",
        status: "active",
        revision: "1",
      });
      setBomLines([]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create BOM",
        variant: "destructive",
      });
    },
  });

  const isValid = formData.name && formData.productId && parseFloat(formData.quantity) > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Bill of Materials (BOM)</span>
            <Badge variant="secondary">Manufacturing</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* BOM Header */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bom-name">BOM Name *</Label>
              <Input
                id="bom-name"
                data-testid="input-bom-name"
                placeholder="e.g., Product Assembly v1"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="bom-product">Product ID *</Label>
              <Input
                id="bom-product"
                data-testid="input-bom-productid"
                placeholder="e.g., PROD-001"
                value={formData.productId}
                onChange={(e) => handleChange("productId", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="bom-quantity">Quantity *</Label>
              <Input
                id="bom-quantity"
                data-testid="input-bom-quantity"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="1"
                value={formData.quantity}
                onChange={(e) => handleChange("quantity", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="bom-uom">Unit of Measure *</Label>
              <Select value={formData.uom} onValueChange={(value) => handleChange("uom", value)}>
                <SelectTrigger id="bom-uom" data-testid="select-bom-uom">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {uomOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bom-status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger id="bom-status" data-testid="select-bom-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bom-revision">Revision</Label>
              <Input
                id="bom-revision"
                data-testid="input-bom-revision"
                type="number"
                min="1"
                value={formData.revision}
                onChange={(e) => handleChange("revision", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bom-description">Description</Label>
            <Textarea
              id="bom-description"
              data-testid="textarea-bom-description"
              placeholder="BOM description and notes"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="resize-none"
            />
          </div>

          {/* BOM Lines */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Component Lines</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={addBomLine}
                data-testid="button-add-bomline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Component
              </Button>
            </div>

            {bomLines.length === 0 ? (
              <div className="text-sm text-muted-foreground p-4 border rounded-md text-center">
                No components added yet. Click "Add Component" to start.
              </div>
            ) : (
              <div className="space-y-3">
                {bomLines.map((line, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Line {index + 1}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeBomLine(index)}
                        data-testid={`button-remove-line-${index}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`comp-${index}`}>Component ID</Label>
                        <Input
                          id={`comp-${index}`}
                          data-testid={`input-component-${index}`}
                          placeholder="e.g., COMP-001"
                          value={line.componentId}
                          onChange={(e) => updateBomLine(index, "componentId", e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`qty-${index}`}>Quantity</Label>
                        <Input
                          id={`qty-${index}`}
                          data-testid={`input-quantity-${index}`}
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={line.quantity}
                          onChange={(e) => updateBomLine(index, "quantity", e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`uom-${index}`}>UOM</Label>
                        <Select value={line.uom} onValueChange={(value) => updateBomLine(index, "uom", value)}>
                          <SelectTrigger id={`uom-${index}`} data-testid={`select-uom-${index}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {uomOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor={`scrap-${index}`}>Scrap %</Label>
                        <Input
                          id={`scrap-${index}`}
                          data-testid={`input-scrap-${index}`}
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={line.scrapPercentage}
                          onChange={(e) => updateBomLine(index, "scrapPercentage", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <Button
            onClick={() => submitMutation.mutate()}
            disabled={!isValid || submitMutation.isPending}
            data-testid="button-submit-bom"
            className="w-full"
          >
            {submitMutation.isPending ? "Creating..." : "Create BOM"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
