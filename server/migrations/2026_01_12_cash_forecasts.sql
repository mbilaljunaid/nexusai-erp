
CREATE TABLE IF NOT EXISTS "cash_forecasts" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    "bank_account_id" varchar,
    "forecast_date" timestamp NOT NULL,
    "amount" numeric(20, 2) NOT NULL,
    "currency" varchar(10) DEFAULT 'USD',
    "description" text NOT NULL,
    "type" varchar(20) DEFAULT 'MANUAL',
    "created_at" timestamp DEFAULT now()
);
