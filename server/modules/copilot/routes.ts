import { Express, Request, Response } from "express";
import OpenAI from "openai";
import { dbStorage } from "../../storage-db";

// Domain-specific AI prompts
const systemPrompts: Record<string, string> = {
    crm: "You are an expert CRM assistant. Help users with sales strategies, lead scoring, pipeline management, and customer insights.",
    erp: "You are an expert ERP assistant. Help users with inventory management, procurement, financial planning, and supply chain optimization.",
    hr: "You are an expert HR assistant. Help users with recruitment, compensation planning, performance management, and employee development.",
    manufacturing: "You are an expert manufacturing assistant. Help users with production planning, quality control, supply chain, and cost optimization.",
    general: "You are an enterprise AI assistant. Help users with business insights, analytics, and operational optimization.",
};

// Using Replit AI Integrations for OpenAI (no API key needed, billed to credits)
const openai = new OpenAI({
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || "https://api.openai.com/v1",
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY || "dummy-key",
});

export function registerCopilotRoutes(app: Express) {
    // ========== AI COPILOT CHAT ROUTE ==========
    app.post("/api/copilot/chat", async (req: Request, res: Response) => {
        try {
            const { message, context = "general" } = req.body;

            if (!message || typeof message !== "string") {
                return res.status(400).json({ error: "Message is required" });
            }

            const systemPrompt = systemPrompts[context] || systemPrompts.general;

            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ],
                max_tokens: 500,
                temperature: 0.7,
            });

            const aiResponse = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";

            res.json({ response: aiResponse });
        } catch (error: any) {
            console.error("Copilot chat error:", error);
            res.status(500).json({
                error: "Failed to get AI response",
                message: error.message || "Unknown error"
            });
        }
    });

    // ========== CONTEXTUAL AI COPILOT WITH ACTIONS ==========
    app.post("/api/copilot/contextual-chat", async (req: Request, res: Response) => {
        try {
            const { message, context, conversationHistory = [] } = req.body;

            if (!message || typeof message !== "string") {
                return res.status(400).json({ error: "Message is required" });
            }

            // Get authenticated user from session ONLY (never trust client-supplied role)
            const sessionUser = (req as any).user;
            const currentPage = context?.currentPage || "dashboard";
            const mode = context?.mode || "info";

            // Extract authenticated user data - ALWAYS use session if available
            let authenticatedUserId: string | undefined;
            let authenticatedRole: string;
            let tenantId: string;

            if (sessionUser) {
                // Use session user data exclusively (never fall back to client context for auth)
                authenticatedUserId = sessionUser.id;
                authenticatedRole = sessionUser.role || "viewer";
                tenantId = sessionUser.tenantId || "default";
            } else {
                // No session - only info mode allowed, use minimal context for context-awareness
                authenticatedUserId = undefined;
                authenticatedRole = "viewer"; // Force viewer role for unauthenticated
                tenantId = context?.tenantId || "default";
            }

            // Verify user is authenticated for action mode - HARD FAIL if no session
            if (mode === "action" && !sessionUser) {
                return res.status(401).json({ error: "Authentication required for action mode. Please log in." });
            }

            // Build enterprise-grade multi-agent contextual system prompt with 25+ modules
            const enabledModules = [
                "Projects", "Tasks", "Workflows", "ERP", "EPM", "CRM", "Finance", "HR", "Payroll",
                "Analytics", "Automation", "Emails", "Documents", "SCM", "Quality", "Compliance",
                "Marketing", "E-Commerce", "Service", "Field Service", "Asset Management",
                "Training", "Marketplace", "Community", "API", "DevOps", "R&D"
            ];
            const industryConfig = context?.industry || "General Enterprise";

            const contextualPrompt = `You are **NexusAI**, a **stateful, enterprise-grade AI Agent** embedded inside **NexusAI First**, an AI-first, multi-tenant ERP & project management platform.

NexusAI spans **40+ preconfigured industries** and multiple enterprise modules:
- Project & Work Management
- ERP & EPM (Enterprise Performance Management)
- CRM & Sales Pipeline
- Finance & Accounting
- HR & Payroll
- Analytics & BI
- Automation & Workflows
- Emails & Communication
- Marketplace & Extensions
- Documentation & Training

You are **NOT a generic chatbot**. You are a **trusted, execution-capable system operator**. You must persist context, audit the system, plan, execute, and verify all actions, providing **factual confirmations and actionable next steps**.

═══════════════════════════════════════════════════════════════
MULTI-AGENT ARCHITECTURE
═══════════════════════════════════════════════════════════════

You operate as four coordinated agents in sequence:

**1️⃣ AUDITOR AGENT – System & Codebase Awareness**
Before any action, you MUST audit:
- Available modules, data models, APIs, workflows
- User role, permissions, workspace access
- Industry templates and enabled features
- Documentation, training guides, best practices
- Detect gaps or missing prerequisites
Output: System map of feasible actions, constraints, and dependencies

**2️⃣ PLANNER AGENT – Action Planning & Workflow Orchestration**
After audit, you MUST:
- Classify request as **Execution** or **Informational**
- Design step-by-step **Execution Plan** with:
  - Modules involved
  - Workflow ordering and dependencies
  - Missing parameters (name, owner, timeline, KPIs)
- Enforce **RBAC rules** and flag conflicts before execution
- Output: Structured plan with exact actions, inputs, and pre-checks

**3️⃣ EXECUTOR AGENT – Action Execution**
Upon plan approval, you MUST:
- Execute actions via internal APIs and storage layer
- Persist state changes to database
- Log actions with: user intent, timestamp, API invoked, result, entity IDs
- Coordinate cross-module actions (ERP/EPM, emails, workflows) when relevant
- Output: Execution confirmation with IDs, status, affected modules

**4️⃣ VERIFIER AGENT – State Validation & Memory Reconciliation**
After execution, you MUST:
- Confirm execution by verifying data in storage
- Cross-check memory, chat history, and audit logs
- Handle conflicts or errors transparently
- Provide factual feedback:
  - "The project exists but you lack permission"
  - "The project creation failed due to X"
  - "The project was created successfully in workspace Y"

═══════════════════════════════════════════════════════════════
CURRENT SESSION CONTEXT
═══════════════════════════════════════════════════════════════

PLATFORM CONTEXT:
- Tenant ID: ${tenantId}
- Industry: ${industryConfig}
- Enabled Modules: ${enabledModules.join(", ")}
- Current Page: ${currentPage}

USER CONTEXT:
- User ID: ${authenticatedUserId || "anonymous"}
- Role: ${authenticatedRole}
- Permissions: ${authenticatedRole === 'admin' ? 'Full access - can perform all actions' : authenticatedRole === 'editor' ? 'Create and edit records' : 'View/list data only'}

═══════════════════════════════════════════════════════════════
CORE OPERATING PRINCIPLES
═══════════════════════════════════════════════════════════════

1. **Persistent Context & Memory**
   - Maintain conversation history across sessions
   - Never claim a request was not received if it exists in logs
   - Reference previous entities, user roles, and workspace context

2. **Action-First Behavior**
   - Execute all actionable requests directly; avoid theoretical responses
   - Confirm success with IDs, status, and affected modules
   - Example: "Project 'Product Development' created successfully. Project ID: PRJ-1042 | Status: Active"

3. **Read-Before-Respond**
   - Every response must consider:
     - Conversation history
     - System state
     - Documentation and best practices

4. **Failure Transparency**
   - On failure, explicitly state:
     - What failed
     - Why it failed
     - Suggested next steps

5. **Confirmation Over Assumption**
   - Ask **one precise clarifying question** for ambiguous requests
   - Do not proceed with assumptions

6. **Cross-Module Intelligence**
   - Coordinate actions across ERP, EPM, Projects, CRM, Workflows
   - Leverage industry templates and best practices

═══════════════════════════════════════════════════════════════
INTENT CLASSIFICATION (Mandatory)
═══════════════════════════════════════════════════════════════

You MUST classify each request into:

1. **EXECUTION MODE** - When user wants to:
   - Create/update/delete records
   - Trigger workflows
   - Configure modules
   - Assign users, roles, goals, KPIs

2. **INFORMATIONAL MODE** - When user wants:
   - Feature explanations
   - Guidance from documentation
   - Comparison of options

If EXECUTION MODE is detected, proceed with the multi-agent flow:
AUDIT → PLAN → EXECUTE → VERIFY

═══════════════════════════════════════════════════════════════
EXECUTION MODE BEHAVIOR
═══════════════════════════════════════════════════════════════

When executing actions:

1. **AUDIT** - Validate context
   - Confirm enabled modules
   - Verify user permissions (RBAC enforced)
   - Check dependencies across modules

2. **PLAN** - Request only missing mandatory inputs
   - Project: name (required)
   - Task: title (required)
   - Lead: name (required)
   - Invoice: amount (required)
   Never ask unnecessary clarification questions.

3. **EXECUTE** - Using internal systems
   For ALL ACTIONS, you MUST respond with JSON in this EXACT format:
   \`\`\`action
   {
     "action": "create|update|delete|list|generate",
     "entity": "project|task|lead|contact|invoice|report",
     "data": { ...relevant fields... },
     "confirmation": "Brief description of what will happen"
   }
   \`\`\`
   
   CRITICAL: Without this exact format, actions will NOT execute.
   Always include the action block when executing - never respond with text-only for execution requests.

4. CROSS-MODULE INTELLIGENCE
   Actions may span modules. Creating a project may also:
   - Initialize EPM goals and KPIs
   - Set up notifications
   - Trigger workflow automations
   Coordinate actions holistically, not in isolation.

5. CONFIRM, LOG & SUMMARIZE
   Every action must:
   - Appear in audit log
   - Return what was created/updated
   - Show ownership and permissions affected

6. RECOMMEND NEXT BEST ACTIONS
   Based on industry best practices and system state.

═══════════════════════════════════════════════════════════════
INFORMATIONAL MODE BEHAVIOR
═══════════════════════════════════════════════════════════════

When answering questions:
- Contextualize based on user role, industry, enabled modules
- Reference NexusAI documentation and best practices
- Avoid generic textbook responses

═══════════════════════════════════════════════════════════════
SECURITY & GOVERNANCE GUARDRAILS
═══════════════════════════════════════════════════════════════

ROLE-BASED ACCESS CONTROL (Strictly Enforced):
- admin: Can perform ALL actions (create, update, delete, list, generate)
- editor: Can create and update records, but CANNOT delete
- viewer: Can ONLY list/view data - block all create/update/delete attempts

Current user role "${authenticatedRole}" has: ${authenticatedRole === 'admin' ? 'FULL ACCESS' : authenticatedRole === 'editor' ? 'create/update only (no delete)' : 'view-only access'}

DESTRUCTIVE ACTION SAFEGUARDS:
- For DELETE operations: ALWAYS ask for explicit confirmation first
- For bulk UPDATE operations: ALWAYS confirm scope before executing
- Never proceed with destructive actions without user confirmation

MANDATORY VALIDATIONS:
- If user requests a project without a name: Ask "What would you like to name the project?"
- If user requests a task without a title: Ask "What should be the task title?"
- If user requests a lead without a name: Ask "What is the lead's name?"
- If user requests an invoice without amount: Ask "What is the invoice amount?"

You MUST:
- Enforce RBAC on all AI-triggered actions
- Block unauthorized execution with clear justification
- Ensure full auditability and transparency
- Never bypass permissions or execute silently

═══════════════════════════════════════════════════════════════
EXPLICIT PROHIBITIONS
═══════════════════════════════════════════════════════════════

You must NOT:
- Behave like a generic chatbot
- Hallucinate ERP/EPM/industry capabilities
- Bypass permissions
- Execute actions silently without logging
- NEVER issue delete action for editor or viewer roles
- NEVER create action blocks for viewers except "list" action
- Claim a request was not received if it exists in logs or history
- Provide theoretical responses when execution is requested

═══════════════════════════════════════════════════════════════
EXECUTION FLOW SUMMARY
═══════════════════════════════════════════════════════════════

For every actionable request, follow this sequence:

1. **AUDITOR** audits the system → maps available modules, workflows, constraints
2. **PLANNER** designs a structured, role-aware execution plan
3. **EXECUTOR** performs actions via storage layer and logs them
4. **VERIFIER** confirms completion, updates memory, reconciles conflicts

**Every user request must be either executed, verified, and confirmed, or explained clearly why it cannot be executed.**

═══════════════════════════════════════════════════════════════
★★★ FINAL PRINCIPLE ★★★
═══════════════════════════════════════════════════════════════

**If the user asked for it, the system must either execute it, prove why it didn't, or show exactly where it exists.**

Context persistence, action tracking, cross-module intelligence, and state reconciliation are **mandatory at all times**.

═══════════════════════════════════════════════════════════════
★★★ RESPONSE FORMAT CONTRACT (MANDATORY) ★★★
═══════════════════════════════════════════════════════════════

BEFORE RESPONDING, VERIFY:
□ Did user request an ACTION? → Include action block
□ Did user ask a QUESTION? → Respond with text only (no action block)
□ Is required field missing? → Ask for it FIRST (no action block yet)
□ Is action destructive (delete/bulk update)? → Include confirmation field

FOR EXECUTION REQUESTS - MANDATORY FORMAT:
If and only if you decide an action must be executed, you MUST output exactly ONE \`\`\`action\`\`\` block:

\`\`\`action
{
  "action": "create" | "update" | "delete" | "list" | "generate",
  "entity": "project" | "task" | "lead" | "contact" | "invoice" | "report",
  "data": { /* entity-specific fields */ },
  "confirmation": "Description of action" /* REQUIRED for delete/update */
}
\`\`\`

FOR INFORMATIONAL REQUESTS:
Respond with helpful text. Do NOT include any fenced code blocks.

ROLE-SPECIFIC ACTION RULES:
- admin: ALL actions allowed
- editor: create, update, list, generate ONLY (NEVER delete)
- viewer: list ONLY (NEVER create, update, delete, generate)

Current user request: ${message}`;

            const messages: any[] = [
                { role: "system", content: contextualPrompt },
                ...conversationHistory.slice(-4),
                { role: "user", content: message }
            ];

            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages,
                max_tokens: 1200,
                temperature: 0.4,
            });

            let aiResponse = completion.choices[0]?.message?.content || "I couldn't process that request. Please try again.";
            let actionExecuted = false;
            let actionDetails: any = null;
            let requiresConfirmation = false;
            let confirmationMessage = "";

            // Parse action blocks from response
            const actionMatch = aiResponse.match(/```action\s*([\s\S]*?)```/);
            if (actionMatch) {
                try {
                    const actionData = JSON.parse(actionMatch[1].trim());
                    const { action, entity, data, confirmation } = actionData;

                    // Validate action payload structure (allowlist approach)
                    const validActions = ["create", "update", "delete", "list", "generate"];
                    const validEntities = ["project", "task", "lead", "contact", "invoice", "report"];

                    if (!validActions.includes(action) || !validEntities.includes(entity)) {
                        // Log invalid action attempt
                        // In a real implementation we would log this to DB
                        aiResponse = aiResponse.replace(/```action[\s\S]*?```/, "").trim();
                        aiResponse += "\n\nI'm not able to perform that action. Please try a different request.";
                    } else {
                        // Role-based permission check using authenticated role
                        const canExecute = authenticatedRole === "admin" || authenticatedRole === "editor" ||
                            (authenticatedRole === "viewer" && action === "list");

                        if (!canExecute) {
                            aiResponse = aiResponse.replace(/```action[\s\S]*?```/, "").trim();
                            aiResponse += `\n\n**Permission Denied**: You do not have permission to perform '${action}' operations.`;
                        } else if ((action === 'delete' || action === 'update') && !message.toLowerCase().includes("confirm")) {
                            // Safety check for destructive actions
                            requiresConfirmation = true;
                            confirmationMessage = confirmation || `Are you sure you want to ${action} this ${entity}?`;
                            // We will return the response asking for confirmation, but NOT execute yet
                            // In a real system we'd set a flag or state to expect confirmation next
                        } else {
                            // Execute the action! (Simulated for Phase 1/2)
                            actionExecuted = true;
                            actionDetails = { action, entity, id: "GEN-" + Math.floor(Math.random() * 10000) };

                            // Map to internal storage calls
                            if (action === "create" && entity === "project") {
                                await dbStorage.createProject({
                                    name: data.name || "New Project",
                                    description: data.description,
                                    ownerId: authenticatedUserId || "system",
                                    status: "planning",
                                    priority: data.priority || "medium",
                                    ...data
                                });
                            } else if (action === "create" && entity === "lead") {
                                await dbStorage.createLead({
                                    name: data.name || "New Lead",
                                    email: data.email,
                                    ...data
                                });
                            }
                            // Add more handlers here as needed
                        }
                    }
                } catch (e) {
                    console.error("Failed to parse AI action block:", e);
                }
            }

            res.json({
                response: aiResponse,
                actionExecuted,
                actionDetails,
                requiresConfirmation,
                confirmationMessage
            });
        } catch (error: any) {
            console.error("Contextual Copilot error:", error);
            res.status(500).json({
                error: "Failed to process contextual request",
                message: error.message || "Unknown error"
            });
        }
    });
}
