
import { pgTable, serial, text, varchar, numeric, timestamp, boolean, integer, primaryKey } from "drizzle-orm/pg-core";
import { z } from "zod";

// 1. Asset Books (Corporate, Tax, etc.)
export const faAssetBooks = pgTable("fa_asset_books", {
    bookTypeCode: varchar("book_type_code", { length: 30 }).primaryKey(),
    bookName: varchar("book_name", { length: 100 }).notNull(),
    description: text("description"),
    currentOpenPeriod: varchar("current_open_period", { length: 20 }), // e.g. "JAN-26"
    active: boolean("active").default(true),
    createdAt: timestamp("created_at").defaultNow()
});

export const insertFaAssetBookSchema = z.object({
    bookTypeCode: z.string().min(1).max(30),
    bookName: z.string().min(1),
    description: z.string().optional(),
    currentOpenPeriod: z.string().optional()
});

export type FaAssetBook = typeof faAssetBooks.$inferSelect;
export type InsertFaAssetBook = typeof faAssetBooks.$inferInsert;

// 2. Asset Categories
export const faCategories = pgTable("fa_categories", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    majorCategory: varchar("major_category", { length: 100 }), // e.g. "Furniture", "Computer"
    defaultLifeMonths: integer("default_life_months"),
    defaultMethodCode: varchar("default_method_code", { length: 30 }), // Link to Methods (e.g. STL)
    active: boolean("active").default(true)
});

export const insertFaCategorySchema = z.object({
    name: z.string().min(1),
    majorCategory: z.string().optional(),
    defaultLifeMonths: z.number().int().optional(),
    defaultMethodCode: z.string().optional()
});

export type FaCategory = typeof faCategories.$inferSelect;
export type InsertFaCategory = typeof faCategories.$inferInsert;

// 3. Asset Additions (The Asset Header)
export const faAdditions = pgTable("fa_additions", {
    id: serial("id").primaryKey(),
    assetNumber: varchar("asset_number", { length: 50 }).notNull().unique(),
    description: text("description").notNull(),
    tagNumber: varchar("tag_number", { length: 50 }),
    categoryId: integer("category_id").notNull(), // FK to faCategories but enforce in app logic
    manufacturer: varchar("manufacturer", { length: 100 }),
    model: varchar("model", { length: 100 }),
    serialNumber: varchar("serial_number", { length: 100 }),
    datePlacedInService: timestamp("date_placed_in_service").notNull(),
    originalCost: numeric("original_cost", { precision: 12, scale: 2 }).notNull(),
    salvageValue: numeric("salvage_value", { precision: 12, scale: 2 }).default("0"),
    units: integer("units").default(1),
    status: varchar("status", { length: 30 }).default("Active"), // Active, Retired
    location: varchar("location", { length: 100 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow()
});

export const insertFaAdditionSchema = z.object({
    assetNumber: z.string().min(1),
    description: z.string().min(1),
    tagNumber: z.string().optional(),
    categoryId: z.number().int(),
    manufacturer: z.string().optional(),
    model: z.string().optional(),
    serialNumber: z.string().optional(),
    datePlacedInService: z.string().or(z.date()), // Zod handles coercion usually or handle in service
    originalCost: z.number(),
    salvageValue: z.number().optional(),
    units: z.number().int().optional(),
    location: z.string().optional()
});

export type FaAddition = typeof faAdditions.$inferSelect;
export type InsertFaAddition = typeof faAdditions.$inferInsert;

// 4. Asset Books Association (Depreciation Rules per Book)
export const faBooks = pgTable("fa_books", {
    assetId: integer("asset_id").notNull(),
    bookTypeCode: varchar("book_type_code", { length: 30 }).notNull(),
    cost: numeric("cost", { precision: 12, scale: 2 }).notNull(), // Can differ from originalCost
    depreciateFlag: boolean("depreciate_flag").default(true),
    methodCode: varchar("method_code", { length: 30 }).notNull(), // STL, HY_STL, etc.
    lifeInMonths: integer("life_in_months").notNull(),
    datePlacedInService: timestamp("date_placed_in_service").notNull(),
    ytdDepreciation: numeric("ytd_depreciation", { precision: 12, scale: 2 }).default("0"),
    depreciationReserve: numeric("depreciation_reserve", { precision: 12, scale: 2 }).default("0"),
    netBookValue: numeric("net_book_value", { precision: 12, scale: 2 }).notNull(), // Calc field stored
    createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
    pk: primaryKey({ columns: [table.assetId, table.bookTypeCode] })
}));

export const insertFaBookSchema = z.object({
    assetId: z.number().int(),
    bookTypeCode: z.string(),
    cost: z.number(),
    depreciateFlag: z.boolean().optional(),
    methodCode: z.string(),
    lifeInMonths: z.number().int(),
    datePlacedInService: z.string().or(z.date()),
    ytdDepreciation: z.number().optional(),
    depreciationReserve: z.number().optional(),
    netBookValue: z.number().optional()
});

export type FaBook = typeof faBooks.$inferSelect;
export type InsertFaBook = typeof faBooks.$inferInsert;

// 5. Transaction Headers (History)
export const faTransactionHeaders = pgTable("fa_transaction_headers", {
    id: serial("id").primaryKey(),
    assetId: integer("asset_id").notNull(),
    bookTypeCode: varchar("book_type_code", { length: 30 }).notNull(),
    transactionType: varchar("transaction_type", { length: 30 }).notNull(), // ADDITION, DEPRECIATION, ADJUSTMENT
    transactionDate: timestamp("transaction_date").defaultNow(),
    dateEffective: timestamp("date_effective"),
    amount: numeric("amount", { precision: 12, scale: 2 }).default("0"), // Impact amount
    comments: text("comments")
});

export const insertFaTransactionSchema = z.object({
    assetId: z.number().int(),
    bookTypeCode: z.string(),
    transactionType: z.string(),
    transactionDate: z.string().optional().nullable(),
    dateEffective: z.string().optional().nullable(),
    amount: z.number().optional(),
    comments: z.string().optional()
});

export type FaTransactionHeader = typeof faTransactionHeaders.$inferSelect;
export type InsertFaTransactionHeader = typeof faTransactionHeaders.$inferInsert;

// 6. Depreciation Summary (Periodic)
export const faDepreciationSummary = pgTable("fa_depreciation_summary", {
    assetId: integer("asset_id").notNull(),
    bookTypeCode: varchar("book_type_code", { length: 30 }).notNull(),
    periodName: varchar("period_name", { length: 20 }).notNull(),
    depreciationAmount: numeric("depreciation_amount", { precision: 12, scale: 2 }).notNull(),
    ytdDepreciation: numeric("ytd_depreciation", { precision: 12, scale: 2 }).notNull(),
    depreciationReserve: numeric("depreciation_reserve", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
    pk: primaryKey({ columns: [table.assetId, table.bookTypeCode, table.periodName] })
}));

export type FaDepreciationSummary = typeof faDepreciationSummary.$inferSelect;
