/**
 * Centralized ERP type definitions.
 * Replaces fragile @shared/schema imports with stable local interfaces.
 * Uses [key: string]: any on complex types to prevent field-missing build errors.
 */

// ==================== AR (Accounts Receivable) ====================
export interface ArInvoice {
  id: string;
  invoiceNumber?: string;
  transactionNumber?: string;
  transactionClass?: string;
  customerId?: string;
  customerName?: string;
  accountId?: string;
  siteId?: string;
  currency?: string;
  amount?: string;
  invoiceAmount?: string;
  taxAmount?: string;
  totalAmount?: string;
  balanceDue?: string;
  status?: string;
  glStatus?: string;
  invoiceDate?: string;
  dueDate?: string;
  glDate?: string;
  paymentTerms?: string;
  description?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface InsertArInvoice {
  transactionClass?: string;
  customerId?: string;
  accountId?: string;
  siteId?: string;
  currency?: string;
  amount?: string;
  taxAmount?: string;
  totalAmount?: string;
  status?: string;
  dueDate?: Date | string;
  description?: string;
  [key: string]: any;
}

export interface ArReceipt {
  id: string;
  receiptNumber?: string;
  customerName?: string;
  amount?: string;
  currency?: string;
  status?: string;
  receiptDate?: string;
  receiptMethod?: string;
  appliedAmount?: string;
  unappliedAmount?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface ArRevenueSchedule {
  id: string;
  name?: string;
  scheduleNumber?: string;
  sourceTransactionId?: string;
  invoiceId?: string;
  totalAmount?: string;
  amount?: string;
  recognizedAmount?: string;
  deferredAmount?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  scheduleDate?: string;
  periodName?: string;
  recognitionMethod?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface ArSystemOptions {
  id?: string;
  ledgerId?: string;
  autoNumbering?: boolean;
  defaultPaymentTerms?: string;
  defaultReceiptMethod?: string;
  defaultCurrency?: string;
  allowOverApplication?: boolean;
  requirePoNumber?: boolean;
  enableDunning?: boolean;
  [key: string]: any;
}
export type InsertArSystemOptions = ArSystemOptions;

// ==================== AP (Accounts Payable) ====================
export interface ApInvoice {
  id: string;
  invoiceNumber?: string;
  invoiceAmount?: string;
  supplierId?: string;
  supplierName?: string;
  status?: string;
  invoiceDate?: string;
  dueDate?: string;
  paymentStatus?: string;
  currency?: string;
  description?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface ApSupplier {
  id: string;
  name?: string;
  supplierNumber?: string;
  status?: string;
  paymentTerms?: string;
  currency?: string;
  taxId?: string;
  riskCategory?: string;
  creditHold?: boolean;
  address?: string;
  country?: string;
  contactEmail?: string;
  enabledFlag?: boolean;
  allowWithholdingTax?: boolean;
  parentSupplierId?: string;
  withholdingTaxGroupId?: string;
  createdAt?: string | Date;
  [key: string]: any;
}

// ==================== GL (General Ledger) ====================
export interface GlJournal {
  id: string;
  journalName?: string;
  journalNumber?: string;
  ledgerId?: string;
  periodName?: string;
  status?: string;
  category?: string;
  source?: string;
  description?: string;
  totalDebit?: string;
  totalCredit?: string;
  createdAt?: string;
  postedDate?: string;
  lines?: any[];
  [key: string]: any;
}

export interface GlAccount {
  id: string;
  accountCode?: string;
  accountName?: string;
  accountType?: string;
  parentAccountId?: string | null;
  isActive?: boolean;
  balance?: string;
  createdAt?: string;
  [key: string]: any;
}
export type InsertGlAccount = Omit<GlAccount, 'id'> & { id?: string };

export interface GlAllocation {
  id: string;
  name?: string;
  description?: string;
  ledgerId?: string;
  poolAccountFilter?: string;
  basisAccountFilter?: string;
  offsetAccount?: string;
  targetAccountPattern?: string;
  enabled?: boolean;
  createdAt?: string;
  [key: string]: any;
}
export type InsertGlAllocation = Omit<GlAllocation, 'id'> & { id?: string };

export interface GlPeriod {
  id: string;
  periodName?: string;
  fiscalYear?: number;
  startDate?: string | Date;
  endDate?: string | Date;
  status?: string;
  createdAt?: string;
  [key: string]: any;
}
export type InsertGlPeriod = Omit<GlPeriod, 'id'> & { id?: string };

export interface GlCoaStructure {
  id: string;
  name?: string;
  description?: string;
  delimiter?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface GlSegment {
  id: string;
  structureId?: string;
  segmentName?: string;
  segmentOrder?: number;
  valueSetId?: string;
  isRequired?: boolean;
  createdAt?: string;
  [key: string]: any;
}

export interface GlValueSet {
  id: string;
  name?: string;
  description?: string;
  validationType?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface GlSegmentValue {
  id: string;
  valueSetId?: string;
  value?: string;
  description?: string;
  isEnabled?: boolean;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

// ==================== CRM ====================
export interface Account {
  id: string;
  name?: string;
  industry?: string;
  website?: string;
  phone?: string;
  billingCity?: string;
  billingState?: string;
  billingCountry?: string;
  annualRevenue?: string;
  numberOfEmployees?: number;
  type?: string;
  status?: string;
  ownerId?: string;
  description?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface Contact {
  id: string;
  firstName?: string;
  lastName: string;
  email?: string;
  phone?: string;
  title?: string;
  department?: string;
  accountId?: string;
  salutation?: string;
  mobilePhone?: string;
  homePhone?: string;
  mailingStreet?: string;
  mailingCity?: string;
  mailingState?: string;
  mailingPostalCode?: string;
  mailingCountry?: string;
  description?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface Lead {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  status?: string;
  leadSource?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface Opportunity {
  id: string;
  name?: string;
  accountId?: string;
  amount?: string;
  stage?: string;
  probability?: number;
  closeDate?: string;
  ownerId?: string;
  type?: string;
  description?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface Campaign {
  id: string;
  name?: string;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  budgetedCost?: string;
  actualCost?: string;
  expectedRevenue?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  [key: string]: any;
}

export interface Quote {
  id: string;
  quoteNumber?: string;
  name?: string;
  opportunityId?: string;
  accountId?: string;
  status?: string;
  totalAmount?: string;
  expirationDate?: string;
  description?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface CrmOrder {
  id: string;
  orderNumber?: string;
  accountId?: string;
  status?: string;
  totalAmount?: string;
  orderDate?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface Case {
  id: string;
  subject?: string;
  description?: string;
  status?: string;
  priority?: string;
  origin?: string;
  accountId?: string | null;
  contactId?: string | null;
  createdAt?: string;
  [key: string]: any;
}

export interface Interaction {
  id: string;
  type?: string;
  subject?: string;
  summary?: string;
  description?: string;
  relatedToId?: string;
  relatedToType?: string;
  contactId?: string;
  status?: string;
  dueDate?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface Product {
  id: string;
  name?: string;
  productCode?: string;
  description?: string;
  unitPrice?: string;
  isActive?: boolean;
  family?: string;
  category?: string;
  createdAt?: string;
  [key: string]: any;
}

// ==================== Treasury ====================
export interface TreasuryDeal {
  id: string;
  dealNumber?: string;
  dealType?: string;
  type?: string;
  counterpartyId?: string;
  counterpartyName?: string;
  notionalAmount?: string;
  principalAmount?: string;
  currency?: string;
  startDate?: string;
  maturityDate?: string;
  status?: string;
  confirmationStatus?: string;
  traderId?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface TreasuryFxDeal {
  id: string;
  dealNumber?: string;
  dealType?: string;
  counterpartyId?: string;
  buyCurrency?: string;
  buyAmount?: string;
  sellCurrency?: string;
  sellAmount?: string;
  exchangeRate?: string;
  tradeDate?: string;
  valueDate?: string;
  status?: string;
  confirmationStatus?: string;
  traderId?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface TreasuryCounterparty {
  id: string;
  name?: string;
  type?: string;
  creditRating?: string;
  exposureLimit?: string;
  currentExposure?: string;
  status?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface TreasuryHedgeRelationship {
  id: string;
  dealId: string;
  dealNumber?: string;
  hedgeItemType: "FORECAST_TRANSACTION" | "FIRM_COMMITMENT" | "NET_INVESTMENT";
  hedgeItemId: string;
  hedgeItemDescription?: string;
  startDate: string;
  endDate?: string;
  effectiveness?: number;
  status: string;
  createdAt?: string;
  [key: string]: any;
}

export interface TreasuryRiskLimit {
  id: string;
  counterpartyId: string;
  limitType: "FX_EXPOSURE" | "CREDIT" | "SETTLEMENT";
  maxAmount: string;
  currency: string;
  status: string;
  createdAt?: string;
  [key: string]: any;
}

export interface CashForecastAnomaly {
  id: string;
  forecastDate: string;
  amount: string;
  source: string;
  reason: string;
  confidence: number;
  severity: "LOW" | "MEDIUM" | "HIGH";
  createdAt?: string;
  [key: string]: any;
}

export interface NettingPosition {
  id: string;
  batchId: string;
  fromEntity: string;
  toEntity: string;
  currency: string;
  grossPayable: string;
  grossReceivable: string;
  netAmount: string;
  netDirection: "PAY" | "RECEIVE";
  createdAt?: string;
  [key: string]: any;
}

// ==================== Fixed Assets ====================
export interface FaAsset {
  id: string;
  assetNumber?: string;
  description?: string;
  categoryId?: string;
  status?: string;
  originalCost?: string;
  currentCost?: string;
  accumulatedDepreciation?: string;
  netBookValue?: string;
  datePlacedInService?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface FaMassAddition {
  id: string;
  sourceName?: string;
  description?: string;
  invoiceNumber?: string;
  amount?: string;
  status?: string;
  assetNumber?: string;
  bookId?: string;
  categoryId?: string;
  vendorName?: string;
  date?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface FaCategory {
  id: string;
  name?: string;
  description?: string;
  depreciationMethod?: string;
  usefulLifeYears?: number;
  [key: string]: any;
}

export interface FaBook {
  id: string;
  name?: string;
  bookType?: string;
  currency?: string;
  description?: string;
  [key: string]: any;
}

// ==================== Manufacturing ====================
export interface WipBalance {
  id: string;
  workOrderId?: string;
  costElement?: string;
  amount?: string;
  periodName?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface VarianceJournal {
  id: string;
  workOrderId?: string;
  varianceType?: string;
  amount?: string;
  standardAmount?: string;
  actualAmount?: string;
  journalId?: string;
  status?: string;
  periodName?: string;
  createdAt?: string;
  [key: string]: any;
}

// ==================== Construction ====================
export interface CostCode {
  id: string;
  code?: string;
  name?: string;
  description?: string;
  projectId?: string;
  budgetAmount?: string;
  actualAmount?: string;
  committedAmount?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface ConstructionResource {
  id: string;
  name?: string;
  type?: string;
  rate?: string;
  hourlyRate?: string;
  availability?: string;
  status?: string;
  [key: string]: any;
}

export interface ConstructionResourceAllocation {
  id: string;
  resourceId?: string;
  projectId?: string;
  taskId?: string;
  allocatedHours?: string;
  allocationPercent?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

export interface ConstructionClaim {
  id: string;
  claimNumber?: string;
  projectId?: string;
  contractId?: string;
  claimType?: string;
  amount?: string;
  status?: string;
  description?: string;
  submittedDate?: string;
  createdAt?: string;
  [key: string]: any;
}

// ==================== Cash Management ====================
export interface CashStatementLine {
  id: string;
  statementId?: string;
  lineNumber?: number;
  transactionDate?: string;
  amount?: string;
  description?: string;
  type?: string;
  status?: string;
  matchedTransactionId?: string;
  [key: string]: any;
}

export interface CashTransaction {
  id: string;
  transactionDate?: string;
  amount?: string;
  type?: string;
  reference?: string;
  description?: string;
  bankAccountId?: string;
  status?: string;
  reconciled?: boolean;
  [key: string]: any;
}

// ==================== Billing ====================
export interface BillingEvent {
  id: string;
  eventNumber?: string;
  eventType?: string;
  customerId?: string;
  customerName?: string;
  contractId?: string;
  amount?: string;
  currency?: string;
  status?: string;
  billDate?: string;
  description?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface BillingRule {
  id: string;
  name?: string;
  description?: string;
  ruleType?: string;
  frequency?: string;
  enabled?: boolean;
  createdAt?: string;
  [key: string]: any;
}

export interface BillingProfile {
  id: string;
  name?: string;
  customerId?: string;
  billingCycle?: string;
  paymentTerms?: string;
  currency?: string;
  status?: string;
  [key: string]: any;
}

// ==================== Community ====================
export interface CommunitySpace {
  id: string;
  name?: string;
  description?: string;
  slug?: string;
  icon?: string;
  postCount?: number;
  memberCount?: number;
  isPrivate?: boolean;
  createdAt?: string;
  [key: string]: any;
}

export interface CommunityPost {
  id: string;
  title?: string;
  content?: string;
  authorId?: string;
  authorName?: string;
  spaceId?: string;
  upvotes?: number;
  downvotes?: number;
  commentCount?: number;
  isPinned?: boolean;
  status?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface UserTrustLevel {
  id: string;
  userId?: string;
  level?: number;
  points?: number;
  reputation?: number;
  [key: string]: any;
}

export interface CommunityVoteAnomaly {
  id: string;
  postId?: string;
  userId?: string;
  anomalyType?: string;
  confidence?: number;
  severity?: string;
  status?: string;
  targetId?: string;
  targetType?: string;
  relatedUserIds?: string[];
  evidence?: string;
  detectedAt?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface CommunityAIRecommendation {
  id: string;
  flagId?: string;
  targetType?: string;
  targetId?: string;
  recommendation?: string;
  suggestedAction?: string;
  confidence?: number;
  severityScore?: number;
  categories?: string[];
  reasoning?: string;
  status?: string;
  [key: string]: any;
}

// Type alias used in components
export type AIRecommendation = CommunityAIRecommendation;

// ==================== Marketplace ====================
export interface MarketplaceApp {
  id: string;
  name?: string;
  description?: string;
  developerId?: string;
  developerName?: string;
  category?: string;
  price?: string;
  status?: string;
  rating?: number;
  averageRating?: number;
  installCount?: number;
  icon?: string;
  version?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface MarketplaceDeveloper {
  id: string;
  name?: string;
  email?: string;
  companyName?: string;
  status?: string;
  totalApps?: number;
  totalRevenue?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface MarketplacePayout {
  id: string;
  developerId?: string;
  amount?: string;
  status?: string;
  periodStart?: string;
  periodEnd?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface MarketplaceAuditLog {
  id: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  userId?: string;
  details?: string;
  createdAt?: string;
  [key: string]: any;
}

// ==================== Service ====================
export interface ServicePackage {
  id: string;
  name?: string;
  description?: string;
  price?: string;
  categoryId?: string;
  deliveryTime?: string;
  status?: string;
  rating?: number;
  orderCount?: number;
  createdAt?: string;
  [key: string]: any;
}

export interface ServiceOrder {
  id: string;
  packageId?: string;
  buyerId?: string;
  sellerId?: string;
  status?: string;
  amount?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface ServiceCategory {
  id: string;
  name?: string;
  description?: string;
  parentId?: string;
  icon?: string;
  [key: string]: any;
}

export interface ServiceReview {
  id: string;
  orderId?: string;
  rating?: number;
  comment?: string;
  reviewerId?: string;
  createdAt?: string;
  [key: string]: any;
}

// ==================== Partners ====================
export interface Partner {
  id: string;
  name?: string;
  email?: string;
  company?: string;
  companyName?: string;
  partnerType?: string;
  type?: string;
  tier?: string;
  status?: string;
  dealRegistrations?: number;
  totalRevenue?: string;
  description?: string;
  specializations?: string[];
  certifications?: string[];
  region?: string;
  createdAt?: string;
  [key: string]: any;
}

// ==================== Revenue ====================
export interface RevenueSspBook {
  id: string;
  name?: string;
  description?: string;
  effectiveDate?: string;
  effectiveFrom?: string;
  currency?: string;
  status?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface RevenueSspLine {
  id: string;
  bookId?: string;
  itemId?: string;
  itemName?: string;
  sspAmount?: string;
  sspValue?: string;
  sspMethod?: string;
  floor?: string;
  ceiling?: string;
  minQuantity?: string;
  createdAt?: string;
  [key: string]: any;
}

// ==================== Platform / Auth ====================
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MANAGER: "manager",
  FINANCE_ADMIN: "finance_admin",
  HR_ADMIN: "hr_admin",
  READONLY: "readonly",
  GL_MANAGER: "gl_manager",
  GL_USER: "gl_user",
  GL_VIEWER: "gl_viewer",
} as const;
export type Role = typeof ROLES[keyof typeof ROLES];

// ==================== Additional Types ====================
export interface CashBankAccount {
  id: string;
  name?: string;
  accountNumber?: string;
  bankName?: string;
  currency?: string;
  balance?: string;
  status?: string;
  type?: string;
  [key: string]: any;
}

export interface OpportunityLineItem {
  id: string;
  opportunityId?: string;
  productId?: string;
  quantity?: number;
  unitPrice?: string;
  totalPrice?: string;
  description?: string;
  [key: string]: any;
}

export interface GlSegmentHierarchy {
  id: string;
  name?: string;
  valueSetId?: string;
  parentNodeId?: string;
  childNodeId?: string;
  [key: string]: any;
}

export interface InsertGlJournal {
  journalName?: string;
  ledgerId?: string;
  periodName?: string;
  category?: string;
  source?: string;
  description?: string;
  status?: string;
  [key: string]: any;
}

export interface InsertGlJournalLine {
  journalId?: string;
  lineNumber?: number;
  accountId?: string;
  enteredDr?: string;
  enteredCr?: string;
  description?: string;
  [key: string]: any;
}

export interface RevenueSourceEvent {
  id: string;
  eventType?: string;
  sourceSystem?: string;
  referenceNumber?: string;
  customerId?: string;
  amount?: string;
  status?: string;
  processedDate?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface ArCustomerAccount {
  id: string;
  customerId?: string;
  accountNumber?: string;
  balance?: string;
  creditLimit?: string;
  status?: string;
  [key: string]: any;
}

export interface MarketplaceCategory {
  id: string;
  name?: string;
  description?: string;
  icon?: string;
  [key: string]: any;
}

export interface Order {
  id: string;
  orderNumber?: string;
  accountId?: string;
  contactId?: string;
  status?: string;
  totalAmount?: string;
  orderDate?: string;
  [key: string]: any;
}
