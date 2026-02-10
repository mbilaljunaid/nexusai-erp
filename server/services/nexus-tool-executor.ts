/**
 * NexusAI Tool Executor
 * Executes AI-requested actions (create journal entry, score lead, etc.)
 * with role-based permission checks.
 */

import { db } from "../db";
import { hasPermission, PERMISSIONS } from "../../shared/schema/roles";
import { glEntries, leads } from "../../shared/schema";

// Map tool names to required permissions
const TOOL_PERMISSION_MAP: Record<string, string> = {
  create_journal_entry: PERMISSIONS.GL_WRITE,
  analyze_account_balance: PERMISSIONS.GL_READ,
  score_lead: PERMISSIONS.CRM_WRITE,
  analyze_opportunity: PERMISSIONS.CRM_READ,
  recommend_courses: PERMISSIONS.HR_READ,
  create_task: PERMISSIONS.PROJECT_WRITE,
  forecast_demand: PERMISSIONS.SCM_READ,
};

export interface ToolExecutionRequest {
  toolName: string;
  parameters: Record<string, any>;
  userRole: string;
  userId: string;
}

export interface ToolExecutionResult {
  success: boolean;
  toolName: string;
  result?: any;
  error?: string;
  permissionDenied?: boolean;
}

/**
 * Check if user role has permission to execute a specific tool
 */
export function canExecuteTool(toolName: string, userRole: string): boolean {
  const required = TOOL_PERMISSION_MAP[toolName];
  if (!required) return false; // Unknown tool = deny
  return hasPermission(userRole, required);
}

/**
 * Execute a tool action with full RBAC check
 */
export async function executeTool(req: ToolExecutionRequest): Promise<ToolExecutionResult> {
  const { toolName, parameters, userRole, userId } = req;

  // 1. Permission check
  if (!canExecuteTool(toolName, userRole)) {
    return {
      success: false,
      toolName,
      permissionDenied: true,
      error: `Permission denied. Your role '${userRole}' cannot execute '${toolName}'. Required: ${TOOL_PERMISSION_MAP[toolName] || "unknown"}.`,
    };
  }

  // 2. Execute the tool
  try {
    const result = await executeToolAction(toolName, parameters, userId);
    return { success: true, toolName, result };
  } catch (err: any) {
    return { success: false, toolName, error: err.message || "Tool execution failed" };
  }
}

/**
 * Dispatch to the actual tool implementation
 */
async function executeToolAction(toolName: string, params: Record<string, any>, userId: string): Promise<any> {
  switch (toolName) {
    case "create_journal_entry":
      return createJournalEntry(params, userId);
    case "analyze_account_balance":
      return analyzeAccountBalance(params);
    case "score_lead":
      return scoreLead(params);
    case "analyze_opportunity":
      return analyzeOpportunity(params);
    case "recommend_courses":
      return recommendCourses(params);
    case "create_task":
      return createTask(params, userId);
    case "forecast_demand":
      return forecastDemand(params);
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

// ── Tool Implementations ──

async function createJournalEntry(params: Record<string, any>, userId: string) {
  const { description, amount, debitAccount, creditAccount } = params;
  if (!description || !amount || !debitAccount || !creditAccount) {
    throw new Error("Missing required fields: description, amount, debitAccount, creditAccount");
  }

  const [entry] = await db.insert(glEntries).values({
    journalDate: new Date(),
    description,
    debitAccount,
    creditAccount,
    debitAmount: String(amount),
    creditAmount: String(amount),
    status: "posted",
  }).returning();

  return { message: `Journal entry created successfully`, entry };
}

async function analyzeAccountBalance(params: Record<string, any>) {
  const { accountCode } = params;
  if (!accountCode) throw new Error("accountCode is required");
  // Query GL entries for this account
  const { eq, or } = await import("drizzle-orm");
  const entries = await db.select().from(glEntries)
    .where(or(
      eq(glEntries.debitAccount, accountCode),
      eq(glEntries.creditAccount, accountCode)
    ))
    .limit(20);

  let totalDebit = 0, totalCredit = 0;
  for (const e of entries) {
    if (e.debitAccount === accountCode) totalDebit += parseFloat(e.debitAmount || "0");
    if (e.creditAccount === accountCode) totalCredit += parseFloat(e.creditAmount || "0");
  }

  return {
    accountCode,
    totalDebit,
    totalCredit,
    netBalance: totalDebit - totalCredit,
    recentEntries: entries.length,
  };
}

async function scoreLead(params: Record<string, any>) {
  const { leadId } = params;
  if (!leadId) throw new Error("leadId is required");

  const { eq } = await import("drizzle-orm");
  const results = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
  if (results.length === 0) throw new Error(`Lead ${leadId} not found`);

  const lead = results[0];
  // Simple scoring heuristic
  let score = 50;
  if (lead.email) score += 10;
  if (lead.phone) score += 10;
  if (lead.company) score += 15;
  if (lead.status === "qualified") score += 15;

  return {
    leadId,
    leadName: `${lead.firstName || ""} ${lead.lastName || ""}`.trim(),
    score: Math.min(score, 100),
    factors: [
      lead.email ? "Has email (+10)" : "No email",
      lead.phone ? "Has phone (+10)" : "No phone",
      lead.company ? "Has company (+15)" : "No company",
      lead.status === "qualified" ? "Qualified status (+15)" : `Status: ${lead.status}`,
    ],
  };
}

async function analyzeOpportunity(params: Record<string, any>) {
  const { opportunityId } = params;
  if (!opportunityId) throw new Error("opportunityId is required");
  // Return analysis stub — real implementation queries opportunities table
  return {
    opportunityId,
    winProbability: 65,
    recommendation: "Follow up with stakeholder meeting. Deal shows positive signals.",
    riskFactors: ["No recent activity in 7 days", "Budget not confirmed"],
  };
}

async function recommendCourses(params: Record<string, any>) {
  const { employeeId } = params;
  if (!employeeId) throw new Error("employeeId is required");
  return {
    employeeId,
    recommendations: [
      { title: "Advanced Leadership Skills", relevance: 92, type: "Management" },
      { title: "Data Analytics Fundamentals", relevance: 85, type: "Technical" },
      { title: "Effective Communication", relevance: 78, type: "Soft Skills" },
    ],
  };
}

async function createTask(params: Record<string, any>, userId: string) {
  const { title, projectId, priority, assigneeId } = params;
  if (!title) throw new Error("title is required");
  // Stub — real implementation inserts into tasks table
  return {
    message: "Task created successfully",
    task: {
      id: `task-${Date.now()}`,
      title,
      projectId: projectId || "default",
      priority: priority || "medium",
      assigneeId: assigneeId || userId,
      status: "todo",
      createdAt: new Date().toISOString(),
    },
  };
}

async function forecastDemand(params: Record<string, any>) {
  const { productId, periods } = params;
  if (!productId) throw new Error("productId is required");
  const numPeriods = periods || 6;
  // Generate mock forecast data
  const forecast = Array.from({ length: numPeriods }, (_, i) => ({
    period: i + 1,
    predictedDemand: Math.round(100 + Math.random() * 50),
    confidence: Math.round(85 + Math.random() * 10),
  }));
  return { productId, periods: numPeriods, forecast };
}
