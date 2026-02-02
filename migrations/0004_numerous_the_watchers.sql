ALTER TABLE "crm_opportunity_line_items" ALTER COLUMN "price_book_entry_id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "price_book_id" varchar;--> statement-breakpoint
ALTER TABLE "crm_quote_line_items" ADD COLUMN "price_book_entry_id" varchar;--> statement-breakpoint
ALTER TABLE "crm_quotes" ADD COLUMN "price_book_id" varchar;