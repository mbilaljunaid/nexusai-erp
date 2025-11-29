import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  private products: Product[] = [];
  private idCounter = 1;

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product: Product = {
      id: this.idCounter++,
      ...createProductDto,
      createdAt: new Date(),
    };
    this.products.push(product);
    return product;
  }

  async findAll(): Promise<Product[]> {
    return this.products;
  }

  async findOne(id: string): Promise<Product | null> {
    return this.products.find(p => p.id === parseInt(id)) || null;
  }

  async update(id: string, updateProductDto: Partial<CreateProductDto>): Promise<Product | null> {
    const product = this.products.find(p => p.id === parseInt(id));
    if (!product) return null;
    Object.assign(product, updateProductDto);
    return product;
  }

  async remove(id: string): Promise<void> {
    const index = this.products.findIndex(p => p.id === parseInt(id));
    if (index > -1) this.products.splice(index, 1);
  }
}
