export type FormatterType =
    | "ledger"
    | "account"
    | "cost_center"
    | "project"
    | "user"
    | "currency"
    | "date"
    | "datetime"
    | "status";

export interface FormattedData {
    raw: string | number;
    formatted: string;
    metadata?: Record<string, any>; // e.g., code, description
}

export interface FormatterService {
    format(value: string | number, type: FormatterType): Promise<FormattedData>;
    formatSync(value: string | number, type: FormatterType): FormattedData; // If we cache
}
