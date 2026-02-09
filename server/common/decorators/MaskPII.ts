
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
    function createWrapper(originalMethod: Function) {
        return async function (this: any, ...args: any[]) {
            const result = await originalMethod.apply(this, args);

            let tId: string | undefined;
            let uId: string | undefined;

            if (tenantIdArgIndex !== undefined) tId = args[tenantIdArgIndex];
            else tId = args.find(a => typeof a === 'string' && (a.startsWith('tenant_') || a.length > 10));

            if (userIdArgIndex !== undefined) uId = args[userIdArgIndex];
            else uId = args.find(a => typeof a === 'string' && (a.startsWith('user_') || a === 'system' || a === 'guest'));

            if (!tId || !uId) {
                return result;
            }

            const dataToMask = Array.isArray(result) ? result :
                (result.data && Array.isArray(result.data)) ? result.data :
                    (result.person) ? [result.person] :
                        [result];

            const userAors = await AorService.getAorForUser(uId, tId);
            const hasAdminAccess = (userAors.length === 0);

            if (hasAdminAccess) {
                return result;
            }

            const processedList = await Promise.all(dataToMask.map(async (item: any) => {
                if (!item) return item;
                const targetId = item.id || item.personId;
                if (!targetId) return item;

                const hasAccess = await AorService.hasAccess(uId!, targetId, tId!);

                if (!hasAccess) {
                    const masked = { ...item };
                    sensitiveFields.forEach(field => {
                        if (masked[field]) {
                            masked[field] = field.toLowerCase().includes('date') ? '1900-01-01' : '*****';
                        }
                    });
                    return masked;
                }
                return item;
            }));

            if (Array.isArray(result)) return processedList;
            if (result.data && Array.isArray(result.data)) return { ...result, data: processedList };
            if (result.person) return { ...result, person: processedList[0] };

            return processedList[0];
        };
    }

    return function (targetOrMethod: any, contextOrPropertyKey?: any, descriptor?: PropertyDescriptor) {
        if (descriptor && typeof descriptor.value === 'function') {
            descriptor.value = createWrapper(descriptor.value);
            return;
        }

        if (typeof targetOrMethod === 'function') {
            return createWrapper(targetOrMethod);
        }

        return targetOrMethod;
    };
}
