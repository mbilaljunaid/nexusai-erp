/**
 * Metadata Infrastructure - Centralized exports
 */

export { MetadataValidator, metadataValidator } from "./validator";
export { MetadataRegistry, metadataRegistry } from "./registry";
export { FormSchemaGenerator, formSchemaGenerator } from "./schemaGenerator";
export { GL_CHART_OF_ACCOUNTS, FORM_GL_MAPPINGS, getGLMappingsForForm, isValidGLAccount, getGLAccountDetails } from "./glMappings";
export {
  createSimpleMasterDataMetadata,
  createStandardTransactionMetadata,
  createInvoiceMetadata,
  createEmployeeMetadata,
  createPurchaseOrderMetadata,
  createPayrollMetadata,
} from "./templates";
export { MetadataMigrator, executeMigration } from "./migrator";
