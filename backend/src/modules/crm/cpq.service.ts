import { Injectable } from '@nestjs/common';

export interface Product {
  id: string;
  name: string;
  basePrice: number;
  costPrice: number;
  category: string;
}

export interface QuoteLineItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  total: number;
}

export interface Quote {
  id: string;
  accountId: string;
  quoteDate: Date;
  expiryDate: Date;
  lineItems: QuoteLineItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
}

@Injectable()
export class CPQService {
  private products: Map<string, Product> = new Map();
  private quotes: Map<string, Quote> = new Map();
  private quoteCounter = 1;

  createProduct(product: Product): Product {
    this.products.set(product.id, product);
    return product;
  }

  createQuote(accountId: string): Quote {
    const quote: Quote = {
      id: `QUOTE-${this.quoteCounter++}`,
      accountId,
      quoteDate: new Date(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      lineItems: [],
      subtotal: 0,
      discountAmount: 0,
      taxAmount: 0,
      total: 0,
      status: 'draft',
    };

    this.quotes.set(quote.id, quote);
    return quote;
  }

  addLineItem(quoteId: string, productId: string, quantity: number, discountPercent = 0): QuoteLineItem | undefined {
    const quote = this.quotes.get(quoteId);
    const product = this.products.get(productId);

    if (!quote || !product) return undefined;

    const unitPrice = product.basePrice;
    const discountAmount = unitPrice * (discountPercent / 100);
    const finalPrice = unitPrice - discountAmount;
    const total = finalPrice * quantity;

    const lineItem: QuoteLineItem = {
      id: `LINE-${Math.random().toString(36).substr(2, 9)}`,
      productId,
      quantity,
      unitPrice,
      discountPercent,
      total,
    };

    quote.lineItems.push(lineItem);
    this.recalculateQuote(quoteId);

    return lineItem;
  }

  private recalculateQuote(quoteId: string): void {
    const quote = this.quotes.get(quoteId);
    if (!quote) return;

    quote.subtotal = quote.lineItems.reduce((sum, item) => sum + item.total, 0);
    quote.discountAmount = quote.lineItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity * (item.discountPercent / 100),
      0,
    );
    quote.taxAmount = (quote.subtotal - quote.discountAmount) * 0.1; // 10% tax
    quote.total = quote.subtotal - quote.discountAmount + quote.taxAmount;
  }

  sendQuote(quoteId: string): { success: boolean; message: string } {
    const quote = this.quotes.get(quoteId);
    if (!quote) {
      return { success: false, message: 'Quote not found' };
    }

    if (quote.lineItems.length === 0) {
      return { success: false, message: 'Cannot send quote with no line items' };
    }

    quote.status = 'sent';
    return { success: true, message: 'Quote sent successfully' };
  }

  acceptQuote(quoteId: string): { success: boolean; orderId?: string } {
    const quote = this.quotes.get(quoteId);
    if (!quote) {
      return { success: false };
    }

    quote.status = 'accepted';
    const orderId = `ORD-${Date.now()}`;

    return { success: true, orderId };
  }

  calculateDiscount(quoteId: string, discountPercent: number): number {
    const quote = this.quotes.get(quoteId);
    if (!quote) return 0;

    return quote.subtotal * (discountPercent / 100);
  }
}
