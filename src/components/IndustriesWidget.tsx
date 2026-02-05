import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const INDUSTRIES = [
  { id: 1, name: "Automotive", slug: "automotive", icon: "🚗" },
  { id: 2, name: "Banking & Finance", slug: "banking", icon: "🏦" },
  { id: 3, name: "Healthcare", slug: "healthcare", icon: "🏥" },
  { id: 4, name: "Education", slug: "education", icon: "🎓" },
  { id: 5, name: "Retail & E-Commerce", slug: "retail", icon: "🛍️" },
  { id: 6, name: "Manufacturing", slug: "manufacturing", icon: "🏭" },
  { id: 7, name: "Logistics", slug: "logistics", icon: "📦" },
  { id: 8, name: "Telecom", slug: "telecom", icon: "📡" },
  { id: 9, name: "Insurance", slug: "insurance", icon: "🛡️" },
  { id: 10, name: "Fashion & Apparel", slug: "fashion", icon: "👗" },
  { id: 11, name: "Government", slug: "government", icon: "🏛️" },
  { id: 12, name: "Hospitality", slug: "hospitality", icon: "🏨" },
  { id: 13, name: "Pharmaceuticals", slug: "pharma", icon: "💊" },
  { id: 14, name: "CPG", slug: "cpg", icon: "📊" },
  { id: 15, name: "Energy & Utilities", slug: "energy", icon: "⚡" },
  { id: 16, name: "Audit & Compliance", slug: "audit", icon: "✓" },
  { id: 17, name: "Business Services", slug: "business-services", icon: "💼" },
  { id: 18, name: "Carrier & Shipping", slug: "carrier", icon: "✈️" },
  { id: 19, name: "Clinical", slug: "clinical", icon: "🔬" },
  { id: 20, name: "Credit & Lending", slug: "credit", icon: "💰" },
  { id: 21, name: "Equipment Mfg", slug: "equipment", icon: "⚙️" },
  { id: 22, name: "Events", slug: "events", icon: "🎪" },
  { id: 23, name: "Export & Import", slug: "export-import", icon: "🚢" },
  { id: 24, name: "Finance & Investment", slug: "finance-investment", icon: "📈" },
  { id: 25, name: "Food & Beverage", slug: "food-beverage", icon: "🍽️" },
  { id: 26, name: "Freight & Logistics", slug: "freight", icon: "🚚" },
  { id: 27, name: "Laboratory", slug: "laboratory", icon: "🧪" },
  { id: 28, name: "Lab Technology", slug: "lab-tech", icon: "🔭" },
  { id: 29, name: "Marketing & Advertising", slug: "marketing", icon: "📢" },
  { id: 30, name: "Media & Entertainment", slug: "media", icon: "🎬" },
  { id: 31, name: "Pharmacy", slug: "pharmacy", icon: "💊" },
  { id: 32, name: "Portal & Digital Services", slug: "portal", icon: "🌐" },
  { id: 33, name: "Property & Real Estate", slug: "property", icon: "🏠" },
  { id: 34, name: "Real Estate & Construction", slug: "real-estate-construction", icon: "🏗️" },
  { id: 35, name: "Security & Defense", slug: "security", icon: "🔐" },
  { id: 36, name: "Shipment Management", slug: "shipment", icon: "📮" },
  { id: 37, name: "Shipping & Maritime", slug: "shipping", icon: "⛴️" },
  { id: 38, name: "Training & Development", slug: "training", icon: "📚" },
  { id: 39, name: "Transportation", slug: "transportation", icon: "🚁" },
  { id: 40, name: "Travel & Tourism", slug: "travel", icon: "✈️" },
  { id: 41, name: "Vehicle & Automotive", slug: "vehicle", icon: "🚕" },
  { id: 42, name: "Warehouse & Storage", slug: "warehouse", icon: "🏢" },
  { id: 43, name: "Wholesale & Distribution", slug: "wholesale", icon: "📦" }
];

export function IndustriesWidget() {
  const [scrollIndex, setScrollIndex] = useState(0);
  const itemsPerView = 6;
  const maxIndex = Math.max(0, INDUSTRIES.length - itemsPerView);

  const handlePrev = () => {
    setScrollIndex(Math.max(0, scrollIndex - 1));
  };

  const handleNext = () => {
    setScrollIndex(Math.min(maxIndex, scrollIndex + 1));
  };

  const visibleIndustries = INDUSTRIES.slice(scrollIndex, scrollIndex + itemsPerView);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
        <div>
          <CardTitle className="text-base">Industries</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">{INDUSTRIES.length} industries supported</p>
        </div>
        <div className="flex gap-1">
          <Button 
            size="icon" 
            variant="outline" 
            className="h-8 w-8"
            onClick={handlePrev}
            disabled={scrollIndex === 0}
            data-testid="button-industries-prev"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="outline" 
            className="h-8 w-8"
            onClick={handleNext}
            disabled={scrollIndex >= maxIndex}
            data-testid="button-industries-next"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {visibleIndustries.map((industry) => (
            <div 
              key={industry.id} 
              className="flex flex-col items-center gap-1 p-2 rounded-lg border hover:border-primary hover:bg-primary/5 transition cursor-pointer hover-elevate"
              data-testid={`industry-${industry.slug}`}
            >
              <span className="text-2xl">{industry.icon}</span>
              <span className="text-xs font-medium text-center leading-tight">{industry.name}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {scrollIndex + 1}–{Math.min(scrollIndex + itemsPerView, INDUSTRIES.length)} of {INDUSTRIES.length}
          </p>
          <div className="flex gap-1">
            {Array.from({ length: Math.ceil(INDUSTRIES.length / itemsPerView) }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition ${
                  i === Math.floor(scrollIndex / itemsPerView)
                    ? "bg-primary w-3"
                    : "bg-muted w-1.5"
                }`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
