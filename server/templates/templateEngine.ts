/**
 * Template Engine - Phase 5
 * Form templates system for rapid form creation
 */

import type { FormMetadataAdvanced } from "@shared/types/metadata";

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  baseFormId?: string;
  metadata: FormMetadataAdvanced;
  createdAt: Date;
  updatedAt: Date;
  category: "master" | "transaction" | "report" | "workflow";
  industry?: string[];
  tags: string[];
}

export class TemplateEngine {
  private templates: Map<string, FormTemplate> = new Map();

  /**
   * Create template from existing metadata
   */
  createTemplate(
    id: string,
    name: string,
    metadata: FormMetadataAdvanced,
    options?: { description?: string; category?: string; tags?: string[] }
  ): FormTemplate {
    const template: FormTemplate = {
      id,
      name,
      description: options?.description || "",
      metadata: JSON.parse(JSON.stringify(metadata)),
      createdAt: new Date(),
      updatedAt: new Date(),
      category: (options?.category as any) || "master",
      tags: options?.tags || [],
    };

    this.templates.set(id, template);
    return template;
  }

  /**
   * Apply template to create new form
   */
  applyTemplate(templateId: string, newFormId: string, overrides?: Partial<FormMetadataAdvanced>): FormMetadataAdvanced | null {
    const template = this.templates.get(templateId);
    if (!template) return null;

    // Deep clone template metadata
    const newMetadata = JSON.parse(JSON.stringify(template.metadata));

    // Apply overrides
    if (overrides) {
      Object.assign(newMetadata, overrides);
    }

    // Update IDs
    newMetadata.id = newFormId;
    newMetadata.apiEndpoint = `/api/${newFormId.toLowerCase()}`;

    return newMetadata;
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): FormTemplate | null {
    return this.templates.get(templateId) || null;
  }

  /**
   * List templates by category
   */
  listTemplatesByCategory(category: string): FormTemplate[] {
    return Array.from(this.templates.values()).filter((t) => t.category === category);
  }

  /**
   * Search templates
   */
  searchTemplates(query: string): FormTemplate[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.templates.values()).filter(
      (t) =>
        t.name.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery) ||
        t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get all templates
   */
  getAllTemplates(): FormTemplate[] {
    return Array.from(this.templates.values());
  }
}

export const templateEngine = new TemplateEngine();
