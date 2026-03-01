import { db } from "../db/index";
import { eq, and, sql } from "drizzle-orm";
import { glCrossValidationRules } from "../../shared/schema/finance";

// A simple CCID representation
export interface CCIDSegments {
    segment1?: string | null;
    segment2?: string | null;
    segment3?: string | null;
    segment4?: string | null;
    segment5?: string | null;
    segment6?: string | null;
    segment7?: string | null;
    segment8?: string | null;
    segment9?: string | null;
    segment10?: string | null;
}

/**
 * Super lightweight AST evaluator for Oracle-style GL CVR rules.
 * Supports: =, !=, IN (val1, val2), BETWEEN val1 AND val2, AND, OR
 */
export class GlCvrEngine {

    /**
     * Evaluates a CCID against all active CVRs for a ledger.
     * @param ledgerId The ledger ID
     * @param ccid The segments to test
     * @returns { isValid: boolean, failedRuleName?: string, errorMessage?: string }
     */
    static async validateCCID(ledgerId: string, ccid: CCIDSegments): Promise<{ isValid: boolean, failedRuleName?: string, errorMessage?: string }> {
        // 1. Fetch all active CVRs for this ledger
        const rules = await db.select().from(glCrossValidationRules)
            .where(and(eq(glCrossValidationRules.ledgerId, ledgerId), eq(glCrossValidationRules.isEnabled, true)));

        if (!rules || rules.length === 0) {
            return { isValid: true }; // No rules, everything passes
        }

        // 2. Evaluate each rule
        for (const rule of rules) {
            if (!rule.conditionFilter || !rule.validationFilter) continue;

            const matchesCondition = this.evaluateExpression(rule.conditionFilter, ccid);

            // Logic: IF it matches the condition filter, it MUST match the validation filter
            if (matchesCondition) {
                const matchesValidation = this.evaluateExpression(rule.validationFilter, ccid);
                if (!matchesValidation) {
                    return {
                        isValid: false,
                        failedRuleName: rule.name,
                        errorMessage: rule.errorMessage || `Failed Cross Validation Rule: ${rule.name}`
                    };
                }
            }
        }

        return { isValid: true };
    }

    /**
     * Evaluates a boolean logic string against the CCID segments.
     * Evaluates AND/OR.
     */
    static evaluateExpression(expression: string, ccid: CCIDSegments): boolean {
        // Super basic parser for prototype. 
        // In real Oracle, flexfield rules are parsed into SQL binds or compiled ASTs.
        // We will split by OR first, then AND.
        const orGroups = expression.split(/\s+OR\s+/i);

        for (const orGroup of orGroups) {
            const andConditions = orGroup.split(/\s+AND\s+/i);
            let andPasses = true;

            for (const condition of andConditions) {
                if (!this.evaluateCondition(condition.trim(), ccid)) {
                    andPasses = false;
                    break;
                }
            }

            if (andPasses) {
                return true; // Match one OR group = true overall
            }
        }

        return false;
    }

    /**
     * Evaluates a single atomic condition (e.g. "Segment1=100")
     */
    static evaluateCondition(condition: string, ccid: CCIDSegments): boolean {
        // Parse 'SegmentX = Y', 'SegmentX != Y', 'SegmentX BETWEEN Y AND Z', 'SegmentX IN (A,B)'

        // BETWEEN
        const betweenMatch = condition.match(/(Segment\d+)\s+BETWEEN\s+'?([^']+)'?\s+AND\s+'?([^']+)'?/i);
        if (betweenMatch) {
            const [, segment, min, max] = betweenMatch;
            const val = this.getSegmentValue(segment, ccid);
            if (!val) return false;
            return val >= min && val <= max;
        }

        // IN
        const inMatch = condition.match(/(Segment\d+)\s+IN\s+\((.+)\)/i);
        if (inMatch) {
            const [, segment, listStr] = inMatch;
            const val = this.getSegmentValue(segment, ccid);
            if (!val) return false;
            const validValues = listStr.split(',').map(s => s.trim().replace(/'/g, ''));
            return validValues.includes(val);
        }

        // NOT EQUAL
        const notEqMatch = condition.match(/(Segment\d+)\s*!=\s*'?([^']+)'?/i);
        if (notEqMatch) {
            const [, segment, testVal] = notEqMatch;
            const val = this.getSegmentValue(segment, ccid);
            if (!val) return false;
            return val !== testVal.trim();
        }

        // EQUAL
        const eqMatch = condition.match(/(Segment\d+)\s*=\s*'?([^']+)'?/i);
        if (eqMatch) {
            const [, segment, testVal] = eqMatch;
            const val = this.getSegmentValue(segment, ccid);
            if (!val) return false; // If segment is null but rule expects a value, it fails
            return val === testVal.trim();
        }

        return false; // Unknown format
    }

    static getSegmentValue(segmentName: string, ccid: CCIDSegments): string | null | undefined {
        const key = segmentName.charAt(0).toLowerCase() + segmentName.slice(1) as keyof CCIDSegments;
        return ccid[key];
    }
}
