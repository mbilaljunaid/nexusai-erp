/**
 * NexusAI Gateway — Centralized AI Provider Gateway
 * 
 * All LLM calls across the entire application route through this single gateway.
 * It reads the active provider configuration from the `ai_provider_configs` table
 * and routes to the correct provider SDK (OpenAI, Anthropic, Gemini, etc.).
 * 
 * This replaces all hardcoded OpenAI calls in:
 * - server/services/ai.ts (legacy AIService)
 * - server/services/CrmAiService.ts
 * - server/services/ar-ai.ts (collection email generation)
 * - server/modules/copilot/services/CopilotService.ts
 */

import { db } from "../db";
import { aiProviderConfigs } from "@shared/schema/nexus_ai";
import { eq, and } from "drizzle-orm";

export interface GatewayMessage {
  role: "system" | "user" | "assistant";
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

export interface GatewayOptions {
  /** Override the model (otherwise uses configured default) */
  model?: string;
  /** Override temperature (0.0 - 2.0) */
  temperature?: number;
  /** Override max tokens */
  maxTokens?: number;
  /** Request JSON response format (OpenAI-compatible providers only) */
  jsonMode?: boolean;
  /** System prompt to prepend */
  systemPrompt?: string;
  /** Specific provider config ID to use (bypasses default lookup) */
  configId?: string;
}

export interface GatewayResponse {
  response: string;
  model: string;
  provider: string;
  usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
}

// Cached config to avoid DB lookups on every call
let cachedConfig: any = null;
let cachedConfigTimestamp = 0;
const CONFIG_CACHE_TTL = 30_000; // 30 seconds

/**
 * Get the active default AI provider configuration
 */
async function getActiveConfig(configId?: string): Promise<any> {
  if (configId) {
    const configs = await db.select().from(aiProviderConfigs)
      .where(eq(aiProviderConfigs.id, configId))
      .limit(1);
    if (configs.length === 0) throw new Error("Specified AI provider config not found");
    return configs[0];
  }

  // Use cache if fresh
  if (cachedConfig && (Date.now() - cachedConfigTimestamp) < CONFIG_CACHE_TTL) {
    return cachedConfig;
  }

  const configs = await db.select().from(aiProviderConfigs)
    .where(and(
      eq(aiProviderConfigs.isActive, true),
      eq(aiProviderConfigs.isDefault, true)
    ))
    .limit(1);

  if (configs.length === 0) {
    throw new Error("No AI provider configured. Please configure one in Platform Admin → AI Configuration.");
  }

  cachedConfig = configs[0];
  cachedConfigTimestamp = Date.now();
  return cachedConfig;
}

/** Invalidate cached config (call after provider updates) */
export function invalidateConfigCache() {
  cachedConfig = null;
  cachedConfigTimestamp = 0;
}

/**
 * Call AI provider (non-streaming) — The single gateway function.
 * All LLM calls across the application should use this.
 */
export async function callAI(
  messages: GatewayMessage[],
  options: GatewayOptions = {}
): Promise<GatewayResponse> {
  const config = await getActiveConfig(options.configId);
  const temperature = options.temperature ?? (config.temperature ?? 7) / 10;
  const maxTokens = options.maxTokens ?? config.maxTokens ?? 4096;
  const model = options.model ?? config.model;

  // Prepend system prompt if provided and not already in messages
  const finalMessages = options.systemPrompt && messages[0]?.role !== "system"
    ? [{ role: "system" as const, content: options.systemPrompt }, ...messages]
    : messages;

  switch (config.provider) {
    case "openai":
    case "azure_openai":
    case "custom":
    case "mistral": {
      const baseUrl = config.provider === "mistral"
        ? "https://api.mistral.ai/v1"
        : (config.baseUrl || "https://api.openai.com/v1");

      const body: any = { model, messages: finalMessages, max_tokens: maxTokens, temperature };
      if (options.jsonMode) body.response_format = { type: "json_object" };

      const resp = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!resp.ok) throw new Error(`${config.provider} API error (${resp.status}): ${await resp.text()}`);
      const data = await resp.json();
      return {
        response: data.choices?.[0]?.message?.content || "",
        model,
        provider: config.provider,
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        } : undefined,
      };
    }

    case "anthropic": {
      const systemMsg = finalMessages.find(m => m.role === "system");
      const nonSystemMsgs = finalMessages.filter(m => m.role !== "system");

      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": config.apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          system: typeof systemMsg?.content === "string" ? systemMsg.content : undefined,
          messages: nonSystemMsgs,
          temperature,
        }),
      });
      if (!resp.ok) throw new Error(`Anthropic API error (${resp.status}): ${await resp.text()}`);
      const data = await resp.json();
      return {
        response: data.content?.[0]?.text || "",
        model,
        provider: "anthropic",
        usage: data.usage ? {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: (data.usage.input_tokens || 0) + (data.usage.output_tokens || 0),
        } : undefined,
      };
    }

    case "google_gemini": {
      const baseUrl = config.baseUrl || "https://generativelanguage.googleapis.com/v1beta";
      const resp = await fetch(`${baseUrl}/models/${model}:generateContent?key=${config.apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: finalMessages.map(m => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: typeof m.content === "string" ? m.content : JSON.stringify(m.content) }],
          })),
          generationConfig: { maxOutputTokens: maxTokens, temperature },
        }),
      });
      if (!resp.ok) throw new Error(`Gemini API error (${resp.status}): ${await resp.text()}`);
      const data = await resp.json();
      return {
        response: data.candidates?.[0]?.content?.parts?.[0]?.text || "",
        model,
        provider: "google_gemini",
      };
    }

    case "ollama": {
      const baseUrl = config.baseUrl || "http://localhost:11434/api";
      const resp = await fetch(`${baseUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages: finalMessages, options: { temperature }, stream: false }),
      });
      if (!resp.ok) throw new Error(`Ollama API error (${resp.status}): ${await resp.text()}`);
      const data = await resp.json();
      return { response: data.message?.content || "", model, provider: "ollama" };
    }

    case "cohere": {
      const systemMsg = finalMessages.find(m => m.role === "system");
      const userMsg = finalMessages.filter(m => m.role === "user").pop();
      const chatHistory = finalMessages
        .filter(m => m.role !== "system")
        .slice(0, -1)
        .map(m => ({
          role: m.role === "assistant" ? "CHATBOT" : "USER",
          message: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
        }));

      const resp = await fetch("https://api.cohere.ai/v1/chat", {
        method: "POST",
        headers: { "Authorization": `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          message: typeof userMsg?.content === "string" ? userMsg.content : "",
          chat_history: chatHistory,
          preamble: typeof systemMsg?.content === "string" ? systemMsg.content : undefined,
          temperature,
        }),
      });
      if (!resp.ok) throw new Error(`Cohere API error (${resp.status}): ${await resp.text()}`);
      const data = await resp.json();
      return { response: data.text || "", model, provider: "cohere" };
    }

    default:
      throw new Error(`Unsupported AI provider: ${config.provider}`);
  }
}

/**
 * Convenience: Call AI with a simple prompt string
 */
export async function callAISimple(
  prompt: string,
  systemPrompt?: string,
  options: GatewayOptions = {}
): Promise<string> {
  const messages: GatewayMessage[] = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: prompt });
  const result = await callAI(messages, options);
  return result.response;
}

/**
 * Call AI expecting JSON response (uses json mode where supported)
 */
export async function callAIJson<T = any>(
  messages: GatewayMessage[],
  options: GatewayOptions = {}
): Promise<T> {
  const result = await callAI(messages, { ...options, jsonMode: true });
  try {
    return JSON.parse(result.response);
  } catch {
    // Try to extract JSON from response
    const match = result.response.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("AI response was not valid JSON: " + result.response.substring(0, 200));
  }
}
