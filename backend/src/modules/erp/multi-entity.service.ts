import { Injectable } from '@nestjs/common';

export interface Entity {
  id: string;
  name: string;
  entityType: 'subsidiary' | 'branch' | 'division';
  parentEntity?: string;
  accountingCurrency: string;
  fiscalYearEnd: string;
  consolidationMethod: 'full' | 'equity' | 'proportional';
}

export interface EntityTransaction {
  id: string;
  entityId: string;
  date: Date;
  description: string;
  amount: number;
  currency: string;
}

export interface ConsolidationResult {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  eliminatedTransactions: EntityTransaction[];
  consolidatedBalance: Record<string, number>;
}

@Injectable()
export class MultiEntityService {
  private entities: Map<string, Entity> = new Map();
  private entityTransactions: EntityTransaction[] = [];

  createEntity(entity: Entity): Entity {
    this.entities.set(entity.id, entity);
    return entity;
  }

  recordTransaction(transaction: EntityTransaction): EntityTransaction {
    this.entityTransactions.push(transaction);
    return transaction;
  }

  getEntityChain(entityId: string): Entity[] {
    const chain: Entity[] = [];
    let current = this.entities.get(entityId);

    while (current) {
      chain.push(current);
      current = current.parentEntity ? this.entities.get(current.parentEntity) : undefined;
    }

    return chain;
  }

  consolidate(parentEntityId: string): ConsolidationResult {
    const parentEntity = this.entities.get(parentEntityId);
    if (!parentEntity) {
      return {
        totalAssets: 0,
        totalLiabilities: 0,
        totalEquity: 0,
        eliminatedTransactions: [],
        consolidatedBalance: {},
      };
    }

    const childEntities = Array.from(this.entities.values()).filter(
      (e) => e.parentEntity === parentEntityId,
    );
    const allEntities = [parentEntity, ...childEntities];

    let totalAssets = 0,
      totalLiabilities = 0,
      totalEquity = 0;
    const consolidatedBalance: Record<string, number> = {};
    const eliminated: EntityTransaction[] = [];

    // Consolidate transactions
    for (const entity of allEntities) {
      const entityTxs = this.entityTransactions.filter((tx) => tx.entityId === entity.id);
      for (const tx of entityTxs) {
        consolidatedBalance[entity.id] = (consolidatedBalance[entity.id] || 0) + tx.amount;
      }
    }

    // Eliminate intercompany transactions
    for (const entity1 of allEntities) {
      for (const entity2 of allEntities) {
        if (entity1.id !== entity2.id) {
          const intercompanyTxs = this.entityTransactions.filter(
            (tx) =>
              tx.entityId === entity1.id &&
              tx.description.includes(`to ${entity2.id}`),
          );
          eliminated.push(...intercompanyTxs);
        }
      }
    }

    return {
      totalAssets,
      totalLiabilities,
      totalEquity,
      eliminatedTransactions: eliminated,
      consolidatedBalance,
    };
  }
}
