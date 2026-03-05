import { supabase } from '@/lib/db';

export class PIMService {

    static async getProducts(filters: any = {}): Promise<any[]> {
        let query = supabase
            .from('pim_products')
            .select(`
        *,
        pim_categories(name),
        pim_brands(name)
      `)
            .order('created_at', { ascending: false });

        if (filters.status) query = query.eq('status', filters.status);
        if (filters.category_id) query = query.eq('category_id', filters.category_id);
        if (filters.product_type) query = query.eq('product_type', filters.product_type);

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    static async getProduct(id: string): Promise<any> {
        const { data, error } = await supabase
            .from('pim_products')
            .select(`
        *,
        pim_categories(name, slug),
        pim_brands(name, slug),
        pim_product_variants(*)
      `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    static async createProduct(product: any): Promise<any> {
        const { data, error } = await supabase
            .from('pim_products')
            .insert(product)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async updateProduct(id: string, updates: any): Promise<void> {
        const { error } = await supabase
            .from('pim_products ')
            .update(updates)
            .eq('id', id);

        if (error) throw error;
    }

    static async generateVariants(productId: string, attributes: string[]): Promise<void> {
        // Get attribute definitions and options
        const { data: attrDefs } = await supabase
            .from('pim_attribute_definitions')
            .select('*')
            .in('attribute_code', attributes);

        if (!attrDefs) return;

        // Generate all combinations
        const combinations = this.generateCombinations(attrDefs);

        // Create variant records
        const variants = combinations.map((combo: any, index: number) => ({
            parent_product_id: productId,
            sku: `VAR-${productId.substring(0, 8)}-${index + 1}`,
            variant_attributes: combo
        }));

        await supabase
            .from('pim_product_variants')
            .insert(variants);
    }

    static async getCategories(): Promise<any[]> {
        const { data, error } = await supabase
            .from('pim_categories')
            .select('*')
            .order('path', { ascending: true });

        if (error) throw error;
        return data;
    }

    static async getBrands(): Promise<any[]> {
        const { data, error } = await supabase
            .from('pim_brands')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data;
    }

    static async getAttributeDefinitions(): Promise<any[]> {
        const { data, error } = await supabase
            .from('pim_attribute_definitions')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return data;
    }

    static async bulkImport(file: File): Promise<string> {
        // Create bulk operation record
        const { data: operation } = await supabase
            .from('pim_bulk_operations')
            .insert({
                operation_type: 'import',
                status: 'pending',
                input_file_url: file.name
            })
            .select()
            .single();

        // In production, this would upload to storage and trigger background job
        // For now, return operation ID
        return operation.id;
    }

    static async publishProducts(productIds: string[]): Promise<void> {
        await supabase
            .from('pim_products')
            .update({ status: 'published' })
            .in('id', productIds);
    }

    private static generateCombinations(attributes: any[]): any[] {
        if (attributes.length === 0) return [{}];

        const [first, ...rest] = attributes;
        const restCombinations = this.generateCombinations(rest);

        const combinations: any[] = [];
        for (const option of first.options) {
            for (const restCombo of restCombinations) {
                combinations.push({
                    [first.attribute_code]: option.value,
                    ...restCombo
                });
            }
        }

        return combinations;
    }
}

export default PIMService;
