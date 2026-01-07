// Industry to module mapping for automatic enablement
export const INDUSTRY_MODULE_MAPPING: Record<string, string[]> = {
  "manufacturing": ["ERP", "Manufacturing", "Projects", "Procurement", "Analytics"],
  "retail": ["CRM", "ERP", "Projects", "Marketing", "Analytics"],
  "financial-services": ["Finance", "Governance", "Analytics", "CRM", "AI"],
  "healthcare": ["HR", "Service", "Projects", "Analytics", "Compliance"],
  "education": ["Education", "HR", "Analytics", "Communication", "Projects"],
  "automotive": ["ERP", "Manufacturing", "CRM", "Service", "Analytics"],
  "banking": ["Finance", "Governance", "AI", "Analytics", "CRM"],
  "government": ["Admin", "HR", "Governance", "Analytics", "Communication"],
  "hospitality": ["CRM", "Marketing", "HR", "Service", "Analytics"],
  "logistics": ["Logistics", "Operations", "ERP", "Analytics", "Workflow"],
  "construction": ["Projects", "ERP", "Manufacturing", "Analytics", "Finance"],
  "technology": ["Developer", "AI", "Analytics", "Workflow", "Communication"],
};

export const INDUSTRIES = [
  { id: "manufacturing", name: "Manufacturing", description: "Production and supply chain management" },
  { id: "retail", name: "Retail & E-Commerce", description: "Retail operations and online commerce" },
  { id: "financial-services", name: "Financial Services", description: "Banking and finance operations" },
  { id: "healthcare", name: "Healthcare", description: "Medical and healthcare services" },
  { id: "education", name: "Education", description: "Educational institutions" },
  { id: "automotive", name: "Automotive", description: "Automotive manufacturing and services" },
  { id: "banking", name: "Banking", description: "Banking and investment services" },
  { id: "government", name: "Government", description: "Government and public sector" },
  { id: "hospitality", name: "Hospitality", description: "Hotels and hospitality services" },
  { id: "logistics", name: "Logistics", description: "Shipping and supply chain logistics" },
  { id: "construction", name: "Construction", description: "Construction and engineering" },
  { id: "technology", name: "Technology", description: "Software and technology companies" },
];

export type TenantDeployment = {
  id: string;
  tenantId: string;
  tenantName: string;
  industryId: string;
  industryName: string;
  enabledModules: string[];
  deployedAt: string;
  status: "active" | "inactive";
};
