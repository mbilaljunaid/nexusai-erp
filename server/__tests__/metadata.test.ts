/**
 * Metadata Infrastructure Tests - Phase 0 Foundation Tests
 */

import { metadataValidator } from "../metadata/validator";
import { metadataRegistry } from "../metadata/registry";
import { formSchemaGenerator } from "../metadata/schemaGenerator";
import { FormMetadataAdvanced } from "@shared/types/metadata";

describe("Phase 0: Metadata Foundation Tests", () => {
  // ===== VALIDATOR TESTS =====
  describe("MetadataValidator", () => {
    it("should validate correct metadata structure", () => {
      const validMetadata: FormMetadataAdvanced = {
        id: "test-form",
        name: "Test Form",
        apiEndpoint: "/api/test",
        module: "Testing",
        page: "/test",
        version: 1,
        status: "active",
        fields: [
          {
            name: "name",
            label: "Name",
            type: "text",
            required: true,
            searchable: true,
          },
          {
            name: "email",
            label: "Email",
            type: "email",
            required: false,
            searchable: true,
          },
        ],
        searchFields: ["name", "email"],
        displayField: "name",
        createButtonText: "Create Test",
        allowCreate: true,
        showSearch: true,
        breadcrumbs: [{ label: "Test", path: "/test" }],
      };

      const result = metadataValidator.validateMetadataStructure(validMetadata);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it("should reject metadata missing required fields", () => {
      const invalidMetadata: any = {
        name: "Test Form",
        // Missing id, apiEndpoint, etc.
      };

      const result = metadataValidator.validateMetadataStructure(invalidMetadata);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should validate GL configuration", () => {
      const validMetadata: FormMetadataAdvanced = {
        id: "invoice-form",
        name: "Invoice",
        apiEndpoint: "/api/invoices",
        module: "Finance",
        page: "/finance/invoices",
        version: 1,
        status: "active",
        fields: [
          {
            name: "amount",
            label: "Amount",
            type: "number",
            required: true,
            searchable: false,
          },
        ],
        searchFields: [],
        displayField: "amount",
        createButtonText: "Create Invoice",
        allowCreate: true,
        showSearch: false,
        breadcrumbs: [{ label: "Invoices", path: "/invoices" }],
        glConfig: {
          autoCreateGL: true,
          requireBalance: true,
          glMappings: [
            {
              account: "1200",
              debitCredit: "debit",
              amount: "dynamic",
              amountField: "amount",
              autoPost: true,
            },
            {
              account: "4000",
              debitCredit: "credit",
              amount: "dynamic",
              amountField: "amount",
              autoPost: true,
            },
          ],
        },
      };

      const result = metadataValidator.validateMetadataStructure(validMetadata);
      expect(result.valid).toBe(true);
    });

    it("should detect invalid GL accounts", () => {
      const invalidMetadata: FormMetadataAdvanced = {
        id: "invoice-form",
        name: "Invoice",
        apiEndpoint: "/api/invoices",
        module: "Finance",
        page: "/finance/invoices",
        version: 1,
        status: "active",
        fields: [
          {
            name: "amount",
            label: "Amount",
            type: "number",
            required: true,
            searchable: false,
          },
        ],
        searchFields: [],
        displayField: "amount",
        createButtonText: "Create Invoice",
        allowCreate: true,
        showSearch: false,
        breadcrumbs: [{ label: "Invoices", path: "/invoices" }],
        glConfig: {
          autoCreateGL: true,
          requireBalance: true,
          glMappings: [
            {
              account: "9999", // Invalid account
              debitCredit: "debit",
              amount: "dynamic",
              amountField: "amount",
              autoPost: true,
            },
          ],
        },
      };

      const result = metadataValidator.validateMetadataStructure(invalidMetadata);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes("Invalid GL account"))).toBe(true);
    });

    it("should validate email field values", () => {
      const field = {
        name: "email",
        label: "Email",
        type: "email" as const,
        required: true,
        searchable: true,
      };

      const validResult = metadataValidator.validateFieldValue(field, "test@example.com");
      expect(validResult.valid).toBe(true);

      const invalidResult = metadataValidator.validateFieldValue(field, "invalid-email");
      expect(invalidResult.valid).toBe(false);
    });
  });

  // ===== REGISTRY TESTS =====
  describe("MetadataRegistry", () => {
    const testMetadata: FormMetadataAdvanced = {
      id: "test-form",
      name: "Test Form",
      apiEndpoint: "/api/test",
      module: "Testing",
      page: "/test",
      version: 1,
      status: "active",
      fields: [
        {
          name: "name",
          label: "Name",
          type: "text",
          required: true,
          searchable: true,
        },
      ],
      searchFields: ["name"],
      displayField: "name",
      createButtonText: "Create Test",
      allowCreate: true,
      showSearch: true,
      breadcrumbs: [{ label: "Test", path: "/test" }],
    };

    it("should register metadata", () => {
      const registry = new (require("../metadata/registry").MetadataRegistry)();
      registry.registerMetadata("test", testMetadata);
      expect(registry.hasMetadata("test")).toBe(true);
    });

    it("should retrieve registered metadata", () => {
      const registry = new (require("../metadata/registry").MetadataRegistry)();
      registry.registerMetadata("test", testMetadata);
      const retrieved = registry.getMetadata("test");
      expect(retrieved?.id).toBe("test-form");
    });

    it("should get metadata by module", () => {
      const registry = new (require("../metadata/registry").MetadataRegistry)();
      registry.registerMetadata("test", testMetadata);
      const results = registry.getByModule("Testing");
      expect(results.length).toBeGreaterThan(0);
    });

    it("should generate Zod schema", () => {
      const registry = new (require("../metadata/registry").MetadataRegistry)();
      registry.registerMetadata("test", testMetadata);
      const schema = registry.getFormSchema("test");
      expect(schema).toBeDefined();
    });

    it("should cache metadata", () => {
      const registry = new (require("../metadata/registry").MetadataRegistry)();
      registry.setCachingEnabled(true);
      registry.registerMetadata("test", testMetadata);
      const stats = registry.getCacheStats();
      expect(stats.cacheSize).toBeGreaterThan(0);
    });
  });

  // ===== SCHEMA GENERATOR TESTS =====
  describe("FormSchemaGenerator", () => {
    const testMetadata: FormMetadataAdvanced = {
      id: "test-form",
      name: "Test Form",
      apiEndpoint: "/api/test",
      module: "Testing",
      page: "/test",
      version: 1,
      status: "active",
      fields: [
        {
          name: "name",
          label: "Name",
          type: "text",
          required: true,
          searchable: true,
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          required: false,
          searchable: true,
        },
        {
          name: "age",
          label: "Age",
          type: "number",
          required: false,
          searchable: false,
        },
      ],
      searchFields: ["name", "email"],
      displayField: "name",
      createButtonText: "Create Test",
      allowCreate: true,
      showSearch: true,
      breadcrumbs: [{ label: "Test", path: "/test" }],
    };

    it("should generate Zod schema from metadata", () => {
      const schema = formSchemaGenerator.generateZodSchema(testMetadata);
      expect(schema).toBeDefined();

      // Test valid data
      const validData = { name: "John", email: "john@example.com", age: 30 };
      expect(() => schema.parse(validData)).not.toThrow();

      // Test invalid data
      const invalidData = { name: "", email: "invalid" }; // Missing name (required)
      expect(() => schema.parse(invalidData)).toThrow();
    });

    it("should generate insert schema with read-only fields omitted", () => {
      const metadataWithReadOnly: FormMetadataAdvanced = {
        ...testMetadata,
        fields: [
          ...testMetadata.fields,
          {
            name: "id",
            label: "ID",
            type: "text",
            required: true,
            searchable: false,
            readOnly: true,
          },
        ],
      };

      const schema = formSchemaGenerator.generateInsertSchema(metadataWithReadOnly);
      // Schema should not include read-only field
      const testData = { name: "John", email: "john@example.com" };
      expect(() => schema.parse(testData)).not.toThrow();
    });

    it("should generate sample data", () => {
      const sampleData = formSchemaGenerator.generateSampleData(testMetadata);
      expect(sampleData).toBeDefined();
      expect(sampleData.name).toBeDefined();
      expect(typeof sampleData.name).toBe("string");
    });

    it("should get default values for fields", () => {
      for (const field of testMetadata.fields) {
        const defaultValue = formSchemaGenerator.getDefaultValue(field);
        expect(defaultValue).toBeDefined();
      }
    });

    it("should validate field values against schema", () => {
      const nameField = testMetadata.fields[0];
      const validResult = formSchemaGenerator.validateFieldValue(nameField, "John");
      expect(validResult.valid).toBe(true);

      const emailField = testMetadata.fields[1];
      const invalidEmailResult = formSchemaGenerator.validateFieldValue(emailField, "invalid");
      expect(invalidEmailResult.valid).toBe(false);
    });
  });

  // ===== INTEGRATION TESTS =====
  describe("Metadata Infrastructure Integration", () => {
    it("should complete end-to-end form validation and schema generation", () => {
      const metadata: FormMetadataAdvanced = {
        id: "integration-test",
        name: "Integration Test Form",
        apiEndpoint: "/api/integration",
        module: "Testing",
        page: "/test",
        version: 1,
        status: "active",
        fields: [
          {
            name: "title",
            label: "Title",
            type: "text",
            required: true,
            searchable: true,
            validations: [
              { type: "required", message: "Title is required" },
              { type: "min", value: 3, message: "Title must be at least 3 characters" },
            ],
          },
          {
            name: "amount",
            label: "Amount",
            type: "number",
            required: true,
            searchable: false,
            validations: [{ type: "min", value: 0.01, message: "Amount must be greater than 0" }],
          },
        ],
        searchFields: ["title"],
        displayField: "title",
        createButtonText: "Create",
        allowCreate: true,
        showSearch: true,
        breadcrumbs: [{ label: "Test", path: "/test" }],
      };

      // Step 1: Validate metadata
      const validationResult = metadataValidator.validateMetadataStructure(metadata);
      expect(validationResult.valid).toBe(true);

      // Step 2: Register in registry
      const registry = new (require("../metadata/registry").MetadataRegistry)();
      registry.registerMetadata(metadata.id, metadata);
      expect(registry.hasMetadata(metadata.id)).toBe(true);

      // Step 3: Generate schema
      const schema = registry.getFormSchema(metadata.id);
      expect(schema).toBeDefined();

      // Step 4: Generate sample data
      const sampleData = formSchemaGenerator.generateSampleData(metadata);
      expect(sampleData.title).toBeDefined();
      expect(sampleData.amount).toBeDefined();
    });
  });
});
