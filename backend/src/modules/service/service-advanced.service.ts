import { Injectable } from '@nestjs/common';

export interface SLA {
  id: string;
  name: string;
  responseTime: number;
  resolutionTime: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  targetMetric: number;
}

export interface ServiceTicket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: string;
  createdDate: Date;
  slaId: string;
  responseTime?: number;
  resolutionTime?: number;
  responseDeadline: Date;
  resolutionDeadline: Date;
  slaViolated: boolean;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  helpful: number;
  unhelpful: number;
  createdDate: Date;
  updatedDate: Date;
}

@Injectable()
export class ServiceAdvancedService {
  private slas: Map<string, SLA> = new Map();
  private tickets: ServiceTicket[] = [];
  private articles: Map<string, KnowledgeArticle> = new Map();

  createSLA(sla: SLA): SLA {
    this.slas.set(sla.id, sla);
    return sla;
  }

  createTicket(ticket: Omit<ServiceTicket, 'responseDeadline' | 'resolutionDeadline' | 'slaViolated'>): ServiceTicket {
    const sla = this.slas.get(ticket.slaId);
    const now = new Date();

    const newTicket: ServiceTicket = {
      ...ticket,
      responseDeadline: new Date(now.getTime() + (sla?.responseTime || 4) * 60 * 60 * 1000),
      resolutionDeadline: new Date(now.getTime() + (sla?.resolutionTime || 24) * 60 * 60 * 1000),
      slaViolated: false,
    };

    this.tickets.push(newTicket);
    return newTicket;
  }

  checkSLAViolations(): { violated: ServiceTicket[]; atlrisk: ServiceTicket[] } {
    const now = new Date();
    const violated: ServiceTicket[] = [];
    const atlrisk: ServiceTicket[] = [];

    for (const ticket of this.tickets.filter(t => t.status !== 'closed')) {
      if (now > ticket.responseDeadline || now > ticket.resolutionDeadline) {
        ticket.slaViolated = true;
        violated.push(ticket);
      } else if (
        now.getTime() > ticket.responseDeadline.getTime() - 60 * 60 * 1000 ||
        now.getTime() > ticket.resolutionDeadline.getTime() - 4 * 60 * 60 * 1000
      ) {
        atlrisk.push(ticket);
      }
    }

    return { violated, atlrisk };
  }

  createKnowledgeArticle(article: KnowledgeArticle): KnowledgeArticle {
    this.articles.set(article.id, article);
    return article;
  }

  searchArticles(query: string): KnowledgeArticle[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.articles.values()).filter(
      (a) =>
        a.title.toLowerCase().includes(lowerQuery) ||
        a.content.toLowerCase().includes(lowerQuery) ||
        a.tags.some((t) => t.toLowerCase().includes(lowerQuery)),
    );
  }

  getArticlesByCategory(category: string): KnowledgeArticle[] {
    return Array.from(this.articles.values()).filter((a) => a.category === category);
  }

  recordArticleView(articleId: string): KnowledgeArticle | undefined {
    const article = this.articles.get(articleId);
    if (article) {
      article.views++;
    }
    return article;
  }

  rateArticle(articleId: string, helpful: boolean): KnowledgeArticle | undefined {
    const article = this.articles.get(articleId);
    if (article) {
      if (helpful) {
        article.helpful++;
      } else {
        article.unhelpful++;
      }
    }
    return article;
  }
}
