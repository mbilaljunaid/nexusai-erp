export class CreateProductDto {
  sku: string;
  name: string;
  category: string;
  description?: string;
  price: string;
  cost: string;
  stock: string;
  status: string;
  supplier?: string;
  tags?: string;
}
