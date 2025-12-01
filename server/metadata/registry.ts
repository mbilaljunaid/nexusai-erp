/**
 * Metadata Registry - Manages form metadata with caching and validation
 */

import { FormMetadataAdvanced, FormSchemaCache, MigrationResult } from "@shared/types/metadata";
import { metadataValidator } from "./validator";
import { formSchemaGenerator } from "./schemaGenerator";

export class MetadataRegistry {
  private cache: Map<string, FormMetadataAdvanced> = new Map();
  private schemaCache: Map<string, FormSchemaCache> = new Map();
  private metadata: Map<string, FormMetadataAdvanced> = new Map();
  private cacheEnabled: boolean = true;
  private cacheTTL: number = 3600000; // 1 hour in ms

  constructor(initialMetadata?: Record<string, FormMetadataAdvanced>) {
    if (initialMetadata) {
      for (const [key, meta] of Object.entries(initialMetadata)) {
        this.registerMetadata(key, meta);
      }
    }
  }

  /**
   * Register metadata for a form
   */
  registerMetadata(formId: string, metadata: FormMetadataAdvanced): void {
    // Validate metadata before registering
    const validationResult = metadataValidator.validateMetadataStructure(metadata);
    if (!validationResult.valid) {
      console.error(`Invalid metadata for form ${formId}:`, validationResult.errors);
      throw new Error(`Invalid metadata for form ${formId}`);
    }

    this.metadata.set(formId, metadata);
    if (this.cacheEnabled) {
      this.cache.set(formId, metadata);
    }
  }

  /**
   * Get metadata for a form
   */
  getMetadata(formId: string): FormMetadataAdvanced | null {
    if (this.cacheEnabled && this.cache.has(formId)) {
      return this.cache.get(formId) || null;
    }

    return this.metadata.get(formId) || null;
  }

  /**
   * Get all registered metadata
   */
  getAllMetadata(): Map<string, FormMetadataAdvanced> {
    return new Map(this.metadata);
  }

  /**
   * Check if metadata exists
   */
  hasMetadata(formId: string): boolean {
    return this.metadata.has(formId);
  }

  /**
   * Get metadata by module
   */
  getByModule(module: string): FormMetadataAdvanced[] {
    const result: FormMetadataAdvanced[] = [];
    for (const meta of this.metadata.values()) {
      if (meta.module === module) {
        result.push(meta);
      }
    }
    return result;
  }

  /**
   * Get metadata by category
   */
  getByCategory(category: string): FormMetadataAdvanced[] {
    const result: FormMetadataAdvanced[] = [];
    for (const meta of this.metadata.values()) {
      if (meta.category === category) {
        result.push(meta);
      }
    }
    return result;
  }

  /**
   * Get Zod schema for form
   */
  getFormSchema(formId: string): any {
    if (this.schemaCache.has(formId)) {
      const cached = this.schemaCache.get(formId);
      if (cached && cached.ttl && Date.now() - cached.createdAt.getTime() < cached.ttl) {
        return cached.schema;
      }
    }

    const metadata = this.getMetadata(formId);
    if (!metadata) {
      throw new Error(`Metadata not found for form ${formId}`);
    }

    const schema = formSchemaGenerator.generateZodSchema(metadata);
    const cacheEntry: FormSchemaCache = {
      formId,
      schema,
      insertSchema: formSchemaGenerator.generateInsertSchema(metadata),
      selectSchema: formSchemaGenerator.generateSelectSchema(metadata),
      createdAt: new Date(),
      ttl: this.cacheTTL,
    };

    this.schemaCache.set(formId, cacheEntry);
    return schema;
  }

  /**
   * Get GL configuration for form
   */
  getGLConfig(formId: string): any {
    const metadata = this.getMetadata(formId);
    if (!metadata || !metadata.glConfig) {
      return null;
    }
    return metadata.glConfig;
  }

  /**
   * Get workflow transitions for form
   */
  getWorkflowTransitions(formId: string): any[] {
    const metadata = this.getMetadata(formId);
    if (!metadata || !metadata.statusWorkflow) {
      return [];
    }
    return metadata.statusWorkflow;
  }

  /**
   * Get linked forms
   */
  getLinkedForms(formId: string): any[] {
    const metadata = this.getMetadata(formId);
    if (!metadata || !metadata.linkedForms) {
      return [];
    }
    return metadata.linkedForms;
  }

  /**
   * Get available transitions for current status
   */
  getAvailableTransitions(formId: string, currentStatus: string): any[] {
    const transitions = this.getWorkflowTransitions(formId);
    return transitions.filter((t) => t.fromStatus === currentStatus);
  }

  /**
   * Validate transition is allowed
   */
  isValidTransition(formId: string, fromStatus: string, toStatus: string): boolean {
    const transitions = this.getWorkflowTransitions(formId);
    return transitions.some((t) => t.fromStatus === fromStatus && t.toStatus === toStatus);
  }

  /**
   * Validate metadata structure
   */
  validateMetadata(metadata: FormMetadataAdvanced): any {
    return metadataValidator.validateMetadataStructure(metadata);
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear();
    this.schemaCache.clear();
  }

  /**
   * Clear cache for specific form
   */
  invalidateCache(formId: string): void {
    this.cache.delete(formId);
    this.schemaCache.delete(formId);
  }

  /**
   * Enable/disable caching
   */
  setCachingEnabled(enabled: boolean): void {
    this.cacheEnabled = enabled;
    if (!enabled) {
      this.clearCache();
    }
  }

  /**
   * Set cache TTL
   */
  setCacheTTL(ttlMs: number): void {
    this.cacheTTL = ttlMs;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): any {
    return {
      cacheSize: this.cache.size,
      schemaCacheSize: this.schemaCache.size,
      totalMetadata: this.metadata.size,
      cacheEnabled: this.cacheEnabled,
      cacheTTL: this.cacheTTL,
    };
  }

  /**
   * Export metadata as JSON
   */
  exportMetadata(): Record<string, FormMetadataAdvanced> {
    const result: Record<string, FormMetadataAdvanced> = {};
    for (const [key, meta] of this.metadata) {
      result[key] = meta;
    }
    return result;
  }

  /**
   * Import metadata from JSON
   */
  importMetadata(data: Record<string, FormMetadataAdvanced>, validate: boolean = true): MigrationResult {
    const result: MigrationResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const [formId, metadata] of Object.entries(data)) {
      try {
        if (validate) {
          const validationResult = metadataValidator.validateMetadataStructure(metadata);
          if (!validationResult.valid) {
            throw new Error(validationResult.errors.map((e) => e.message).join("; "));
          }
        }

        this.registerMetadata(formId, metadata);
        result.success++;
      } catch (error: any) {
        result.failed++;
        result.errors.push({
          formId,
          error: error.message,
        });
      }
    }

    return result;
  }

  /**
   * Get forms by status
   */
  getByStatus(status: "draft" | "active" | "deprecated"): FormMetadataAdvanced[] {
    const result: FormMetadataAdvanced[] = [];
    for (const meta of this.metadata.values()) {
      if (meta.status === status) {
        result.push(meta);
      }
    }
    return result;
  }

  /**
   * Search forms by name
   */
  searchByName(query: string): FormMetadataAdvanced[] {
    const lowerQuery = query.toLowerCase();
    const result: FormMetadataAdvanced[] = [];
    for (const meta of this.metadata.values()) {
      if (meta.name.toLowerCase().includes(lowerQuery) || meta.id.toLowerCase().includes(lowerQuery)) {
        result.push(meta);
      }
    }
    return result;
  }

  /**
   * Get forms with GL configuration
   */
  getFormsWithGLConfig(): FormMetadataAdvanced[] {
    const result: FormMetadataAdvanced[] = [];
    for (const meta of this.metadata.values()) {
      if (meta.glConfig && meta.glConfig.glMappings.length > 0) {
        result.push(meta);
      }
    }
    return result;
  }

  /**
   * Get forms with workflow configuration
   */
  getFormsWithWorkflow(): FormMetadataAdvanced[] {
    const result: FormMetadataAdvanced[] = [];
    for (const meta of this.metadata.values()) {
      if (meta.statusWorkflow && meta.statusWorkflow.length > 0) {
        result.push(meta);
      }
    }
    return result;
  }
}

export const metadataRegistry = new MetadataRegistry();
