CREATE TABLE "crm_approval_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" varchar NOT NULL,
	"entity_id" varchar NOT NULL,
	"requester_id" varchar NOT NULL,
	"approver_id" varchar,
	"status" varchar DEFAULT 'Pending',
	"reason" text,
	"comments" text,
	"requested_at" timestamp DEFAULT now(),
	"responded_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "crm_campaign_members" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" varchar NOT NULL,
	"lead_id" varchar,
	"contact_id" varchar,
	"status" varchar DEFAULT 'Sent',
	"response_date" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "crm_commission_assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"plan_id" varchar NOT NULL,
	"effective_date" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "crm_commission_plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"type" varchar DEFAULT 'flat_rate' NOT NULL,
	"rate" numeric NOT NULL,
	"quota_threshold" numeric,
	"custom_formula" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "crm_commissions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"plan_id" varchar,
	"base_amount" numeric NOT NULL,
	"commission_amount" numeric NOT NULL,
	"status" varchar DEFAULT 'pending',
	"generated_at" timestamp DEFAULT now(),
	"paid_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "crm_competitors" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"website" varchar,
	"strengths" text,
	"weaknesses" text,
	"threat_level" varchar DEFAULT 'Medium',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "crm_competitors_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "crm_knowledge_articles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"category" text,
	"status" text DEFAULT 'Draft',
	"tags" text[],
	"author_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "crm_opportunity_competitors" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_id" varchar NOT NULL,
	"competitor_id" varchar NOT NULL,
	"status" varchar DEFAULT 'Active',
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "crm_quotas" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"period_name" varchar NOT NULL,
	"quota_amount" numeric DEFAULT '0' NOT NULL,
	"currency_code" varchar DEFAULT 'USD',
	"target_type" varchar DEFAULT 'Revenue',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "crm_service_appointments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"work_order_id" varchar NOT NULL,
	"technician_id" text,
	"scheduled_start" timestamp,
	"scheduled_end" timestamp,
	"actual_start" timestamp,
	"actual_end" timestamp,
	"status" text DEFAULT 'None',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "crm_service_work_orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"work_order_number" text,
	"case_id" varchar,
	"account_id" varchar,
	"contact_id" varchar,
	"subject" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'New',
	"priority" text DEFAULT 'Medium',
	"street" text,
	"city" text,
	"state" text,
	"postal_code" text,
	"country" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "crm_territories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"parent_id" varchar,
	"owner_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "crm_territory_rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"territory_id" varchar NOT NULL,
	"priority" integer DEFAULT 1,
	"field" varchar NOT NULL,
	"operator" varchar NOT NULL,
	"value" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gl_approval_history" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"journal_id" varchar NOT NULL,
	"action" varchar NOT NULL,
	"actor_id" varchar NOT NULL,
	"comments" text,
	"action_date" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gl_approval_rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"ledger_id" varchar NOT NULL,
	"min_amount" numeric(18, 2) DEFAULT '0',
	"max_amount" numeric(18, 2),
	"source" varchar,
	"category" varchar,
	"approver_role" varchar,
	"approver_user_id" varchar,
	"priority" integer DEFAULT 10,
	"enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"rule_name" varchar
);
--> statement-breakpoint
CREATE TABLE "gl_consolidation_runs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ledger_set_id" varchar NOT NULL,
	"period_id" varchar NOT NULL,
	"status" varchar DEFAULT 'Pending',
	"run_date" timestamp DEFAULT now(),
	"completed_date" timestamp,
	"total_eliminations" numeric(18, 2) DEFAULT '0',
	"error_log" text
);
--> statement-breakpoint
CREATE TABLE "gl_elimination_definitions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"ledger_set_id" varchar,
	"match_rule" varchar,
	"elimination_ledger_id" varchar,
	"threshold_amount" numeric(18, 2),
	"enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_grades" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"code" varchar NOT NULL,
	"name" varchar NOT NULL,
	"pay_scale_id" varchar,
	"active_status" varchar DEFAULT 'ACTIVE',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_jobs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"code" varchar NOT NULL,
	"name" varchar NOT NULL,
	"job_family_id" varchar,
	"valid_grade_id" varchar,
	"active_status" varchar DEFAULT 'ACTIVE',
	"fte" numeric(5, 2) DEFAULT '1.0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_locations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"code" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar,
	"active_status" varchar DEFAULT 'ACTIVE',
	"address_line_1" varchar,
	"address_line_2" varchar,
	"city" varchar,
	"state" varchar,
	"postal_code" varchar,
	"country" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_organizations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"classification_code" varchar NOT NULL,
	"location_id" varchar,
	"manager_id" varchar,
	"active_status" varchar DEFAULT 'ACTIVE',
	"tax_id" varchar,
	"registration_number" varchar,
	"legal_address_id" varchar,
	"parent_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_positions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"code" varchar NOT NULL,
	"name" varchar NOT NULL,
	"job_id" varchar NOT NULL,
	"department_id" varchar NOT NULL,
	"location_id" varchar,
	"headcount" integer DEFAULT 1,
	"hiring_status" varchar DEFAULT 'OPEN',
	"valid_grades" jsonb,
	"active_status" varchar DEFAULT 'ACTIVE',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"work_relationship_id" varchar NOT NULL,
	"person_id" varchar NOT NULL,
	"assignment_number" varchar NOT NULL,
	"assignment_status" varchar DEFAULT 'ACTIVE',
	"assignment_type" varchar DEFAULT 'E',
	"job_id" varchar,
	"position_id" varchar,
	"grade_id" varchar,
	"department_id" varchar,
	"location_id" varchar,
	"manager_id" varchar,
	"primary_assignment_flag" boolean DEFAULT true,
	"fte" numeric(5, 2) DEFAULT '1.0',
	"effective_start_date" date NOT NULL,
	"effective_end_date" date,
	"created_by" varchar,
	"updated_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_persons" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"person_number" varchar NOT NULL,
	"first_name" varchar NOT NULL,
	"middle_name" varchar,
	"last_name" varchar NOT NULL,
	"date_of_birth" date,
	"national_id" varchar,
	"country" varchar DEFAULT 'US',
	"email" varchar,
	"phone" varchar,
	"user_id" varchar,
	"created_by" varchar,
	"updated_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "hr_persons_person_number_unique" UNIQUE("person_number")
);
--> statement-breakpoint
CREATE TABLE "hr_work_relationships" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"person_id" varchar NOT NULL,
	"legal_employer_id" varchar NOT NULL,
	"date_start" date NOT NULL,
	"worker_type" varchar DEFAULT 'EMPLOYEE',
	"primary_flag" boolean DEFAULT true,
	"termination_date" date,
	"created_by" varchar,
	"updated_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_documents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"person_id" varchar NOT NULL,
	"document_type" varchar NOT NULL,
	"document_name" varchar NOT NULL,
	"document_number" varchar,
	"issuing_authority" varchar,
	"issue_date" date,
	"date_to" date,
	"attachment_url" varchar,
	"verification_status" varchar DEFAULT 'PENDING',
	"verified_by" varchar,
	"verified_at" timestamp,
	"created_by" varchar,
	"updated_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_allocated_checklists" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"person_id" varchar NOT NULL,
	"checklist_id" varchar NOT NULL,
	"status" varchar DEFAULT 'IN_PROGRESS',
	"progress" numeric DEFAULT '0',
	"assigned_date" date DEFAULT now(),
	"completed_date" date,
	"initiator_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_allocated_tasks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"allocated_checklist_id" varchar NOT NULL,
	"checklist_item_id" varchar,
	"task_name" varchar NOT NULL,
	"status" varchar DEFAULT 'PENDING',
	"completed_by" varchar,
	"completed_at" timestamp,
	"comments" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_checklist_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"checklist_id" varchar NOT NULL,
	"task_name" varchar NOT NULL,
	"description" varchar,
	"sequence" integer DEFAULT 1 NOT NULL,
	"mandatory" boolean DEFAULT true,
	"performer" varchar DEFAULT 'WORKER',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_checklists" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar,
	"category" varchar NOT NULL,
	"status" varchar DEFAULT 'ACTIVE',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_audit_approvals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"form_id" varchar NOT NULL,
	"record_id" varchar NOT NULL,
	"workflow_id" varchar,
	"step_order" integer DEFAULT 1,
	"requested_by" varchar NOT NULL,
	"requested_at" timestamp DEFAULT now(),
	"status" varchar DEFAULT 'pending',
	"approvers" jsonb NOT NULL,
	"required_approvals" integer DEFAULT 1,
	"current_approvals" integer DEFAULT 0,
	"rejection_reason" varchar,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "hr_audit_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"entity_type" varchar NOT NULL,
	"entity_id" varchar NOT NULL,
	"action" varchar NOT NULL,
	"actor_id" varchar NOT NULL,
	"changes" jsonb,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_succession_candidates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"plan_id" varchar NOT NULL,
	"person_id" varchar NOT NULL,
	"readiness" varchar DEFAULT 'READY_NOW',
	"ranking" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_succession_plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"target_job_id" varchar,
	"target_position_id" varchar,
	"incumbent_person_id" varchar,
	"name" varchar NOT NULL,
	"status" varchar DEFAULT 'DRAFT',
	"review_date" date,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_talent_pools" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"owner_id" varchar,
	"status" varchar DEFAULT 'ACTIVE',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_hdl_imports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"file_name" varchar NOT NULL,
	"business_object" varchar NOT NULL,
	"status" varchar DEFAULT 'PENDING',
	"total_lines" text,
	"success_lines" text DEFAULT '0',
	"failed_lines" text DEFAULT '0',
	"error_report" jsonb,
	"uploaded_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "hr_aor" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"person_id" varchar NOT NULL,
	"scope_type" varchar NOT NULL,
	"scope_value_id" varchar NOT NULL,
	"responsibility_type" varchar,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_delegations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"manager_id" varchar NOT NULL,
	"proxy_id" varchar NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"is_active" boolean DEFAULT true,
	"can_approve_transitions" boolean DEFAULT true,
	"can_view_team_analytics" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_compliance_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"rule_id" varchar,
	"entity_type" varchar NOT NULL,
	"entity_id" varchar NOT NULL,
	"evaluation_result" varchar NOT NULL,
	"metadata" jsonb,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_compliance_frameworks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"code" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"jurisdiction" varchar,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_compliance_rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"framework_id" varchar,
	"code" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"severity" varchar NOT NULL,
	"category" varchar DEFAULT 'REGULATORY' NOT NULL,
	"legislation_code" varchar DEFAULT 'GLOBAL' NOT NULL,
	"automation_level" varchar NOT NULL,
	"rule_logic" jsonb,
	"effective_date" timestamp NOT NULL,
	"end_date" timestamp,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "hr_compliance_violations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"event_id" varchar,
	"rule_id" varchar,
	"status" varchar DEFAULT 'open',
	"severity" varchar NOT NULL,
	"description" text,
	"remediation_actions" jsonb,
	"assigned_to" varchar,
	"resolved_at" timestamp,
	"resolution_notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hr_risk_configurations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"factor_key" varchar NOT NULL,
	"weight" integer DEFAULT 10 NOT NULL,
	"threshold" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "deal_registrations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" varchar NOT NULL,
	"deal_name" varchar NOT NULL,
	"customer_name" varchar NOT NULL,
	"amount" varchar,
	"stage" varchar DEFAULT 'Prospecting',
	"status" varchar DEFAULT 'Pending',
	"expected_close_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "sla_event_types" (
	"id" varchar PRIMARY KEY NOT NULL,
	"event_class_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"accounting_flag" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "sla_journal_line_types" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar NOT NULL,
	"event_class_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"balance_type" varchar DEFAULT 'Actual',
	"side" varchar NOT NULL,
	"accounting_class" varchar NOT NULL,
	"account_rule_id" varchar,
	"switch_side_flag" boolean DEFAULT false,
	"merge_flag" boolean DEFAULT true,
	"condition" text,
	"amount_source" varchar DEFAULT 'amount',
	"description_rule" text,
	"priority" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "sla_period_statuses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" varchar NOT NULL,
	"ledger_id" varchar NOT NULL,
	"period_name" varchar NOT NULL,
	"status" varchar(20) DEFAULT 'Open',
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "sla_period_statuses_unq" UNIQUE("ledger_id","period_name","application_id")
);
--> statement-breakpoint
CREATE TABLE "ic_netting_batches" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_number" serial NOT NULL,
	"agreement_id" varchar,
	"org_id_1" varchar NOT NULL,
	"org_id_2" varchar NOT NULL,
	"settlement_date" timestamp DEFAULT now(),
	"status" varchar DEFAULT 'Draft',
	"currency_code" varchar NOT NULL,
	"total_payables" numeric(18, 2) DEFAULT '0',
	"total_receivables" numeric(18, 2) DEFAULT '0',
	"net_amount" numeric(18, 2) DEFAULT '0',
	"settlement_journal_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"created_by" varchar
);
--> statement-breakpoint
CREATE TABLE "gl_revenue_rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"type" text,
	"duration" text,
	"recognition_start" text,
	"enabled" text,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cst_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"transaction_type" text NOT NULL,
	"item_id" text NOT NULL,
	"quantity" numeric(16, 4) NOT NULL,
	"unit_cost" numeric(16, 4) DEFAULT '0',
	"total_cost" numeric(16, 2) DEFAULT '0',
	"source_type" text,
	"source_id" text,
	"source_line_id" text,
	"org_id" text NOT NULL,
	"transaction_date" timestamp DEFAULT now(),
	"gl_status" text DEFAULT 'PENDING'
);
--> statement-breakpoint
CREATE TABLE "corporate_card_transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"card_id" varchar NOT NULL,
	"employee_id" varchar NOT NULL,
	"transaction_date" timestamp NOT NULL,
	"merchant" varchar NOT NULL,
	"amount" numeric(20, 2) NOT NULL,
	"currency" varchar DEFAULT 'USD' NOT NULL,
	"status" varchar DEFAULT 'UNRECONCILED' NOT NULL,
	"expense_line_id" varchar,
	"external_reference" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expense_lines" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"report_id" varchar NOT NULL,
	"expense_date" timestamp NOT NULL,
	"category" varchar NOT NULL,
	"merchant" varchar,
	"amount" numeric(20, 2) NOT NULL,
	"tax_amount" numeric(20, 2) DEFAULT '0',
	"currency" varchar DEFAULT 'USD' NOT NULL,
	"description" text,
	"receipt_url" text,
	"status" varchar DEFAULT 'PENDING' NOT NULL,
	"justification" text,
	"gl_code_combination_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expense_per_diems" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"location_code" varchar NOT NULL,
	"rate" numeric(20, 2) NOT NULL,
	"currency" varchar DEFAULT 'USD' NOT NULL,
	"effective_start_date" timestamp NOT NULL,
	"effective_end_date" timestamp,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expense_policies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"category" varchar,
	"limit_amount" numeric(20, 2),
	"currency" varchar DEFAULT 'USD',
	"requires_receipt_above" numeric(20, 2) DEFAULT '0',
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expense_reports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"report_number" varchar NOT NULL,
	"employee_id" varchar NOT NULL,
	"purpose" text,
	"status" varchar DEFAULT 'DRAFT' NOT NULL,
	"total_amount" numeric(20, 2) DEFAULT '0' NOT NULL,
	"currency" varchar DEFAULT 'USD' NOT NULL,
	"submitted_at" timestamp,
	"approved_at" timestamp,
	"approved_by" varchar,
	"payment_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "expense_reports_report_number_unique" UNIQUE("report_number")
);
--> statement-breakpoint
CREATE TABLE "lease_amendments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lease_id" varchar NOT NULL,
	"amendment_date" timestamp DEFAULT now(),
	"effective_date" timestamp NOT NULL,
	"modification_type" varchar NOT NULL,
	"change_reason" varchar,
	"previous_terms" jsonb,
	"new_terms" jsonb,
	"modified_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ic_allocation_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rule_id" uuid NOT NULL,
	"target_org_id" text NOT NULL,
	"percentage" numeric(5, 2),
	"fixed_amount" numeric(20, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ic_allocation_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"source_org_id" text NOT NULL,
	"allocation_method" text DEFAULT 'PERCENTAGE',
	"status" text DEFAULT 'ACTIVE',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ic_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_number" serial NOT NULL,
	"description" text,
	"initiator_org_id" text,
	"status" text NOT NULL,
	"gl_date" date NOT NULL,
	"currency_code" text NOT NULL,
	"total_amount" numeric(20, 2),
	"total_transactions" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"created_by" text
);
--> statement-breakpoint
CREATE TABLE "ic_data_access_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"ic_org_id" text NOT NULL,
	"access_level" text DEFAULT 'FULL',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ic_headers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_id" uuid,
	"transaction_type_id" text,
	"provider_org_id" text,
	"receiver_org_id" text,
	"amount" numeric(20, 2) NOT NULL,
	"currency_code" text NOT NULL,
	"conversion_rate" numeric(20, 10) DEFAULT '1',
	"markup_rate" numeric(5, 2) DEFAULT '0',
	"status" text NOT NULL,
	"rejection_reason" text,
	"gl_status" text DEFAULT 'Pending',
	"invoice_status" text DEFAULT 'Not Required',
	"settlement_status" text DEFAULT 'Unsettled',
	"settlement_batch_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ic_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"header_id" uuid,
	"line_number" integer NOT NULL,
	"side" text NOT NULL,
	"code_combination_id" text NOT NULL,
	"entered_dr" numeric(20, 2),
	"entered_cr" numeric(20, 2),
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ic_orgs" (
	"id" text PRIMARY KEY NOT NULL,
	"org_name" text NOT NULL,
	"legal_entity_id" text NOT NULL,
	"ledger_id" text NOT NULL,
	"company_segment" text NOT NULL,
	"receivables_account_id" text,
	"payables_account_id" text,
	"enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ic_transaction_types" (
	"id" text PRIMARY KEY NOT NULL,
	"type_name" text NOT NULL,
	"description" text,
	"requires_approval" boolean DEFAULT true,
	"requires_invoicing" boolean DEFAULT false,
	"manual_approve_allowed" boolean DEFAULT false,
	"default_markup" numeric(5, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ic_transfer_pricing_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_org_id" text NOT NULL,
	"receiver_org_id" text NOT NULL,
	"transaction_type_id" text,
	"markup_type" text DEFAULT 'PERCENTAGE' NOT NULL,
	"markup_value" numeric(10, 4) NOT NULL,
	"active_from" date DEFAULT now() NOT NULL,
	"active_to" date,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_competencies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"behavioral_indicators" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_job_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"job_id" varchar NOT NULL,
	"profile_summary" text,
	"responsibilities" text,
	"qualifications" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_person_skills" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"person_id" varchar NOT NULL,
	"competency_id" varchar,
	"skill_name" varchar,
	"proficiency" varchar,
	"verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_skills" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"category" varchar,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "hrm_skills_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "hrm_rec_applications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"candidate_id" varchar NOT NULL,
	"requisition_id" varchar NOT NULL,
	"status" varchar DEFAULT 'APPLIED',
	"stage" varchar DEFAULT 'NEW',
	"score" integer,
	"notes" text,
	"applied_date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_rec_candidates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar,
	"linked_person_id" varchar,
	"resume_url" varchar,
	"linkedin_url" varchar,
	"portfolio_url" varchar,
	"skills" jsonb,
	"experience_years" integer,
	"source" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_rec_email_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"subject" varchar NOT NULL,
	"body" text NOT NULL,
	"type" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_rec_interviews" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"application_id" varchar NOT NULL,
	"interviewer_id" varchar NOT NULL,
	"scheduled_time" timestamp NOT NULL,
	"duration_minutes" integer DEFAULT 60,
	"location" varchar,
	"status" varchar DEFAULT 'SCHEDULED',
	"feedback" text,
	"rating" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_rec_offers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"application_id" varchar NOT NULL,
	"status" varchar DEFAULT 'DRAFT',
	"base_salary" integer NOT NULL,
	"currency" varchar DEFAULT 'USD',
	"stock_options" integer,
	"bonus_percentage" integer,
	"start_date" date,
	"expiration_date" date,
	"offer_letter_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_rec_onboarding_tasks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"application_id" varchar NOT NULL,
	"task_name" varchar NOT NULL,
	"category" varchar NOT NULL,
	"status" varchar DEFAULT 'PENDING',
	"assigned_to" varchar,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_rec_pipeline_stages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"template_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"order" integer NOT NULL,
	"type" varchar DEFAULT 'CUSTOM',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_rec_pipeline_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"is_default" boolean DEFAULT false,
	"department_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_rec_requisitions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"requisition_number" varchar NOT NULL,
	"title" varchar NOT NULL,
	"department_id" varchar,
	"job_id" varchar,
	"location_id" varchar,
	"hiring_manager_id" varchar,
	"recruiter_id" varchar,
	"status" varchar DEFAULT 'DRAFT',
	"open_date" date,
	"close_date" date,
	"headcount" integer DEFAULT 1,
	"description" text,
	"requirements" text,
	"pay_range_min" integer,
	"pay_range_max" integer,
	"currency" varchar DEFAULT 'USD',
	"custom_fields" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" varchar,
	CONSTRAINT "hrm_rec_requisitions_requisition_number_unique" UNIQUE("requisition_number")
);
--> statement-breakpoint
CREATE TABLE "hrm_perf_documents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"person_id" varchar NOT NULL,
	"manager_id" varchar,
	"template_type" varchar DEFAULT 'ANNUAL',
	"period_name" varchar,
	"status" varchar DEFAULT 'DRAFT',
	"overall_rating" integer,
	"overall_comments" text,
	"employee_submitted_date" timestamp,
	"manager_submitted_date" timestamp,
	"completed_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_perf_feedback" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"target_person_id" varchar NOT NULL,
	"author_person_id" varchar,
	"feedback_type" varchar DEFAULT 'GENERAL',
	"message" text NOT NULL,
	"is_visible_to_employee" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_perf_goals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"person_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"category" varchar,
	"status" varchar DEFAULT 'NOT_STARTED',
	"weight" integer DEFAULT 0,
	"start_date" date,
	"target_date" date,
	"completion_date" date,
	"progress" integer DEFAULT 0,
	"is_private" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_perf_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"sections" jsonb,
	"rating_scale" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_learning_assessment_attempts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"enrollment_id" varchar NOT NULL,
	"assessment_id" varchar NOT NULL,
	"score" integer,
	"passed" boolean,
	"answers" jsonb,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "hrm_learning_assessment_questions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"assessment_id" varchar NOT NULL,
	"text" text NOT NULL,
	"type" varchar DEFAULT 'MULTIPLE_CHOICE',
	"options" jsonb,
	"correct_answer" varchar,
	"points" integer DEFAULT 10,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_learning_assessments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"passing_score" integer DEFAULT 80,
	"max_attempts" integer DEFAULT 3,
	"time_limit_minutes" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_learning_audit_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"entity_type" varchar NOT NULL,
	"entity_id" varchar NOT NULL,
	"action" varchar NOT NULL,
	"previous_value" text,
	"new_value" text,
	"actor_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_learning_certifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"validity_period_days" integer,
	"renewal_window_days" integer,
	"owner_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_learning_communities" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"parent_id" varchar,
	"path" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_learning_content_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"type" varchar NOT NULL,
	"url" text,
	"launch_data" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_learning_courses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"category" varchar,
	"provider" varchar,
	"community_id" varchar,
	"duration_minutes" integer,
	"validity_months" integer,
	"renewal_rule" varchar,
	"status" varchar DEFAULT 'ACTIVE',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_learning_curricula" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"provider" varchar DEFAULT 'Internal',
	"category" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_learning_curriculum_members" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"curriculum_id" varchar NOT NULL,
	"course_id" varchar NOT NULL,
	"sequence_order" integer DEFAULT 0,
	"is_required" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_learning_enrollments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"offering_id" varchar NOT NULL,
	"person_id" varchar NOT NULL,
	"status" varchar DEFAULT 'ENROLLED',
	"progress_percent" integer DEFAULT 0,
	"score" integer,
	"completion_date" date,
	"certificate_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_learning_offerings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"course_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"type" varchar DEFAULT 'SELF_PACED',
	"start_date" date,
	"end_date" date,
	"instructor_id" varchar,
	"location" varchar,
	"capacity" integer,
	"enrolled_count" integer DEFAULT 0,
	"price" numeric DEFAULT '0',
	"currency" varchar DEFAULT 'USD',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_compensation_plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"plan_type" varchar DEFAULT 'BONUS',
	"frequency" varchar DEFAULT 'ANNUAL',
	"target_percentage" numeric(5, 2),
	"status" varchar DEFAULT 'ACTIVE',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_salary_bases" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"code" varchar NOT NULL,
	"frequency" varchar DEFAULT 'ANNUALLY',
	"annualization_factor" numeric(10, 4) DEFAULT '1.0',
	"currency" varchar DEFAULT 'USD',
	"status" varchar DEFAULT 'ACTIVE',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "hrm_salary_bases_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "hrm_worker_salaries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"assignment_id" varchar NOT NULL,
	"salary_basis_id" varchar NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"annual_amount" numeric(15, 2),
	"currency" varchar NOT NULL,
	"date_from" date NOT NULL,
	"date_to" date,
	"change_reason" varchar,
	"next_review_date" date,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_pay_elements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"classification" varchar NOT NULL,
	"input_type" varchar DEFAULT 'CALCULATED',
	"recurring" boolean DEFAULT true,
	"taxable" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_pay_groups" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"frequency" varchar NOT NULL,
	"legislative_data_group_id" varchar,
	"status" varchar DEFAULT 'ACTIVE',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_payroll_run_results" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"payroll_run_id" varchar NOT NULL,
	"assignment_id" varchar NOT NULL,
	"element_id" varchar NOT NULL,
	"element_name" varchar,
	"amount" numeric(15, 2) NOT NULL,
	"ytd_amount" numeric(15, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_payroll_runs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"pay_group_id" varchar NOT NULL,
	"period_name" varchar NOT NULL,
	"period_start_date" date NOT NULL,
	"period_end_date" date NOT NULL,
	"payment_date" date NOT NULL,
	"status" varchar DEFAULT 'OPEN',
	"total_gross" numeric,
	"total_net" numeric,
	"run_date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_voluntary_deductions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"assignment_id" varchar NOT NULL,
	"element_id" varchar NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"frequency" varchar DEFAULT 'RECURRING',
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"status" varchar DEFAULT 'ACTIVE',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_accrual_policies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"leave_type" varchar NOT NULL,
	"accrual_rate" numeric(6, 2) NOT NULL,
	"frequency" varchar DEFAULT 'MONTHLY',
	"vesting_months" integer DEFAULT 0,
	"max_cap" numeric(6, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_labor_policies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"ot_multiplier" varchar DEFAULT '1.5',
	"grace_period_minutes" integer DEFAULT 15,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_leave_balances" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"person_id" varchar NOT NULL,
	"leave_type" varchar NOT NULL,
	"balance_hours" numeric(6, 2) DEFAULT '0.0',
	"last_accrual_date" date,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_payroll_batches" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"period_id" varchar NOT NULL,
	"run_date" timestamp DEFAULT now(),
	"run_by" varchar,
	"total_records" integer DEFAULT 0,
	"status" varchar DEFAULT 'COMPLETED',
	"payload" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_payslip_entries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"payslip_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"sub_type" varchar,
	"description" varchar,
	"amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"rate" numeric(10, 2),
	"units" numeric(10, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_payslips" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"batch_id" varchar,
	"person_id" varchar NOT NULL,
	"period_start_date" date NOT NULL,
	"period_end_date" date NOT NULL,
	"gross_pay" numeric(10, 2) DEFAULT '0.00',
	"net_pay" numeric(10, 2) DEFAULT '0.00',
	"total_deductions" numeric(10, 2) DEFAULT '0.00',
	"status" varchar DEFAULT 'DRAFT',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_public_holidays" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"date" date NOT NULL,
	"name" varchar NOT NULL,
	"country_code" varchar DEFAULT 'US' NOT NULL,
	"is_mandatory" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_regional_policies" (
	"country_code" varchar PRIMARY KEY NOT NULL,
	"tenant_id" varchar NOT NULL,
	"standard_weekly_hours" numeric(4, 2) DEFAULT '40.00' NOT NULL,
	"standard_daily_hours" numeric(4, 2) DEFAULT '8.00',
	"overtime_multiplier" numeric(3, 2) DEFAULT '1.50',
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_salaries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"person_id" varchar NOT NULL,
	"amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"frequency" varchar DEFAULT 'HOURLY',
	"currency" varchar DEFAULT 'USD',
	"effective_date" date DEFAULT CURRENT_DATE,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_shift_assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"person_id" varchar NOT NULL,
	"shift_id" varchar NOT NULL,
	"date" date NOT NULL,
	"is_published" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_shifts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"code" varchar NOT NULL,
	"name" varchar NOT NULL,
	"start_time" varchar NOT NULL,
	"end_time" varchar NOT NULL,
	"color" varchar DEFAULT '#3b82f6',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_time_entries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"timesheet_id" varchar NOT NULL,
	"date" date NOT NULL,
	"start_time" timestamp,
	"end_time" timestamp,
	"duration_minutes" integer NOT NULL,
	"time_type" varchar DEFAULT 'REGULAR',
	"project_id" varchar,
	"task_id" varchar,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_time_periods" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" varchar DEFAULT 'OPEN',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_time_sheets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"person_id" varchar NOT NULL,
	"period_id" varchar NOT NULL,
	"status" varchar DEFAULT 'DRAFT',
	"total_hours" numeric(5, 2) DEFAULT '0.0',
	"total_overtime" numeric(5, 2) DEFAULT '0.0',
	"approver_id" varchar,
	"approved_at" timestamp,
	"submission_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_time_violations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"entry_id" varchar,
	"type" varchar NOT NULL,
	"severity" varchar DEFAULT 'Medium',
	"message" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_ai_anomalies" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"person_id" text NOT NULL,
	"type" text NOT NULL,
	"risk_score" integer DEFAULT 0,
	"risk_reason" text,
	"status" text DEFAULT 'OPEN',
	"detected_at" timestamp DEFAULT now(),
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "hrm_ai_forecasts" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"department_id" text NOT NULL,
	"forecast_date" date NOT NULL,
	"projected_hours" numeric NOT NULL,
	"confidence_score" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_ben_enrollments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"person_id" varchar NOT NULL,
	"plan_option_id" varchar NOT NULL,
	"coverage_start_date" date NOT NULL,
	"coverage_end_date" date,
	"status" varchar DEFAULT 'ACTIVE',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_ben_options" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_ben_plan_options" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"plan_id" varchar NOT NULL,
	"option_id" varchar NOT NULL,
	"employee_cost" numeric(10, 2) DEFAULT '0.00',
	"employer_cost" numeric(10, 2) DEFAULT '0.00',
	"currency" varchar DEFAULT 'USD',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_ben_plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"program_id" varchar,
	"name" varchar NOT NULL,
	"plan_type" varchar NOT NULL,
	"provider" varchar,
	"deduction_element_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_ben_programs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar,
	"status" varchar DEFAULT 'ACTIVE',
	"legislation_code" varchar DEFAULT 'US',
	"open_enrollment_start" date,
	"open_enrollment_end" date,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_accrual_policy_rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"leave_type" varchar NOT NULL,
	"min_tenure_months" integer DEFAULT 0,
	"accrual_rate_per_year" integer NOT NULL,
	"max_cap_days" integer DEFAULT 20,
	"status" varchar DEFAULT 'ACTIVE',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hrm_time_rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"code" varchar NOT NULL,
	"rule_type" varchar NOT NULL,
	"start_time" varchar,
	"end_time" varchar,
	"days_of_week" varchar,
	"multiplier" numeric(4, 2),
	"flat_rate_add" numeric(10, 2),
	"status" varchar DEFAULT 'ACTIVE',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "hrm_time_rules_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "maint_meter_readings" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "maint_meters" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "maint_meter_readings" CASCADE;--> statement-breakpoint
DROP TABLE "maint_meters" CASCADE;--> statement-breakpoint
ALTER TABLE "gl_audit_logs" ALTER COLUMN "timestamp" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "gl_recurring_journals" ALTER COLUMN "next_run_date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "netting_agreements" ALTER COLUMN "customer_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "netting_agreements" ALTER COLUMN "supplier_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "tenant_id" varchar;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "territory_id" varchar;--> statement-breakpoint
ALTER TABLE "gl_auto_post_rules" ADD COLUMN "priority" integer DEFAULT 10;--> statement-breakpoint
ALTER TABLE "gl_budget_control_rules" ADD COLUMN "name" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "gl_close_tasks" ADD COLUMN "due_date" timestamp;--> statement-breakpoint
ALTER TABLE "gl_cross_validation_rules_v2" ADD COLUMN "name" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "gl_period_close_checklist_templates" ADD COLUMN "day_offset" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "gl_recurring_journals" ADD COLUMN "recurring_batch_name" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "gl_recurring_journals" ADD COLUMN "frequency" varchar DEFAULT 'Monthly';--> statement-breakpoint
ALTER TABLE "gl_recurring_journals" ADD COLUMN "template_journal_id" varchar;--> statement-breakpoint
ALTER TABLE "sla_journal_headers" ADD COLUMN "transaction_source" varchar;--> statement-breakpoint
ALTER TABLE "sla_journal_headers" ADD COLUMN "event_type_id" varchar;--> statement-breakpoint
ALTER TABLE "netting_agreements" ADD COLUMN "intercompany_org_id" varchar;--> statement-breakpoint
ALTER TABLE "maint_assets_extension" ADD COLUMN "account_id" varchar;--> statement-breakpoint
ALTER TABLE "crm_campaign_members" ADD CONSTRAINT "crm_campaign_members_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_campaign_members" ADD CONSTRAINT "crm_campaign_members_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_campaign_members" ADD CONSTRAINT "crm_campaign_members_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_commission_assignments" ADD CONSTRAINT "crm_commission_assignments_plan_id_crm_commission_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."crm_commission_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_commissions" ADD CONSTRAINT "crm_commissions_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_commissions" ADD CONSTRAINT "crm_commissions_plan_id_crm_commission_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."crm_commission_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_opportunity_competitors" ADD CONSTRAINT "crm_opportunity_competitors_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_opportunity_competitors" ADD CONSTRAINT "crm_opportunity_competitors_competitor_id_crm_competitors_id_fk" FOREIGN KEY ("competitor_id") REFERENCES "public"."crm_competitors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_service_appointments" ADD CONSTRAINT "crm_service_appointments_work_order_id_crm_service_work_orders_id_fk" FOREIGN KEY ("work_order_id") REFERENCES "public"."crm_service_work_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_service_work_orders" ADD CONSTRAINT "crm_service_work_orders_case_id_crm_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."crm_cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_service_work_orders" ADD CONSTRAINT "crm_service_work_orders_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_service_work_orders" ADD CONSTRAINT "crm_service_work_orders_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_territory_rules" ADD CONSTRAINT "crm_territory_rules_territory_id_crm_territories_id_fk" FOREIGN KEY ("territory_id") REFERENCES "public"."crm_territories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_organizations" ADD CONSTRAINT "hr_organizations_location_id_hr_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."hr_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_positions" ADD CONSTRAINT "hr_positions_job_id_hr_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."hr_jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_positions" ADD CONSTRAINT "hr_positions_department_id_hr_organizations_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hr_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_positions" ADD CONSTRAINT "hr_positions_location_id_hr_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."hr_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_assignments" ADD CONSTRAINT "hr_assignments_work_relationship_id_hr_work_relationships_id_fk" FOREIGN KEY ("work_relationship_id") REFERENCES "public"."hr_work_relationships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_assignments" ADD CONSTRAINT "hr_assignments_person_id_hr_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."hr_persons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_assignments" ADD CONSTRAINT "hr_assignments_job_id_hr_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."hr_jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_assignments" ADD CONSTRAINT "hr_assignments_position_id_hr_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."hr_positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_assignments" ADD CONSTRAINT "hr_assignments_grade_id_hr_grades_id_fk" FOREIGN KEY ("grade_id") REFERENCES "public"."hr_grades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_assignments" ADD CONSTRAINT "hr_assignments_department_id_hr_organizations_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hr_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_assignments" ADD CONSTRAINT "hr_assignments_location_id_hr_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."hr_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_assignments" ADD CONSTRAINT "hr_assignments_manager_id_hr_persons_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."hr_persons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_work_relationships" ADD CONSTRAINT "hr_work_relationships_person_id_hr_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."hr_persons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_work_relationships" ADD CONSTRAINT "hr_work_relationships_legal_employer_id_hr_organizations_id_fk" FOREIGN KEY ("legal_employer_id") REFERENCES "public"."hr_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_documents" ADD CONSTRAINT "hr_documents_person_id_hr_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."hr_persons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_allocated_checklists" ADD CONSTRAINT "hr_allocated_checklists_person_id_hr_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."hr_persons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_allocated_checklists" ADD CONSTRAINT "hr_allocated_checklists_checklist_id_hr_checklists_id_fk" FOREIGN KEY ("checklist_id") REFERENCES "public"."hr_checklists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_allocated_tasks" ADD CONSTRAINT "hr_allocated_tasks_allocated_checklist_id_hr_allocated_checklists_id_fk" FOREIGN KEY ("allocated_checklist_id") REFERENCES "public"."hr_allocated_checklists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_allocated_tasks" ADD CONSTRAINT "hr_allocated_tasks_checklist_item_id_hr_checklist_items_id_fk" FOREIGN KEY ("checklist_item_id") REFERENCES "public"."hr_checklist_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_checklist_items" ADD CONSTRAINT "hr_checklist_items_checklist_id_hr_checklists_id_fk" FOREIGN KEY ("checklist_id") REFERENCES "public"."hr_checklists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_succession_candidates" ADD CONSTRAINT "hrm_succession_candidates_plan_id_hrm_succession_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."hrm_succession_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_succession_candidates" ADD CONSTRAINT "hrm_succession_candidates_person_id_hr_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."hr_persons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_succession_plans" ADD CONSTRAINT "hrm_succession_plans_target_job_id_hr_jobs_id_fk" FOREIGN KEY ("target_job_id") REFERENCES "public"."hr_jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_succession_plans" ADD CONSTRAINT "hrm_succession_plans_target_position_id_hr_positions_id_fk" FOREIGN KEY ("target_position_id") REFERENCES "public"."hr_positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_succession_plans" ADD CONSTRAINT "hrm_succession_plans_incumbent_person_id_hr_persons_id_fk" FOREIGN KEY ("incumbent_person_id") REFERENCES "public"."hr_persons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_talent_pools" ADD CONSTRAINT "hrm_talent_pools_owner_id_hr_persons_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."hr_persons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compliance_events" ADD CONSTRAINT "hr_compliance_events_rule_id_hr_compliance_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."hr_compliance_rules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compliance_rules" ADD CONSTRAINT "hr_compliance_rules_framework_id_hr_compliance_frameworks_id_fk" FOREIGN KEY ("framework_id") REFERENCES "public"."hr_compliance_frameworks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compliance_violations" ADD CONSTRAINT "hr_compliance_violations_event_id_hr_compliance_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."hr_compliance_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_compliance_violations" ADD CONSTRAINT "hr_compliance_violations_rule_id_hr_compliance_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."hr_compliance_rules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal_registrations" ADD CONSTRAINT "deal_registrations_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sla_event_types" ADD CONSTRAINT "sla_event_types_event_class_id_sla_event_classes_id_fk" FOREIGN KEY ("event_class_id") REFERENCES "public"."sla_event_classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sla_journal_line_types" ADD CONSTRAINT "sla_journal_line_types_event_class_id_sla_event_classes_id_fk" FOREIGN KEY ("event_class_id") REFERENCES "public"."sla_event_classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sla_journal_line_types" ADD CONSTRAINT "sla_journal_line_types_account_rule_id_sla_accounting_rules_id_fk" FOREIGN KEY ("account_rule_id") REFERENCES "public"."sla_accounting_rules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ic_netting_batches" ADD CONSTRAINT "ic_netting_batches_agreement_id_netting_agreements_id_fk" FOREIGN KEY ("agreement_id") REFERENCES "public"."netting_agreements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_lines" ADD CONSTRAINT "expense_lines_report_id_expense_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."expense_reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ic_allocation_lines" ADD CONSTRAINT "ic_allocation_lines_rule_id_ic_allocation_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."ic_allocation_rules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ic_allocation_lines" ADD CONSTRAINT "ic_allocation_lines_target_org_id_ic_orgs_id_fk" FOREIGN KEY ("target_org_id") REFERENCES "public"."ic_orgs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ic_allocation_rules" ADD CONSTRAINT "ic_allocation_rules_source_org_id_ic_orgs_id_fk" FOREIGN KEY ("source_org_id") REFERENCES "public"."ic_orgs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ic_batches" ADD CONSTRAINT "ic_batches_initiator_org_id_ic_orgs_id_fk" FOREIGN KEY ("initiator_org_id") REFERENCES "public"."ic_orgs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ic_data_access_sets" ADD CONSTRAINT "ic_data_access_sets_ic_org_id_ic_orgs_id_fk" FOREIGN KEY ("ic_org_id") REFERENCES "public"."ic_orgs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ic_headers" ADD CONSTRAINT "ic_headers_batch_id_ic_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."ic_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ic_headers" ADD CONSTRAINT "ic_headers_transaction_type_id_ic_transaction_types_id_fk" FOREIGN KEY ("transaction_type_id") REFERENCES "public"."ic_transaction_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ic_headers" ADD CONSTRAINT "ic_headers_provider_org_id_ic_orgs_id_fk" FOREIGN KEY ("provider_org_id") REFERENCES "public"."ic_orgs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ic_headers" ADD CONSTRAINT "ic_headers_receiver_org_id_ic_orgs_id_fk" FOREIGN KEY ("receiver_org_id") REFERENCES "public"."ic_orgs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ic_lines" ADD CONSTRAINT "ic_lines_header_id_ic_headers_id_fk" FOREIGN KEY ("header_id") REFERENCES "public"."ic_headers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ic_transfer_pricing_rules" ADD CONSTRAINT "ic_transfer_pricing_rules_provider_org_id_ic_orgs_id_fk" FOREIGN KEY ("provider_org_id") REFERENCES "public"."ic_orgs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ic_transfer_pricing_rules" ADD CONSTRAINT "ic_transfer_pricing_rules_receiver_org_id_ic_orgs_id_fk" FOREIGN KEY ("receiver_org_id") REFERENCES "public"."ic_orgs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ic_transfer_pricing_rules" ADD CONSTRAINT "ic_transfer_pricing_rules_transaction_type_id_ic_transaction_types_id_fk" FOREIGN KEY ("transaction_type_id") REFERENCES "public"."ic_transaction_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_job_profiles" ADD CONSTRAINT "hrm_job_profiles_job_id_hr_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."hr_jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_person_skills" ADD CONSTRAINT "hrm_person_skills_competency_id_hrm_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."hrm_competencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_rec_applications" ADD CONSTRAINT "hrm_rec_applications_candidate_id_hrm_rec_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."hrm_rec_candidates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_rec_applications" ADD CONSTRAINT "hrm_rec_applications_requisition_id_hrm_rec_requisitions_id_fk" FOREIGN KEY ("requisition_id") REFERENCES "public"."hrm_rec_requisitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_rec_candidates" ADD CONSTRAINT "hrm_rec_candidates_linked_person_id_hr_persons_id_fk" FOREIGN KEY ("linked_person_id") REFERENCES "public"."hr_persons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_rec_interviews" ADD CONSTRAINT "hrm_rec_interviews_application_id_hrm_rec_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."hrm_rec_applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_rec_interviews" ADD CONSTRAINT "hrm_rec_interviews_interviewer_id_hr_persons_id_fk" FOREIGN KEY ("interviewer_id") REFERENCES "public"."hr_persons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_rec_offers" ADD CONSTRAINT "hrm_rec_offers_application_id_hrm_rec_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."hrm_rec_applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_rec_onboarding_tasks" ADD CONSTRAINT "hrm_rec_onboarding_tasks_application_id_hrm_rec_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."hrm_rec_applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_rec_pipeline_stages" ADD CONSTRAINT "hrm_rec_pipeline_stages_template_id_hrm_rec_pipeline_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."hrm_rec_pipeline_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_rec_requisitions" ADD CONSTRAINT "hrm_rec_requisitions_department_id_hr_organizations_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."hr_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_rec_requisitions" ADD CONSTRAINT "hrm_rec_requisitions_job_id_hr_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."hr_jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_rec_requisitions" ADD CONSTRAINT "hrm_rec_requisitions_location_id_hr_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."hr_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_rec_requisitions" ADD CONSTRAINT "hrm_rec_requisitions_hiring_manager_id_hr_persons_id_fk" FOREIGN KEY ("hiring_manager_id") REFERENCES "public"."hr_persons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_rec_requisitions" ADD CONSTRAINT "hrm_rec_requisitions_recruiter_id_hr_persons_id_fk" FOREIGN KEY ("recruiter_id") REFERENCES "public"."hr_persons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_perf_documents" ADD CONSTRAINT "hrm_perf_documents_person_id_hr_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."hr_persons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_perf_documents" ADD CONSTRAINT "hrm_perf_documents_manager_id_hr_persons_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."hr_persons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_perf_feedback" ADD CONSTRAINT "hrm_perf_feedback_target_person_id_hr_persons_id_fk" FOREIGN KEY ("target_person_id") REFERENCES "public"."hr_persons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_perf_feedback" ADD CONSTRAINT "hrm_perf_feedback_author_person_id_hr_persons_id_fk" FOREIGN KEY ("author_person_id") REFERENCES "public"."hr_persons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_perf_goals" ADD CONSTRAINT "hrm_perf_goals_person_id_hr_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."hr_persons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_learning_assessment_attempts" ADD CONSTRAINT "hrm_learning_assessment_attempts_enrollment_id_hrm_learning_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."hrm_learning_enrollments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_learning_assessment_attempts" ADD CONSTRAINT "hrm_learning_assessment_attempts_assessment_id_hrm_learning_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."hrm_learning_assessments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_learning_assessment_questions" ADD CONSTRAINT "hrm_learning_assessment_questions_assessment_id_hrm_learning_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."hrm_learning_assessments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_learning_certifications" ADD CONSTRAINT "hrm_learning_certifications_owner_id_hr_persons_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."hr_persons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_learning_communities" ADD CONSTRAINT "hrm_learning_communities_parent_id_hrm_learning_communities_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."hrm_learning_communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_learning_courses" ADD CONSTRAINT "hrm_learning_courses_community_id_hrm_learning_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."hrm_learning_communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_learning_curriculum_members" ADD CONSTRAINT "hrm_learning_curriculum_members_curriculum_id_hrm_learning_curricula_id_fk" FOREIGN KEY ("curriculum_id") REFERENCES "public"."hrm_learning_curricula"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_learning_curriculum_members" ADD CONSTRAINT "hrm_learning_curriculum_members_course_id_hrm_learning_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."hrm_learning_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_learning_enrollments" ADD CONSTRAINT "hrm_learning_enrollments_offering_id_hrm_learning_offerings_id_fk" FOREIGN KEY ("offering_id") REFERENCES "public"."hrm_learning_offerings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_learning_enrollments" ADD CONSTRAINT "hrm_learning_enrollments_person_id_hr_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."hr_persons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_learning_offerings" ADD CONSTRAINT "hrm_learning_offerings_course_id_hrm_learning_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."hrm_learning_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_learning_offerings" ADD CONSTRAINT "hrm_learning_offerings_instructor_id_hr_persons_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."hr_persons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_worker_salaries" ADD CONSTRAINT "hrm_worker_salaries_assignment_id_hr_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."hr_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_worker_salaries" ADD CONSTRAINT "hrm_worker_salaries_salary_basis_id_hrm_salary_bases_id_fk" FOREIGN KEY ("salary_basis_id") REFERENCES "public"."hrm_salary_bases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_payroll_run_results" ADD CONSTRAINT "hrm_payroll_run_results_payroll_run_id_hrm_payroll_runs_id_fk" FOREIGN KEY ("payroll_run_id") REFERENCES "public"."hrm_payroll_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_payroll_run_results" ADD CONSTRAINT "hrm_payroll_run_results_assignment_id_hr_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."hr_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_payroll_run_results" ADD CONSTRAINT "hrm_payroll_run_results_element_id_hrm_pay_elements_id_fk" FOREIGN KEY ("element_id") REFERENCES "public"."hrm_pay_elements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_payroll_runs" ADD CONSTRAINT "hrm_payroll_runs_pay_group_id_hrm_pay_groups_id_fk" FOREIGN KEY ("pay_group_id") REFERENCES "public"."hrm_pay_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_voluntary_deductions" ADD CONSTRAINT "hrm_voluntary_deductions_assignment_id_hr_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."hr_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_voluntary_deductions" ADD CONSTRAINT "hrm_voluntary_deductions_element_id_hrm_pay_elements_id_fk" FOREIGN KEY ("element_id") REFERENCES "public"."hrm_pay_elements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_leave_balances" ADD CONSTRAINT "hrm_leave_balances_person_id_hr_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."hr_persons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_payroll_batches" ADD CONSTRAINT "hrm_payroll_batches_period_id_hrm_time_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."hrm_time_periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_payslip_entries" ADD CONSTRAINT "hrm_payslip_entries_payslip_id_hrm_payslips_id_fk" FOREIGN KEY ("payslip_id") REFERENCES "public"."hrm_payslips"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_payslips" ADD CONSTRAINT "hrm_payslips_batch_id_hrm_payroll_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."hrm_payroll_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_shift_assignments" ADD CONSTRAINT "hrm_shift_assignments_person_id_hr_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."hr_persons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_shift_assignments" ADD CONSTRAINT "hrm_shift_assignments_shift_id_hrm_shifts_id_fk" FOREIGN KEY ("shift_id") REFERENCES "public"."hrm_shifts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_time_entries" ADD CONSTRAINT "hrm_time_entries_timesheet_id_hrm_time_sheets_id_fk" FOREIGN KEY ("timesheet_id") REFERENCES "public"."hrm_time_sheets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_time_sheets" ADD CONSTRAINT "hrm_time_sheets_person_id_hr_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."hr_persons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_time_sheets" ADD CONSTRAINT "hrm_time_sheets_period_id_hrm_time_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."hrm_time_periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_time_sheets" ADD CONSTRAINT "hrm_time_sheets_approver_id_hr_persons_id_fk" FOREIGN KEY ("approver_id") REFERENCES "public"."hr_persons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_time_violations" ADD CONSTRAINT "hrm_time_violations_entry_id_hrm_time_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."hrm_time_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_ben_enrollments" ADD CONSTRAINT "hrm_ben_enrollments_person_id_hr_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."hr_persons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_ben_enrollments" ADD CONSTRAINT "hrm_ben_enrollments_plan_option_id_hrm_ben_plan_options_id_fk" FOREIGN KEY ("plan_option_id") REFERENCES "public"."hrm_ben_plan_options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_ben_plan_options" ADD CONSTRAINT "hrm_ben_plan_options_plan_id_hrm_ben_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."hrm_ben_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_ben_plan_options" ADD CONSTRAINT "hrm_ben_plan_options_option_id_hrm_ben_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."hrm_ben_options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_ben_plans" ADD CONSTRAINT "hrm_ben_plans_program_id_hrm_ben_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."hrm_ben_programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hrm_ben_plans" ADD CONSTRAINT "hrm_ben_plans_deduction_element_id_hrm_pay_elements_id_fk" FOREIGN KEY ("deduction_element_id") REFERENCES "public"."hrm_pay_elements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_territory_id_crm_territories_id_fk" FOREIGN KEY ("territory_id") REFERENCES "public"."crm_territories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sla_journal_headers" ADD CONSTRAINT "sla_journal_headers_event_type_id_sla_event_types_id_fk" FOREIGN KEY ("event_type_id") REFERENCES "public"."sla_event_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "gl_balances_ledger_period_idx" ON "gl_balances_v2" USING btree ("ledger_id","period_name");--> statement-breakpoint
CREATE UNIQUE INDEX "gl_daily_rates_lookup_idx" ON "gl_daily_rates" USING btree ("from_currency","to_currency","conversion_date");--> statement-breakpoint
ALTER TABLE "gl_budget_control_rules" DROP COLUMN "rule_name";--> statement-breakpoint
ALTER TABLE "gl_cross_validation_rules_v2" DROP COLUMN "rule_name";--> statement-breakpoint
ALTER TABLE "gl_recurring_journals" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "gl_recurring_journals" DROP COLUMN "currency_code";--> statement-breakpoint
ALTER TABLE "gl_recurring_journals" DROP COLUMN "schedule_type";--> statement-breakpoint
ALTER TABLE "gl_recurring_journals" DROP COLUMN "journal_template";