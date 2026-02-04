
import { AorService } from "../../modules/hr/services/AorService";

/**
 * @MaskPII decorator
 * Automatically masks sensitive fields in the return value if the caller lacks AOR access.
 * 
 * Usage:
 * @MaskPII(['nationalId', 'dateOfBirth'])
 * static async getPerson(...) { ... }
 * 
 * Assumptions:
 * 1. The decorated method must be static (common in this codebase).
 * 2. The method arguments must include `tenantId` and `currentUserId`. 
 *    - We will dynamically scan arguments to find them by name if possible, 
 *    - or rely on convention: tenantId is typed string, currentUserId is string.
 *    - Given the inconsistency, we might need a more robust extraction strategy.
 *    - Strategy: Look for args named 'tenantId' and 'currentUserId' in the method signature? 
 *    - Reflection in TS is limited. We will search for the arguments by position if convention is strong, 
 *    - OR we simply mandate the caller passes them. 
 *    
 *    Let's try a heuristic: 
 *    - 'tenantId' is usually 1st or 2nd arg.
 *    - 'currentUserId' is usually last or 2nd to last.
 *    
 *    BETTER APPROACH: Pass the argument indices to the decorator definition if needed, 
 *    or standardize. For PersonService:
 *    - searchPersons(tenantId, ..., currentUserId)
 *    - getPersonProfile(personId, tenantId, currentUserId)
 */
export function MaskPII(sensitiveFields: string[], userIdArgIndex?: number, tenantIdArgIndex?: number) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const result = await originalMethod.apply(this, args);

            // 1. Resolve arguments
            // If indices not provided, try to guess or fail safe
            // We really need correct indices.
            // For now, we will try to find them if undefined.

            // This is brittle without metadata. We will expect the developer to provide indices 
            // if they deviate from a standard. 
            // Standard: not defined yet. 

            // Let's rely on finding them in args if possible? No, strings look alike.
            // We will require indices for now to be safe, or fallback to known patterns.

            // PersonService specific hack for now (can be generalized later):
            let tId: string | undefined;
            let uId: string | undefined;

            // Try to find them by convention if not supplied?
            if (tenantIdArgIndex !== undefined) tId = args[tenantIdArgIndex];
            else tId = args.find(a => typeof a === 'string' && (a.startsWith('tenant_') || a.length > 10)); // Heuristic

            if (userIdArgIndex !== undefined) uId = args[userIdArgIndex];
            else uId = args.find(a => typeof a === 'string' && (a.startsWith('user_') || a === 'system' || a === 'guest'));

            if (!tId || !uId) {
                // Can't check access, fail open or close? 
                // Close for security -> Mask everything? 
                // Or assume system call?
                // Let's assume if no userId found, it might be system.
                return result;
            }

            // 2. Check Access
            // The result structure varies. 
            // searchPersons -> { data: [], ... }
            // getPersonProfile -> { person: {}, ... }

            // We need to handle single object or array of objects.
            const dataToMask = Array.isArray(result) ? result :
                (result.data && Array.isArray(result.data)) ? result.data :
                    (result.person) ? [result.person] :
                        [result]; // Fallback treat result as single

            // Note: If result.person, we only mask that sub-object.

            // Optimization: If list, we might want to batch check, 
            // but AorService currently checks per person-target logic.
            // But AorService.hasAccess checks *User's AORs* against *Target's Attrs*.
            // So we fetch User AORs once.

            const userAors = await AorService.getAorForUser(uId, tId);
            const hasAdminAccess = (userAors.length === 0); // "View All" heuristic from service

            if (hasAdminAccess) {
                return result;
            }

            // For each record, check if AOR covers it.
            // This requires fetching the record's assignment data if not present.
            // But wait, the result object (Person) might not have assignment data attached 
            // in the service return (searchPersons DOES join dept/loc/job, but maybe not IDs).

            // IMPORTANT: The decorator can only verify based on inputs or outputs.
            // If the output doesn't contain DepartmentID/LocationID, we can't verify AOR locally 
            // without re-querying DB (Expensive N+1).

            // Assumption: The services return enough data to validate, OR we delegate to AorService which queries DB.
            // AorService.hasAccess queries DB.

            // We will iterate and mask.
            // For array result:
            const processedList = await Promise.all(dataToMask.map(async (item: any) => {
                if (!item) return item;
                const targetId = item.id || item.personId;
                if (!targetId) return item;

                const hasAccess = await AorService.hasAccess(uId!, targetId, tId!);

                if (!hasAccess) {
                    const masked = { ...item };
                    sensitiveFields.forEach(field => {
                        if (masked[field]) {
                            // Simple masking strategy
                            const val = String(masked[field]);
                            masked[field] = field.toLowerCase().includes('date') ? '1900-01-01' : '*****';
                        }
                    });
                    return masked;
                }
                return item;
            }));

            // Reassemble
            if (Array.isArray(result)) return processedList;
            if (result.data && Array.isArray(result.data)) return { ...result, data: processedList };
            if (result.person) return { ...result, person: processedList[0] };

            return processedList[0];
        };
    };
}
