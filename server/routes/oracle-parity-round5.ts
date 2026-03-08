/**
 * Oracle Parity Round 5 — Backend API Routes
 * Covers: AR Memos, AR Receipt Applications, AP Match Tolerances,
 *         FA Tax Books, Expense Cash Advances, Expense Audit Rules,
 *         Expense Payroll Batches, CE Cash Pools, Lease Approval Chains,
 *         Tax eBTax (regimes, rates, rules)
 */
import { Router } from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";

export const oracleParityRouter = Router();

// ─────────────────────────────────────────────────────────────
// AR: Credit / Debit Memos
// ─────────────────────────────────────────────────────────────
oracleParityRouter.get("/ar/memos", async (req, res) => {
    try {
        const { type, status, customerId } = req.query;
        let query = `SELECT m.*, c.customer_name FROM ar_memos m
      LEFT JOIN ar_customers c ON c.id = m.customer_id WHERE 1=1`;
        const params: any[] = [];
        if (type) { query += ` AND m.memo_type = $${params.length + 1}`; params.push(type); }
        if (status) { query += ` AND m.status = $${params.length + 1}`; params.push(status); }
        if (customerId) { query += ` AND m.customer_id = $${params.length + 1}`; params.push(customerId); }
        query += ` ORDER BY m.created_at DESC`;
        const result = await db.execute(sql.raw(query));
        res.json(result.rows ?? result);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

oracleParityRouter.post("/ar/memos", async (req, res) => {
    try {
        const { memoType, customerId, relatedInvoiceId, memoDate, accountingDate,
            currencyCode, totalAmount, glAccount, notes, lines } = req.body;
        const prefix = memoType === "Credit Memo" ? "CM" : "DM";
        const memoNumber = `${prefix}-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
        const memoResult = await db.execute(sql.raw(`
      INSERT INTO ar_memos (memo_number, memo_type, customer_id, related_invoice_id, memo_date,
        accounting_date, currency_code, total_amount, gl_account, status, notes)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'Draft',$10)
      RETURNING *`,
            [memoNumber, memoType, customerId, relatedInvoiceId, memoDate,
                accountingDate, currencyCode || "USD", totalAmount, glAccount, notes]));
        const memo = (memoResult.rows ?? (memoResult as any))[0];
        if (lines?.length) {
            for (const l of lines) {
                await db.execute(sql.raw(`
          INSERT INTO ar_memo_lines (memo_id, line_seq, description, reason_code, unit_price, quantity, tax_code, amount)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
                    [memo.id, l.lineSeq, l.description, l.reasonCode, l.unitPrice, l.quantity, l.taxCode, l.amount]));
            }
        }
        res.status(201).json(memo);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

oracleParityRouter.post("/ar/memos/:id/post", async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute(sql.raw(
            `UPDATE ar_memos SET status='Posted', posted_at=NOW(), updated_at=NOW() WHERE id=$1`, [id]));
        res.json({ success: true, message: `Memo ${id} posted to GL` });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────
// AR: Receipt Applications
// ─────────────────────────────────────────────────────────────
oracleParityRouter.get("/ar/receipts/:id/applications", async (req, res) => {
    try {
        const result = await db.execute(sql.raw(
            `SELECT a.*, i.invoice_number FROM ar_receipt_applications a
       LEFT JOIN ar_invoices i ON i.id = a.applied_to_invoice_id
       WHERE a.receipt_id=$1 ORDER BY a.created_at`, [req.params.id]));
        res.json(result.rows ?? result);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

oracleParityRouter.post("/ar/receipts/:id/apply", async (req, res) => {
    try {
        const { applicationType, appliedToInvoiceId, amountApplied, currencyCode, glAccount } = req.body;
        const result = await db.execute(sql.raw(`
      INSERT INTO ar_receipt_applications (receipt_id, applied_to_invoice_id, application_type, application_date, amount_applied, currency_code, gl_account)
      VALUES ($1,$2,$3,CURRENT_DATE,$4,$5,$6) RETURNING *`,
            [req.params.id, appliedToInvoiceId, applicationType, amountApplied, currencyCode || "USD", glAccount]));
        // Update receipt remaining balance
        await db.execute(sql.raw(
            `UPDATE ar_receipts SET status=CASE WHEN unapplied_amount - $1 <= 0 THEN 'Applied' ELSE 'Partial' END,
       updated_at=NOW() WHERE id=$2`,
            [amountApplied, req.params.id]));
        res.status(201).json((result.rows ?? result)[0]);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────
// AP: Match Tolerances
// ─────────────────────────────────────────────────────────────
oracleParityRouter.get("/ap/match-tolerances", async (req, res) => {
    try {
        const result = await db.execute(sql.raw(`SELECT * FROM ap_match_tolerances ORDER BY match_type, item_category`));
        res.json(result.rows ?? result);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

oracleParityRouter.put("/ap/match-tolerances/:id", async (req, res) => {
    try {
        const { qtyVariancePct, amtVariancePct, amtVarianceAbs, breachAction, holdCode } = req.body;
        const result = await db.execute(sql.raw(`
      UPDATE ap_match_tolerances SET qty_variance_pct=$1, amt_variance_pct=$2, amt_variance_abs=$3,
        breach_action=$4, hold_code=$5, updated_at=NOW() WHERE id=$6 RETURNING *`,
            [qtyVariancePct, amtVariancePct, amtVarianceAbs, breachAction, holdCode, req.params.id]));
        res.json((result.rows ?? result)[0]);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

oracleParityRouter.get("/ap/inspection-hold-rules", async (req, res) => {
    try {
        const result = await db.execute(sql.raw(`SELECT * FROM ap_inspection_hold_rules ORDER BY id`));
        res.json(result.rows ?? result);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

oracleParityRouter.put("/ap/inspection-hold-rules/:id", async (req, res) => {
    try {
        const { isActive } = req.body;
        const result = await db.execute(sql.raw(
            `UPDATE ap_inspection_hold_rules SET is_active=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
            [isActive, req.params.id]));
        res.json((result.rows ?? result)[0]);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────
// AP: Distribution Sets (backend CRUD for DistributionSetTemplates)
// ─────────────────────────────────────────────────────────────
oracleParityRouter.get("/ap/distribution-sets", async (req, res) => {
    try {
        const sets = await db.execute(sql.raw(`SELECT * FROM ap_distribution_sets ORDER BY set_code`));
        const lines = await db.execute(sql.raw(`SELECT * FROM ap_distribution_set_lines ORDER BY distribution_set_id, sequence_num`));
        const setsArr = sets.rows ?? (sets as any);
        const linesArr = lines.rows ?? (lines as any);
        const result = setsArr.map((s: any) => ({ ...s, lines: linesArr.filter((l: any) => l.distribution_set_id === s.id) }));
        res.json(result);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────
// FA: Tax Books
// ─────────────────────────────────────────────────────────────
oracleParityRouter.get("/fa/tax-books", async (req, res) => {
    try {
        const result = await db.execute(sql.raw(`SELECT * FROM fa_tax_books ORDER BY book_name`));
        res.json(result.rows ?? result);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

oracleParityRouter.post("/fa/tax-books", async (req, res) => {
    try {
        const { bookName, linkedCorporateBook, taxAuthority, depreciationMethod, convention, lifeYears, bonusPct, effectiveDate, notes } = req.body;
        const result = await db.execute(sql.raw(`
      INSERT INTO fa_tax_books (book_name, linked_corporate_book, tax_authority, depreciation_method, convention, life_years, bonus_pct, effective_date, notes)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
            [bookName, linkedCorporateBook, taxAuthority, depreciationMethod, convention, lifeYears, bonusPct, effectiveDate, notes]));
        res.status(201).json((result.rows ?? result)[0]);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────
// Expense: Cash Advances
// ─────────────────────────────────────────────────────────────
oracleParityRouter.get("/expenses/cash-advances", async (req, res) => {
    try {
        const result = await db.execute(sql.raw(`SELECT * FROM expense_cash_advances ORDER BY issue_date DESC`));
        res.json(result.rows ?? result);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

oracleParityRouter.post("/expenses/cash-advances", async (req, res) => {
    try {
        const { employeeId, employeeName, department, advanceAmount, currencyCode, purpose, issueDate, dueDate, paymentMethod, glAccount } = req.body;
        const advanceNumber = `ADV-${Date.now().toString().slice(-6)}`;
        const result = await db.execute(sql.raw(`
      INSERT INTO expense_cash_advances (advance_number, employee_id, employee_name, department, advance_amount, currency_code, purpose, issue_date, due_date, payment_method, gl_account)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
            [advanceNumber, employeeId, employeeName, department, advanceAmount, currencyCode || "USD", purpose, issueDate, dueDate, paymentMethod, glAccount]));
        res.status(201).json((result.rows ?? result)[0]);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

oracleParityRouter.put("/expenses/cash-advances/:id/reconcile", async (req, res) => {
    try {
        const { reconciledAmount, expenseReportRef } = req.body;
        const result = await db.execute(sql.raw(`
      UPDATE expense_cash_advances SET reconciled_amount=$1, expense_report_ref=$2,
        status=CASE WHEN reconciled_amount >= advance_amount THEN 'Reconciled' ELSE 'Partial' END,
        updated_at=NOW() WHERE id=$3 RETURNING *`,
            [reconciledAmount, expenseReportRef, req.params.id]));
        res.json((result.rows ?? result)[0]);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────
// Expense: Audit Rules
// ─────────────────────────────────────────────────────────────
oracleParityRouter.get("/expenses/audit-rules", async (req, res) => {
    try {
        const result = await db.execute(sql.raw(`SELECT * FROM expense_audit_rules ORDER BY rule_name`));
        res.json(result.rows ?? result);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

oracleParityRouter.post("/expenses/audit-rules", async (req, res) => {
    try {
        const { ruleName, ruleType, severity, conditionField, conditionOp, thresholdValue, action, notifyRoles, appliesTo } = req.body;
        const result = await db.execute(sql.raw(`
      INSERT INTO expense_audit_rules (rule_name, rule_type, severity, condition_field, condition_op, threshold_value, action, notify_roles, applies_to)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
            [ruleName, ruleType, severity, conditionField, conditionOp, thresholdValue, action,
                notifyRoles ? `{${notifyRoles.join(",")}}` : null, appliesTo || "All"]));
        res.status(201).json((result.rows ?? result)[0]);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────
// Expense: Payroll Reimbursement Batches
// ─────────────────────────────────────────────────────────────
oracleParityRouter.get("/expenses/payroll-batches", async (req, res) => {
    try {
        const batches = await db.execute(sql.raw(`SELECT * FROM expense_payroll_batches ORDER BY created_at DESC`));
        res.json(batches.rows ?? batches);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

oracleParityRouter.post("/expenses/payroll-batches/:id/submit", async (req, res) => {
    try {
        const result = await db.execute(sql.raw(`
      UPDATE expense_payroll_batches SET status='Transmitted', submitted_at=NOW(), updated_at=NOW()
      WHERE id=$1 RETURNING *`, [req.params.id]));
        res.json((result.rows ?? result)[0]);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────
// Tax: eBTax CRUD
// ─────────────────────────────────────────────────────────────
oracleParityRouter.get("/tax/regimes", async (req, res) => {
    try {
        const result = await db.execute(sql.raw(`SELECT r.*, COUNT(t.id) as tax_count FROM zx_regimes r LEFT JOIN zx_taxes t ON t.regime_id = r.id GROUP BY r.id ORDER BY r.regime_name`));
        res.json(result.rows ?? result);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

oracleParityRouter.post("/tax/regimes", async (req, res) => {
    try {
        const { regimeCode, regimeName, countryCode, taxType, effectiveFrom } = req.body;
        const result = await db.execute(sql.raw(`
      INSERT INTO zx_regimes (regime_code, regime_name, country_code, tax_type, effective_from)
      VALUES ($1,$2,$3,$4,$5) RETURNING *`,
            [regimeCode, regimeName, countryCode, taxType || "VAT", effectiveFrom]));
        res.status(201).json((result.rows ?? result)[0]);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

oracleParityRouter.get("/tax/regimes/:id/taxes", async (req, res) => {
    try {
        const result = await db.execute(sql.raw(
            `SELECT t.*, COUNT(r.id) as rate_count FROM zx_taxes t LEFT JOIN zx_rates r ON r.tax_id = t.id WHERE t.regime_id=$1 GROUP BY t.id`,
            [req.params.id]));
        res.json(result.rows ?? result);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

oracleParityRouter.post("/tax/trn-validate", async (req, res) => {
    try {
        const { trn, countryCode, supplierId, supplierName } = req.body;
        // Format-based validation
        const patterns: Record<string, RegExp> = {
            "GB": /^GB\d{9}$/, "DE": /^DE\d{9}$/, "FR": /^FR[A-Z\d]{2}\d{9}$/,
            "AE": /^1\d{14}$/, "US": /^\d{2}-\d{7}$/, "AU": /^\d{11}$/,
        };
        const regex = patterns[countryCode?.toUpperCase()] || null;
        const normalised = trn?.replace(/\s/g, "").toUpperCase();
        const result = regex ? (regex.test(normalised) ? "Valid" : "Invalid") : "Unverified";
        // Log to DB
        await db.execute(sql.raw(`
      INSERT INTO zx_trn_validation_log (supplier_id, supplier_name, trn_number, country_code, validation_type, result)
      VALUES ($1,$2,$3,$4,'REGEX',$5)`,
            [supplierId, supplierName, trn, countryCode, result]));
        res.json({ trn, countryCode, result, normalised });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────
// Lease: Approval Chains
// ─────────────────────────────────────────────────────────────
oracleParityRouter.get("/leases/approval-chains", async (req, res) => {
    try {
        const chains = await db.execute(sql.raw(`SELECT * FROM lease_approval_chains ORDER BY threshold_min`));
        const steps = await db.execute(sql.raw(`SELECT * FROM lease_approval_steps ORDER BY chain_id, step_order`));
        const chainsArr = chains.rows ?? (chains as any);
        const stepsArr = steps.rows ?? (steps as any);
        res.json(chainsArr.map((c: any) => ({ ...c, steps: stepsArr.filter((s: any) => s.chain_id === c.id) })));
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

oracleParityRouter.post("/leases/approval-chains", async (req, res) => {
    try {
        const { chainName, leaseType, thresholdMin, thresholdMax, currencyCode, steps } = req.body;
        const chainResult = await db.execute(sql.raw(`
      INSERT INTO lease_approval_chains (chain_name, lease_type, threshold_min, threshold_max, currency_code)
      VALUES ($1,$2,$3,$4,$5) RETURNING *`,
            [chainName, leaseType, thresholdMin, thresholdMax, currencyCode || "USD"]));
        const chain = (chainResult.rows ?? chainResult)[0];
        if (steps?.length) {
            for (const s of steps) {
                await db.execute(sql.raw(`
          INSERT INTO lease_approval_steps (chain_id, step_order, approver_role, approver_name, step_type, escalation_days, is_mandatory)
          VALUES ($1,$2,$3,$4,$5,$6,$7)`,
                    [chain.id, s.stepOrder, s.approverRole, s.approverName, s.stepType || "Sequential", s.escalationDays, s.isMandatory !== false]));
            }
        }
        res.status(201).json(chain);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────
// CE: Cash Pools
// ─────────────────────────────────────────────────────────────
oracleParityRouter.get("/ce/cash-pools", async (req, res) => {
    try {
        const pools = await db.execute(sql.raw(`SELECT * FROM ce_cash_pools ORDER BY pool_name`));
        const members = await db.execute(sql.raw(`SELECT * FROM ce_cash_pool_members ORDER BY pool_id`));
        const poolsArr = pools.rows ?? (pools as any);
        const membersArr = members.rows ?? (members as any);
        res.json(poolsArr.map((p: any) => ({ ...p, members: membersArr.filter((m: any) => m.pool_id === p.id) })));
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

oracleParityRouter.post("/ce/cash-pools", async (req, res) => {
    try {
        const { poolName, poolType, headerAccount, currencyCode, bankName, concentrationAccount, members } = req.body;
        const poolResult = await db.execute(sql.raw(`
      INSERT INTO ce_cash_pools (pool_name, pool_type, header_account, currency_code, bank_name, concentration_account)
      VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
            [poolName, poolType || "Notional", headerAccount, currencyCode || "USD", bankName, concentrationAccount]));
        const pool = (poolResult.rows ?? poolResult)[0];
        if (members?.length) {
            for (const m of members) {
                await db.execute(sql.raw(`
          INSERT INTO ce_cash_pool_members (pool_id, entity_name, account_number, bank_code, currency_code, contribution_pct)
          VALUES ($1,$2,$3,$4,$5,$6)`,
                    [pool.id, m.entityName, m.accountNumber, m.bankCode, m.currencyCode, m.contributionPct]));
            }
        }
        res.status(201).json(pool);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────
// FA: Prorate Conventions
// ─────────────────────────────────────────────────────────────
oracleParityRouter.get("/fa/prorate-conventions", async (req, res) => {
    try {
        const result = await db.execute(sql.raw(`SELECT * FROM fa_prorate_conventions ORDER BY convention_code`));
        res.json(result.rows ?? result);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

oracleParityRouter.post("/fa/prorate-conventions", async (req, res) => {
    try {
        const { conventionCode, conventionName, description, firstYearRule, lastYearRule } = req.body;
        if (!conventionCode || !conventionName) {
            return res.status(400).json({ error: "conventionCode and conventionName are required" });
        }
        const result = await db.execute(sql.raw(`
      INSERT INTO fa_prorate_conventions (convention_code, convention_name, description, first_year_rule, last_year_rule)
      VALUES ($1,$2,$3,$4,$5) RETURNING *`,
            [conventionCode, conventionName, description, firstYearRule, lastYearRule]));
        res.status(201).json((result.rows ?? result)[0]);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

oracleParityRouter.put("/fa/prorate-conventions/:id", async (req, res) => {
    try {
        const { conventionName, description, firstYearRule, lastYearRule, isActive } = req.body;
        const result = await db.execute(sql.raw(`
      UPDATE fa_prorate_conventions SET convention_name=$1, description=$2, first_year_rule=$3,
        last_year_rule=$4, is_active=$5 WHERE id=$6 RETURNING *`,
            [conventionName, description, firstYearRule, lastYearRule, isActive !== false, req.params.id]));
        res.json((result.rows ?? result)[0]);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

oracleParityRouter.delete("/fa/prorate-conventions/:id", async (req, res) => {
    try {
        await db.execute(sql.raw(`UPDATE fa_prorate_conventions SET is_active=FALSE WHERE id=$1`, [req.params.id]));
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────
// FA: Asset Reclassifications
// ─────────────────────────────────────────────────────────────
oracleParityRouter.get("/fa/reclassifications", async (req, res) => {
    try {
        const { status, assetId } = req.query;
        let query = `SELECT r.*, fc.category_name as from_category, tc.category_name as to_category
      FROM fa_reclassifications r
      LEFT JOIN fa_categories fc ON fc.id = r.from_category_id
      LEFT JOIN fa_categories tc ON tc.id = r.to_category_id WHERE 1=1`;
        const params: any[] = [];
        if (status) { query += ` AND r.status = $${params.length + 1}`; params.push(status); }
        if (assetId) { query += ` AND r.asset_id = $${params.length + 1}`; params.push(assetId); }
        query += ` ORDER BY r.created_at DESC`;
        const result = await db.execute(sql.raw(query));
        res.json(result.rows ?? result);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

oracleParityRouter.post("/fa/reclassifications", async (req, res) => {
    try {
        const { assetId, fromCategoryId, toCategoryId, effectiveDate, oldDeprnMethod,
            newDeprnMethod, oldLifeMonths, newLifeMonths, notes, requestedBy } = req.body;
        if (!assetId || !toCategoryId || !effectiveDate) {
            return res.status(400).json({ error: "assetId, toCategoryId, and effectiveDate are required" });
        }
        const result = await db.execute(sql.raw(`
      INSERT INTO fa_reclassifications
        (asset_id, from_category_id, to_category_id, effective_date,
         old_deprn_method, new_deprn_method, old_life_months, new_life_months, notes, requested_by, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'Pending') RETURNING *`,
            [assetId, fromCategoryId, toCategoryId, effectiveDate,
                oldDeprnMethod, newDeprnMethod, oldLifeMonths, newLifeMonths, notes, requestedBy]));
        res.status(201).json((result.rows ?? result)[0]);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

oracleParityRouter.post("/fa/reclassifications/:id/post", async (req, res) => {
    try {
        const { glJournalRef, approvedBy } = req.body;
        const journalRef = glJournalRef || `RECLASSIFY-${Date.now().toString().slice(-6)}`;
        const result = await db.execute(sql.raw(`
      UPDATE fa_reclassifications
        SET status='Posted', gl_journal_ref=$1, approved_by=$2, updated_at=NOW()
      WHERE id=$3 AND status='Pending'
      RETURNING *`,
            [journalRef, approvedBy, req.params.id]));
        const rows = result.rows ?? (result as any);
        if (!rows.length) return res.status(404).json({ error: "Reclassification not found or already posted" });
        res.json({ ...rows[0], message: `GL Journal ${journalRef} created` });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

oracleParityRouter.post("/fa/reclassifications/:id/reverse", async (req, res) => {
    try {
        const result = await db.execute(sql.raw(`
      UPDATE fa_reclassifications SET status='Reversed', updated_at=NOW()
      WHERE id=$1 AND status='Posted' RETURNING *`,
            [req.params.id]));
        const rows = result.rows ?? (result as any);
        if (!rows.length) return res.status(404).json({ error: "Reclassification not found or not in Posted status" });
        res.json(rows[0]);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────
// Tax: eBTax — Rates and Jurisdictions CRUD
// ─────────────────────────────────────────────────────────────
oracleParityRouter.get("/tax/rates", async (req, res) => {
    try {
        const { taxId } = req.query;
        let query = `SELECT r.*, t.tax_code, t.tax_name FROM zx_rates r
      LEFT JOIN zx_taxes t ON t.id = r.tax_id WHERE 1=1`;
        const params: any[] = [];
        if (taxId) { query += ` AND r.tax_id = $${params.length + 1}`; params.push(taxId); }
        query += ` ORDER BY t.tax_code, r.effective_from DESC`;
        const result = await db.execute(sql.raw(query));
        res.json(result.rows ?? result);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

oracleParityRouter.post("/tax/rates", async (req, res) => {
    try {
        const { taxId, rateCode, rateName, percentageRate, effectiveFrom, effectiveTo, isDefault } = req.body;
        if (!taxId || !rateCode || percentageRate == null) {
            return res.status(400).json({ error: "taxId, rateCode, and percentageRate are required" });
        }
        // If setting as default, clear existing default
        if (isDefault) {
            await db.execute(sql.raw(
                `UPDATE zx_rates SET is_default=FALSE WHERE tax_id=$1`, [taxId]));
        }
        const result = await db.execute(sql.raw(`
      INSERT INTO zx_rates (tax_id, rate_code, rate_name, percentage_rate, effective_from, effective_to, is_default)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
            [taxId, rateCode, rateName, percentageRate, effectiveFrom, effectiveTo, !!isDefault]));
        res.status(201).json((result.rows ?? result)[0]);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

oracleParityRouter.get("/tax/jurisdictions", async (req, res) => {
    try {
        const { taxId } = req.query;
        const params: any[] = [];
        let query = `SELECT * FROM zx_jurisdictions WHERE 1=1`;
        if (taxId) { query += ` AND tax_id = $${params.length + 1}`; params.push(taxId); }
        query += ` ORDER BY country_code, jurisdiction_name`;
        const result = await db.execute(sql.raw(query));
        res.json(result.rows ?? result);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

oracleParityRouter.post("/tax/jurisdictions", async (req, res) => {
    try {
        const { taxId, jurisdictionCode, jurisdictionName, countryCode, regionCode, city, effectiveFrom } = req.body;
        const result = await db.execute(sql.raw(`
      INSERT INTO zx_jurisdictions (tax_id, jurisdiction_code, jurisdiction_name, country_code, region_code, city, effective_from)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
            [taxId, jurisdictionCode, jurisdictionName, countryCode, regionCode, city, effectiveFrom]));
        res.status(201).json((result.rows ?? result)[0]);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

oracleParityRouter.post("/tax/taxes", async (req, res) => {
    try {
        const { regimeId, taxCode, taxName, countryCode, recoveryRate } = req.body;
        if (!regimeId || !taxCode || !taxName) {
            return res.status(400).json({ error: "regimeId, taxCode, and taxName are required" });
        }
        const result = await db.execute(sql.raw(`
      INSERT INTO zx_taxes (regime_id, tax_code, tax_name, country_code, recovery_rate)
      VALUES ($1,$2,$3,$4,$5) RETURNING *`,
            [regimeId, taxCode, taxName, countryCode, recoveryRate ?? 100]));
        res.status(201).json((result.rows ?? result)[0]);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Enhanced TRN validation — regex + country-specific rule sets + full logging
oracleParityRouter.post("/tax/trn-validate", async (req, res) => {
    try {
        const { trn, countryCode, supplierId, supplierName } = req.body;

        // Comprehensive format patterns
        const patterns: Record<string, { regex: RegExp; label: string; example: string }> = {
            "GB": { regex: /^GB(\d{9}|\d{12}|GD\d{3}|HA\d{3})$/, label: "UK VAT", example: "GB123456789" },
            "DE": { regex: /^DE\d{9}$/, label: "German USt-IdNr", example: "DE123456789" },
            "FR": { regex: /^FR[A-HJ-NP-Z0-9]{2}\d{9}$/, label: "French TVA", example: "FRXX123456789" },
            "IT": { regex: /^IT\d{11}$/, label: "Italian P.IVA", example: "IT12345678901" },
            "ES": { regex: /^ES[A-Z0-9]\d{7}[A-Z0-9]$/, label: "Spanish NIF", example: "ESA12345678" },
            "NL": { regex: /^NL\d{9}B\d{2}$/, label: "Dutch BTW", example: "NL123456789B01" },
            "AE": { regex: /^1\d{14}$/, label: "UAE TRN (FTA)", example: "100123456700003" },
            "SA": { regex: /^3\d{14}$/, label: "Saudi VAT (ZATCA)", example: "312345678900003" },
            "AU": { regex: /^\d{11}$/, label: "Australian ABN", example: "12345678901" },
            "US": { regex: /^\d{2}-\d{7}$/, label: "US EIN", example: "12-3456789" },
            "IN": { regex: /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/, label: "India GSTIN", example: "22AAAAA0000A1Z5" },
            "CA": { regex: /^\d{9}(RT\d{4})?$/, label: "Canada BN/GST", example: "123456789RT0001" },
            "SG": { regex: /^(T|S|R)\d{2}[A-Z]{2}\d{4}[A-Z]$/, label: "Singapore GST Reg", example: "M12345678X" },
        };

        const cc = countryCode?.toUpperCase();
        const normalised = trn?.replace(/[\s\-\.]/g, "").toUpperCase();
        const ruleSet = patterns[cc];
        let result: string;
        let validationType: string;
        let hint: string | undefined;

        if (ruleSet) {
            const passed = ruleSet.regex.test(normalised);
            result = passed ? "Valid" : "Invalid";
            validationType = "FORMAT_REGEX";
            if (!passed) hint = `Expected format: ${ruleSet.label} — e.g. ${ruleSet.example}`;
        } else {
            result = "Unverified";
            validationType = "NO_RULE";
            hint = `No validation rule defined for country ${cc}. Manual verification recommended.`;
        }

        // Log every validation attempt
        await db.execute(sql.raw(`
      INSERT INTO zx_trn_validation_log
        (supplier_id, supplier_name, trn_number, country_code, validation_type, result)
      VALUES ($1,$2,$3,$4,$5,$6)`,
            [supplierId || null, supplierName || null, trn, cc, validationType, result]));

        res.json({
            trn,
            normalised,
            countryCode: cc,
            result,
            validationType,
            ruleLabel: ruleSet?.label,
            example: ruleSet?.example,
            hint
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Lookup recent TRN validation history for a supplier
oracleParityRouter.get("/tax/trn-validate/history", async (req, res) => {
    try {
        const { supplierId, trn, limit } = req.query;
        const params: any[] = [];
        let query = `SELECT * FROM zx_trn_validation_log WHERE 1=1`;
        if (supplierId) { query += ` AND supplier_id = $${params.length + 1}`; params.push(supplierId); }
        if (trn) { query += ` AND trn_number ILIKE $${params.length + 1}`; params.push(`%${trn}%`); }
        query += ` ORDER BY validated_at DESC LIMIT $${params.length + 1}`;
        params.push(Math.min(Number(limit) || 50, 200));
        const result = await db.execute(sql.raw(query));
        res.json(result.rows ?? result);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

