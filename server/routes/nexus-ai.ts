import { Router } from "express";
import { db } from "../db";
import { aiProviderConfigs } from "@shared/schema/nexus_ai";
import { eq, and } from "drizzle-orm";

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

    if (configs.length === 0) {
      return res.json(null);
    }

    // Mask API key for frontend
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
    // Mask API keys
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

    // If setting as default, unset others
    if (isDefault) {
      await db.update(aiProviderConfigs)
        .set({ isDefault: false })
        .where(eq(aiProviderConfigs.isDefault, true));
    }

    const [created] = await db.insert(aiProviderConfigs).values({
      name,
      provider,
      apiKey,
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

    // If setting as default, unset others
    if (updates.isDefault) {
      await db.update(aiProviderConfigs)
        .set({ isDefault: false })
        .where(eq(aiProviderConfigs.isDefault, true));
    }

    // Don't update apiKey if it's masked
    if (updates.apiKey && updates.apiKey.includes("*")) {
      delete updates.apiKey;
    }

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

// ── POST test provider connection ──
nexusAiRouter.post("/providers/:id/test", async (req, res) => {
  try {
    const { id } = req.params;
    const configs = await db.select().from(aiProviderConfigs)
      .where(eq(aiProviderConfigs.id, id));

    if (configs.length === 0) return res.status(404).json({ error: "Provider not found" });

    const config = configs[0];

    // Attempt a minimal completion call based on provider
    const testResult = await testProviderConnection(config);
    res.json(testResult);
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// ── POST chat (main AI endpoint) ──
nexusAiRouter.post("/chat", async (req, res) => {
  try {
    const { message, conversationHistory, moduleContext, capabilities } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    // Get active default provider
    const configs = await db.select().from(aiProviderConfigs)
      .where(and(
        eq(aiProviderConfigs.isActive, true),
        eq(aiProviderConfigs.isDefault, true)
      ))
      .limit(1);

    if (configs.length === 0) {
      return res.status(400).json({ error: "No AI provider configured. Please configure one in Platform Admin → AI Configuration." });
    }

    const config = configs[0];
    const response = await callAIProvider(config, message, conversationHistory, moduleContext, capabilities);
    res.json(response);
  } catch (error) {
    console.error("NexusAI chat error:", error);
    res.status(500).json({ error: String(error) });
  }
});

// ── Provider-agnostic AI call ──
async function callAIProvider(
  config: any,
  message: string,
  conversationHistory: any[] = [],
  moduleContext?: string,
  capabilities?: any[]
) {
  const systemPrompt = buildSystemPrompt(moduleContext, capabilities);
  const messages = [
    { role: "system", content: systemPrompt },
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
        headers: {
          "Authorization": `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: config.model,
          messages,
          max_tokens: config.maxTokens || 4096,
          temperature,
        }),
      });
      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`OpenAI API error (${resp.status}): ${err}`);
      }
      const data = await resp.json();
      return { response: data.choices?.[0]?.message?.content || "No response" };
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
        }),
      });
      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Anthropic API error (${resp.status}): ${err}`);
      }
      const data = await resp.json();
      return { response: data.content?.[0]?.text || "No response" };
    }

    case "google_gemini": {
      const baseUrl = config.baseUrl || "https://generativelanguage.googleapis.com/v1beta";
      const resp = await fetch(
        `${baseUrl}/models/${config.model}:generateContent?key=${config.apiKey}`,
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
      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Gemini API error (${resp.status}): ${err}`);
      }
      const data = await resp.json();
      return { response: data.candidates?.[0]?.content?.parts?.[0]?.text || "No response" };
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
          stream: false,
        }),
      });
      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Ollama API error (${resp.status}): ${err}`);
      }
      const data = await resp.json();
      return { response: data.message?.content || "No response" };
    }

    case "mistral": {
      const resp = await fetch("https://api.mistral.ai/v1/chat/completions", {
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
        }),
      });
      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Mistral API error (${resp.status}): ${err}`);
      }
      const data = await resp.json();
      return { response: data.choices?.[0]?.message?.content || "No response" };
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
        }),
      });
      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Cohere API error (${resp.status}): ${err}`);
      }
      const data = await resp.json();
      return { response: data.text || "No response" };
    }

    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}

function buildSystemPrompt(moduleContext?: string, capabilities?: any[]) {
  let prompt = `You are NexusAI, an intelligent assistant embedded in an enterprise ERP platform.
You help users with their work across Finance, CRM, HR, Projects, Supply Chain, and more.
Be concise, accurate, and action-oriented. When asked to perform actions, confirm what you'll do before executing.`;

  if (moduleContext) {
    prompt += `\n\nThe user is currently in the ${moduleContext} module.`;
  }

  if (capabilities && capabilities.length > 0) {
    prompt += `\n\nAvailable capabilities in this context:`;
    for (const cap of capabilities) {
      prompt += `\n- ${cap.module}: Tools: [${cap.tools.join(", ")}], Insights: [${cap.insights.join(", ")}]`;
    }
  }

  return prompt;
}

async function testProviderConnection(config: any): Promise<{ success: boolean; message: string; latencyMs?: number }> {
  const start = Date.now();
  try {
    const result = await callAIProvider(config, "Reply with 'OK' and nothing else.", []);
    const latencyMs = Date.now() - start;
    if (result.response) {
      return { success: true, message: `Connected successfully. Response: "${result.response.substring(0, 50)}"`, latencyMs };
    }
    return { success: false, message: "No response received" };
  } catch (error: any) {
    return { success: false, message: error.message || "Connection failed" };
  }
}
