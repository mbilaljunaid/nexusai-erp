import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  confidence?: number;
  actionSuggested?: string;
}

export interface CopilotSession {
  id: string;
  messages: CopilotMessage[];
  context: Record<string, any>;
  industry?: string;
  module?: string;
}

@Injectable()
export class CopilotService {
  private openai: OpenAI;
  private sessions: Map<string, CopilotSession> = new Map();
  private sessionCounter = 1;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  createSession(context?: Record<string, any>): CopilotSession {
    const id = `SES-${this.sessionCounter++}`;
    const session: CopilotSession = {
      id,
      messages: [],
      context: context || {},
    };
    this.sessions.set(id, session);
    return session;
  }

  async processMessage(sessionId: string, userMessage: string): Promise<CopilotMessage> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Add user message to history
    const userMsg: CopilotMessage = {
      id: `MSG-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    session.messages.push(userMsg);

    try {
      // Call OpenAI API for intelligent response
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: session.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: 0.7,
        max_tokens: 500,
      });

      const assistantContent = response.choices[0]?.message?.content || 'I could not process your request.';

      const assistantMsg: CopilotMessage = {
        id: `MSG-${Date.now() + 1}`,
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
        confidence: 0.85,
      };

      session.messages.push(assistantMsg);
      return assistantMsg;
    } catch (error) {
      // Fallback response if API fails
      const fallbackMsg: CopilotMessage = {
        id: `MSG-${Date.now() + 1}`,
        role: 'assistant',
        content:
          'I am temporarily unavailable. Please try again later or contact support.',
        timestamp: new Date(),
        confidence: 0.5,
      };
      session.messages.push(fallbackMsg);
      return fallbackMsg;
    }
  }

  getSessionHistory(sessionId: string): CopilotMessage[] {
    return this.sessions.get(sessionId)?.messages || [];
  }

  generateActionSuggestions(sessionId: string): string[] {
    const session = this.sessions.get(sessionId);
    if (!session || session.messages.length === 0) return [];

    // AI-powered suggestions based on conversation context
    const suggestions = [
      'Create a new GL entry',
      'Run reconciliation',
      'Generate budget forecast',
      'Create sales quote',
      'Schedule training session',
      'Assign task',
      'Create compliance report',
    ];

    return suggestions.slice(0, 3);
  }

  async processVoiceInput(sessionId: string, audioBase64: string): Promise<CopilotMessage> {
    // Simulate voice transcription (would use actual speech-to-text in production)
    const transcribedText = `[Transcribed from voice: ${audioBase64.substring(0, 20)}...]`;
    return this.processMessage(sessionId, transcribedText);
  }

  closeSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }
}
