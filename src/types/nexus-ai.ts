// NexusAI — Configurable AI Provider Types & Capabilities

export type AIProviderType =
  | "openai"
  | "google_gemini"
  | "anthropic"
  | "azure_openai"
  | "ollama"
  | "mistral"
  | "cohere"
  | "custom";

export interface AIProviderConfig {
  id: string;
  name: string;
  provider: AIProviderType;
  apiKey: string; // masked on frontend
  baseUrl?: string; // for custom/ollama endpoints
  model: string;
  isActive: boolean;
  isDefault: boolean;
  maxTokens?: number;
  temperature?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AIProviderOption {
  provider: AIProviderType;
  label: string;
  description: string;
  defaultBaseUrl: string;
  models: string[];
}

export const AI_PROVIDER_OPTIONS: AIProviderOption[] = [
  {
    provider: "openai",
    label: "OpenAI",
    description: "GPT-4o, GPT-4, GPT-3.5 Turbo",
    defaultBaseUrl: "https://api.openai.com/v1",
    models: ["gpt-4o", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"],
  },
  {
    provider: "google_gemini",
    label: "Google Gemini",
    description: "Gemini Pro, Gemini Flash",
    defaultBaseUrl: "https://generativelanguage.googleapis.com/v1beta",
    models: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash"],
  },
  {
    provider: "anthropic",
    label: "Anthropic (Claude)",
    description: "Claude 3.5 Sonnet, Claude 3 Opus",
    defaultBaseUrl: "https://api.anthropic.com/v1",
    models: ["claude-3-5-sonnet-20241022", "claude-3-opus-20240229", "claude-3-haiku-20240307"],
  },
  {
    provider: "azure_openai",
    label: "Azure OpenAI",
    description: "Azure-hosted OpenAI models",
    defaultBaseUrl: "",
    models: ["gpt-4o", "gpt-4", "gpt-35-turbo"],
  },
  {
    provider: "ollama",
    label: "Ollama (Self-Hosted)",
    description: "LLaMA, Mistral, CodeLlama locally",
    defaultBaseUrl: "http://localhost:11434/api",
    models: ["llama3.1", "mistral", "codellama", "phi3"],
  },
  {
    provider: "mistral",
    label: "Mistral AI",
    description: "Mistral Large, Medium, Small",
    defaultBaseUrl: "https://api.mistral.ai/v1",
    models: ["mistral-large-latest", "mistral-medium-latest", "mistral-small-latest"],
  },
  {
    provider: "cohere",
    label: "Cohere",
    description: "Command R+, Command R",
    defaultBaseUrl: "https://api.cohere.ai/v1",
    models: ["command-r-plus", "command-r", "command"],
  },
  {
    provider: "custom",
    label: "Custom / OpenAI-Compatible",
    description: "Any OpenAI-compatible API endpoint",
    defaultBaseUrl: "",
    models: [],
  },
];

// Capability definitions per module
export interface AICapability {
  id: string;
  module: string;
  name: string;
  description: string;
  tools: AITool[];
  insights: string[];
  routes: string[]; // which app routes this capability applies to
  quickActions?: { label: string; prompt: string; icon?: string }[];
}

export interface AITool {
  name: string;
  description: string;
  parameters: Record<string, { type: string; description: string; required?: boolean }>;
  action: string; // API endpoint or action code
}

export type AIAgentMode = "auditor" | "planner" | "executor" | "verifier" | "general";

export interface NexusAIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  toolCalls?: { name: string; result?: any; status?: 'pending' | 'executing' | 'completed' | 'failed' }[];
  moduleContext?: string;
  // For centralization flow
  actionType?: "info" | "action" | "confirmation" | "error";
  actionDetails?: {
    type: string;
    entity: string;
    id?: string;
    summary?: string;
    params?: any;
  };
  mode?: AIAgentMode;
}

export interface NexusAIState {
  isOpen: boolean;
  isLoading: boolean;
  messages: NexusAIMessage[];
  currentModule: string | null;
  capabilities: AICapability[];
  activeProvider: AIProviderConfig | null;
  error: string | null;
  // Centralization additions
  agentMode: AIAgentMode;
  activePage: string;
  pageMetadata?: any;
  tenantId?: string; // Appended for multi-tenant context scoping
}
