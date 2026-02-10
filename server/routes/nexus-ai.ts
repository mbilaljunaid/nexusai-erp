import { Router } from "express";
import { db } from "../db";
import { aiProviderConfigs, nexusConversations } from "@shared/schema/nexus_ai";
import { eq, and, desc } from "drizzle-orm";
import { executeTool, canExecuteTool } from "../services/nexus-tool-executor";
import { hasPermission, PERMISSIONS } from "@shared/schema/roles";
import type { AuthenticatedRequest } from "../middleware/auth";
import { getAllToolDefinitions } from "../../src/config/ai-capabilities";

export const nexusAiRouter = Router();

// ── GET active provider (for frontend context) ──
nexusAiRouter.get("/provider/active", async (_req, res) => {
  try {
    const configs = await db.select().from(aiProviderConfigs)
      .where(and(
        eq(aiProviderConfigs.isActive, true),
        eq(aiProviderConfigs.isDefault, true)
      ))
      .limit(1);

    if (configs.length === 0) return res.json(null);

    const config = configs[0];
    res.json({
      ...config,
      apiKey: config.apiKey ? `${config.apiKey.substring(0, 8)}${"*".repeat(20)}` : "",
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ── GET all providers ──
nexusAiRouter.get("/providers", async (_req, res) => {
  try {
    const configs = await db.select().from(aiProviderConfigs);
    const masked = configs.map(c => ({
      ...c,
      apiKey: c.apiKey ? `${c.apiKey.substring(0, 8)}${"*".repeat(20)}` : "",
    }));
    res.json(masked);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ── POST create provider ──
nexusAiRouter.post("/providers", async (req, res) => {
  try {
    const { name, provider, apiKey, baseUrl, model, isDefault, maxTokens, temperature } = req.body;
    if (!name || !provider || !apiKey || !model) {
      return res.status(400).json({ error: "name, provider, apiKey, and model are required" });
    }

    if (isDefault) {
      await db.update(aiProviderConfigs)
        .set({ isDefault: false })
        .where(eq(aiProviderConfigs.isDefault, true));
    }

    const [created] = await db.insert(aiProviderConfigs).values({
      name, provider, apiKey,
      baseUrl: baseUrl || null,
      model,
      isActive: true,
      isDefault: isDefault ?? true,
      maxTokens: maxTokens ?? 4096,
      temperature: temperature ?? 7,
    }).returning();

    res.json({ ...created, apiKey: `${apiKey.substring(0, 8)}${"*".repeat(20)}` });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ── PATCH update provider ──
nexusAiRouter.patch("/providers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates: any = { ...req.body, updatedAt: new Date() };

    if (updates.isDefault) {
      await db.update(aiProviderConfigs)
        .set({ isDefault: false })
        .where(eq(aiProviderConfigs.isDefault, true));
    }

    if (updates.apiKey && updates.apiKey.includes("*")) delete updates.apiKey;

    const [updated] = await db.update(aiProviderConfigs)
      .set(updates)
      .where(eq(aiProviderConfigs.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Provider not found" });

    res.json({
      ...updated,
      apiKey: updated.apiKey ? `${updated.apiKey.substring(0, 8)}${"*".repeat(20)}` : "",
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ── DELETE provider ──
nexusAiRouter.delete("/providers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [deleted] = await db.delete(aiProviderConfigs)
      .where(eq(aiProviderConfigs.id, id))
      .returning();
    if (!deleted) return res.status(404).json({ error: "Provider not found" });
    res.json({ message: "Provider deleted" });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ═══════════════════════════════════════════════
// ── Conversation History Persistence ──
// ═══════════════════════════════════════════════

// GET all conversations for current user
nexusAiRouter.get("/conversations", async (req: any, res) => {
  try {
    const userId = req.userId || req.session?.userId || "anonymous";
    const convos = await db.select({
      id: nexusConversations.id,
      title: nexusConversations.title,
      moduleContext: nexusConversations.moduleContext,
      isActive: nexusConversations.isActive,
      createdAt: nexusConversations.createdAt,
      updatedAt: nexusConversations.updatedAt,
    }).from(nexusConversations)
      .where(eq(nexusConversations.userId, userId))
      .orderBy(desc(nexusConversations.updatedAt))
      .limit(50);
    res.json(convos);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// GET single conversation with messages
nexusAiRouter.get("/conversations/:id", async (req: any, res) => {
  try {
    const userId = req.userId || req.session?.userId || "anonymous";
    const results = await db.select().from(nexusConversations)
      .where(and(
        eq(nexusConversations.id, req.params.id),
        eq(nexusConversations.userId, userId)
      ))
      .limit(1);
    if (results.length === 0) return res.status(404).json({ error: "Conversation not found" });
    res.json(results[0]);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// POST create conversation
nexusAiRouter.post("/conversations", async (req: any, res) => {
  try {
    const userId = req.userId || req.session?.userId || "anonymous";
    const { title, moduleContext, messages } = req.body;
    const [convo] = await db.insert(nexusConversations).values({
      userId,
      title: title || "New Conversation",
      moduleContext,
      messages: messages || [],
      isActive: true,
    }).returning();
    res.json(convo);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// PATCH update conversation (save messages)
nexusAiRouter.patch("/conversations/:id", async (req: any, res) => {
  try {
    const userId = req.userId || req.session?.userId || "anonymous";
    const { title, messages, isActive } = req.body;
    const updates: any = { updatedAt: new Date() };
    if (title !== undefined) updates.title = title;
    if (messages !== undefined) updates.messages = messages;
    if (isActive !== undefined) updates.isActive = isActive;

    const [updated] = await db.update(nexusConversations)
      .set(updates)
      .where(and(
        eq(nexusConversations.id, req.params.id),
        eq(nexusConversations.userId, userId)
      ))
      .returning();
    if (!updated) return res.status(404).json({ error: "Conversation not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// DELETE conversation
nexusAiRouter.delete("/conversations/:id", async (req: any, res) => {
  try {
    const userId = req.userId || req.session?.userId || "anonymous";
    const [deleted] = await db.delete(nexusConversations)
      .where(and(
        eq(nexusConversations.id, req.params.id),
        eq(nexusConversations.userId, userId)
      ))
      .returning();
    if (!deleted) return res.status(404).json({ error: "Conversation not found" });
    res.json({ message: "Conversation deleted" });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ── POST test provider connection ──
nexusAiRouter.post("/providers/:id/test", async (req, res) => {
  try {
    const { id } = req.params;
    const configs = await db.select().from(aiProviderConfigs)
      .where(eq(aiProviderConfigs.id, id));
    if (configs.length === 0) return res.status(404).json({ error: "Provider not found" });

    const start = Date.now();
    try {
      const result = await callAIProviderNonStreaming(configs[0], "Reply with 'OK' and nothing else.", []);
      const latencyMs = Date.now() - start;
      res.json({ success: true, message: `Connected. Response: "${(result.response || "").substring(0, 50)}"`, latencyMs });
    } catch (err: any) {
      res.json({ success: false, message: err.message || "Connection failed" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// ── POST execute tool (direct tool execution with RBAC) ──
nexusAiRouter.post("/tools/execute", async (req: any, res) => {
  try {
    const userRole = req.role || req.session?.userRole || "gl_viewer";
    const userId = req.userId || req.session?.userId || "anonymous";

    // Check AI execute permission
    if (!hasPermission(userRole, PERMISSIONS.AI_EXECUTE)) {
      return res.status(403).json({
        error: `Your role '${userRole}' does not have permission to execute AI tools.`,
      });
    }

    const { toolName, parameters } = req.body;
    if (!toolName) return res.status(400).json({ error: "toolName is required" });

    const result = await executeTool({ toolName, parameters: parameters || {}, userRole, userId });
    if (result.permissionDenied) {
      return res.status(403).json(result);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ── POST chat with streaming (main AI endpoint) ──
nexusAiRouter.post("/chat", async (req: any, res) => {
  try {
    const { message, conversationHistory, moduleContext, capabilities, stream: wantStream } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const userRole = req.role || req.session?.userRole || "gl_viewer";
    const userId = req.userId || req.session?.userId || "anonymous";

    // Check basic AI chat permission
    if (!hasPermission(userRole, PERMISSIONS.AI_CHAT)) {
      return res.status(403).json({ error: `Your role '${userRole}' does not have permission to use AI chat.` });
    }

    // Get active default provider
    const configs = await db.select().from(aiProviderConfigs)
      .where(and(eq(aiProviderConfigs.isActive, true), eq(aiProviderConfigs.isDefault, true)))
      .limit(1);

    if (configs.length === 0) {
      return res.status(400).json({ error: "No AI provider configured. Please configure one in Platform Admin → AI Configuration." });
    }

    const config = configs[0];
    const systemPrompt = buildSystemPrompt(moduleContext, capabilities, userRole);

    // Streaming path
    if (wantStream !== false) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders();

      try {
        await streamAIProvider(config, message, conversationHistory || [], systemPrompt, (chunk) => {
          res.write(`data: ${JSON.stringify({ type: "token", content: chunk })}\n\n`);
        });

        // After streaming completes, check if AI suggested tool calls
        // (For simplicity, tool calls are executed via separate /tools/execute endpoint
        //  or the AI response text can contain structured tool-call markers)
        res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
        res.end();
      } catch (err: any) {
        res.write(`data: ${JSON.stringify({ type: "error", content: err.message })}\n\n`);
        res.end();
      }
      return;
    }

    // Non-streaming fallback
    const response = await callAIProviderNonStreaming(config, message, conversationHistory || [], systemPrompt);
    res.json(response);
  } catch (error) {
    console.error("NexusAI chat error:", error);
    res.status(500).json({ error: String(error) });
  }
});

// ── System prompt builder with role awareness ──
function buildSystemPrompt(moduleContext?: string, capabilities?: any[], userRole?: string) {
  let prompt = `You are NexusAI, an intelligent assistant embedded in an enterprise ERP platform.
You help users with their work across Finance, CRM, HR, Projects, Supply Chain, and more.
Be concise, accurate, and action-oriented. When asked to perform actions, confirm what you'll do before executing.

IMPORTANT: The user's role is "${userRole || "viewer"}". Only suggest actions they have permission to perform.
- Viewers can only read data and get insights.
- Users can create and edit records.
- Managers can approve, post, and configure.
- Admins have full access.

When you want to execute a tool, respond with a JSON block in this format:
\`\`\`tool_call
{"tool": "tool_name", "parameters": {...}}
\`\`\`
The system will execute it and return results. Do NOT fabricate tool results.`;

  if (moduleContext) {
    prompt += `\n\nThe user is currently in the ${moduleContext} module.`;
  }

  if (capabilities && capabilities.length > 0) {
    prompt += `\n\nAvailable tools in this context:`;
    for (const cap of capabilities) {
      prompt += `\n- ${cap.module}: Tools: [${cap.tools.join(", ")}], Insights: [${cap.insights.join(", ")}]`;
    }
  }

  return prompt;
}

// ── Streaming provider call ──
async function streamAIProvider(
  config: any,
  message: string,
  conversationHistory: any[],
  systemPrompt: string,
  onChunk: (text: string) => void
) {
  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
    { role: "user", content: message },
  ];
  const temperature = (config.temperature ?? 7) / 10;

  switch (config.provider) {
    case "openai":
    case "azure_openai":
    case "custom":
    case "mistral": {
      const baseUrl = config.provider === "mistral"
        ? "https://api.mistral.ai/v1"
        : (config.baseUrl || "https://api.openai.com/v1");

      const resp = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: config.model,
          messages,
          max_tokens: config.maxTokens || 4096,
          temperature,
          stream: true,
        }),
      });
      if (!resp.ok) throw new Error(`API error (${resp.status}): ${await resp.text()}`);
      await processSSEStream(resp, onChunk);
      break;
    }

    case "anthropic": {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": config.apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: config.model,
          max_tokens: config.maxTokens || 4096,
          system: systemPrompt,
          messages: [...conversationHistory, { role: "user", content: message }],
          temperature,
          stream: true,
        }),
      });
      if (!resp.ok) throw new Error(`Anthropic API error (${resp.status}): ${await resp.text()}`);
      await processAnthropicStream(resp, onChunk);
      break;
    }

    case "google_gemini": {
      const baseUrl = config.baseUrl || "https://generativelanguage.googleapis.com/v1beta";
      const resp = await fetch(
        `${baseUrl}/models/${config.model}:streamGenerateContent?key=${config.apiKey}&alt=sse`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: messages.map(m => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }],
            })),
            generationConfig: {
              maxOutputTokens: config.maxTokens || 4096,
              temperature,
            },
          }),
        }
      );
      if (!resp.ok) throw new Error(`Gemini API error (${resp.status}): ${await resp.text()}`);
      await processGeminiStream(resp, onChunk);
      break;
    }

    case "ollama": {
      const baseUrl = config.baseUrl || "http://localhost:11434/api";
      const resp = await fetch(`${baseUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: config.model,
          messages,
          options: { temperature },
          stream: true,
        }),
      });
      if (!resp.ok) throw new Error(`Ollama API error (${resp.status}): ${await resp.text()}`);
      await processOllamaStream(resp, onChunk);
      break;
    }

    case "cohere": {
      const resp = await fetch("https://api.cohere.ai/v1/chat", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: config.model,
          message,
          chat_history: conversationHistory.map(m => ({
            role: m.role === "assistant" ? "CHATBOT" : "USER",
            message: m.content,
          })),
          preamble: systemPrompt,
          temperature,
          stream: true,
        }),
      });
      if (!resp.ok) throw new Error(`Cohere API error (${resp.status}): ${await resp.text()}`);
      await processCohereStream(resp, onChunk);
      break;
    }

    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}

// ── SSE stream processors ──

async function processSSEStream(resp: Response, onChunk: (t: string) => void) {
  const reader = (resp.body as any).getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let nl: number;
    while ((nl = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, nl);
      buffer = buffer.slice(nl + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") return;
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onChunk(content);
      } catch {}
    }
  }
}

async function processAnthropicStream(resp: Response, onChunk: (t: string) => void) {
  const reader = (resp.body as any).getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let nl: number;
    while ((nl = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, nl);
      buffer = buffer.slice(nl + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      try {
        const parsed = JSON.parse(line.slice(6));
        if (parsed.type === "content_block_delta" && parsed.delta?.text) {
          onChunk(parsed.delta.text);
        }
      } catch {}
    }
  }
}

async function processGeminiStream(resp: Response, onChunk: (t: string) => void) {
  const reader = (resp.body as any).getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let nl: number;
    while ((nl = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, nl);
      buffer = buffer.slice(nl + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      try {
        const parsed = JSON.parse(line.slice(6));
        const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) onChunk(text);
      } catch {}
    }
  }
}

async function processOllamaStream(resp: Response, onChunk: (t: string) => void) {
  const reader = (resp.body as any).getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let nl: number;
    while ((nl = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line) continue;
      try {
        const parsed = JSON.parse(line);
        if (parsed.message?.content) onChunk(parsed.message.content);
        if (parsed.done) return;
      } catch {}
    }
  }
}

async function processCohereStream(resp: Response, onChunk: (t: string) => void) {
  const reader = (resp.body as any).getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let nl: number;
    while ((nl = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line) continue;
      try {
        const parsed = JSON.parse(line);
        if (parsed.event_type === "text-generation" && parsed.text) {
          onChunk(parsed.text);
        }
      } catch {}
    }
  }
}

// ── Non-streaming fallback ──
async function callAIProviderNonStreaming(
  config: any, message: string, conversationHistory: any[], systemPrompt?: string
) {
  const sysPrompt = systemPrompt || buildSystemPrompt();
  const messages = [
    { role: "system", content: sysPrompt },
    ...conversationHistory,
    { role: "user", content: message },
  ];
  const temperature = (config.temperature ?? 7) / 10;

  switch (config.provider) {
    case "openai":
    case "azure_openai":
    case "custom": {
      const baseUrl = config.baseUrl || "https://api.openai.com/v1";
      const resp = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: config.model, messages, max_tokens: config.maxTokens || 4096, temperature }),
      });
      if (!resp.ok) throw new Error(`OpenAI API error (${resp.status}): ${await resp.text()}`);
      const data = await resp.json();
      return { response: data.choices?.[0]?.message?.content || "No response" };
    }

    case "anthropic": {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": config.apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
        body: JSON.stringify({
          model: config.model, max_tokens: config.maxTokens || 4096,
          system: sysPrompt,
          messages: [...conversationHistory, { role: "user", content: message }],
          temperature,
        }),
      });
      if (!resp.ok) throw new Error(`Anthropic API error (${resp.status}): ${await resp.text()}`);
      const data = await resp.json();
      return { response: data.content?.[0]?.text || "No response" };
    }

    case "google_gemini": {
      const baseUrl = config.baseUrl || "https://generativelanguage.googleapis.com/v1beta";
      const resp = await fetch(`${baseUrl}/models/${config.model}:generateContent?key=${config.apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: messages.map(m => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
          generationConfig: { maxOutputTokens: config.maxTokens || 4096, temperature },
        }),
      });
      if (!resp.ok) throw new Error(`Gemini API error (${resp.status}): ${await resp.text()}`);
      const data = await resp.json();
      return { response: data.candidates?.[0]?.content?.parts?.[0]?.text || "No response" };
    }

    case "ollama": {
      const baseUrl = config.baseUrl || "http://localhost:11434/api";
      const resp = await fetch(`${baseUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: config.model, messages, options: { temperature }, stream: false }),
      });
      if (!resp.ok) throw new Error(`Ollama API error (${resp.status}): ${await resp.text()}`);
      const data = await resp.json();
      return { response: data.message?.content || "No response" };
    }

    case "mistral": {
      const resp = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: config.model, messages, max_tokens: config.maxTokens || 4096, temperature }),
      });
      if (!resp.ok) throw new Error(`Mistral API error (${resp.status}): ${await resp.text()}`);
      const data = await resp.json();
      return { response: data.choices?.[0]?.message?.content || "No response" };
    }

    case "cohere": {
      const resp = await fetch("https://api.cohere.ai/v1/chat", {
        method: "POST",
        headers: { "Authorization": `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: config.model, message,
          chat_history: conversationHistory.map(m => ({ role: m.role === "assistant" ? "CHATBOT" : "USER", message: m.content })),
          preamble: sysPrompt, temperature,
        }),
      });
      if (!resp.ok) throw new Error(`Cohere API error (${resp.status}): ${await resp.text()}`);
      const data = await resp.json();
      return { response: data.text || "No response" };
    }

    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}
