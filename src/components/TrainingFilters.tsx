import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { ENTERPRISE_ROLES, type EnterpriseRole } from "@/components/RBACContext";

export type SkillLevel = "basic" | "intermediate" | "advanced";
export type TrainingModule = "finance" | "crm" | "hr" | "inventory" | "analytics" | "manufacturing";

export const SKILL_LEVELS: { value: SkillLevel | "all"; label: string }[] = [
  { value: "all", label: "All Levels" },
  { value: "basic", label: "Basic" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export const TRAINING_MODULES: { value: TrainingModule | "all"; label: string }[] = [
  { value: "all", label: "All Modules" },
  { value: "finance", label: "Finance" },
  { value: "crm", label: "CRM" },
  { value: "hr", label: "HR & Payroll" },
  { value: "inventory", label: "Inventory" },
  { value: "analytics", label: "Analytics" },
  { value: "manufacturing", label: "Manufacturing" },
];

interface TrainingFiltersProps {
  selectedRole: EnterpriseRole | "all";
  selectedModule: TrainingModule | "all";
  selectedSkillLevel: SkillLevel | "all";
  onRoleChange: (role: EnterpriseRole | "all") => void;
  onModuleChange: (module: TrainingModule | "all") => void;
  onSkillLevelChange: (level: SkillLevel | "all") => void;
  onClearFilters: () => void;
  showModuleFilter?: boolean;
}

export function TrainingFilters({
  selectedRole,
  selectedModule,
  selectedSkillLevel,
  onRoleChange,
  onModuleChange,
  onSkillLevelChange,
  onClearFilters,
  showModuleFilter = true,
}: TrainingFiltersProps) {
  const hasActiveFilters = selectedRole !== "all" || selectedModule !== "all" || selectedSkillLevel !== "all";

  return (
    <Card className="p-4 mb-8" data-testid="training-filters">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-muted-foreground" />
        <span className="font-semibold">Filter Training Content</span>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="ml-auto"
            data-testid="button-clear-filters"
          >
            <X className="w-4 h-4 mr-1" /> Clear Filters
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="role-filter" className="text-sm text-muted-foreground mb-2 block">
            User Role
          </Label>
          <Select value={selectedRole} onValueChange={(value) => onRoleChange(value as EnterpriseRole | "all")}>
            <SelectTrigger id="role-filter" data-testid="select-role-filter">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {ENTERPRISE_ROLES.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {showModuleFilter && (
          <div>
            <Label htmlFor="module-filter" className="text-sm text-muted-foreground mb-2 block">
              Module
            </Label>
            <Select value={selectedModule} onValueChange={(value) => onModuleChange(value as TrainingModule | "all")}>
              <SelectTrigger id="module-filter" data-testid="select-module-filter">
                <SelectValue placeholder="Select module" />
              </SelectTrigger>
              <SelectContent>
                {TRAINING_MODULES.map((mod) => (
                  <SelectItem key={mod.value} value={mod.value}>
                    {mod.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label htmlFor="skill-filter" className="text-sm text-muted-foreground mb-2 block">
            Skill Level
          </Label>
          <Select value={selectedSkillLevel} onValueChange={(value) => onSkillLevelChange(value as SkillLevel | "all")}>
            <SelectTrigger id="skill-filter" data-testid="select-skill-filter">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {SKILL_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}

export function getSkillLevelBadgeColor(level: SkillLevel): string {
  switch (level) {
    case "basic":
      return "bg-green-500 text-white";
    case "intermediate":
      return "bg-blue-500 text-white";
    case "advanced":
      return "bg-purple-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
}
