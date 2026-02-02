import { Injectable } from '@nestjs/common';

export interface Territory {
  id: string;
  name: string;
  region: string;
  salesRep: string;
  activeAccounts: number;
  potentialAccounts: number;
  revenueQuota: number;
  yearToDateRevenue: number;
  accounts: string[];
}

export interface TerritoryPerformance {
  territoryId: string;
  quotaAchievement: number;
  accountGrowth: number;
  conversionRate: number;
  accountRetention: number;
  averageDealSize: number;
  salesPipeline: number;
}

@Injectable()
export class TerritoryManagementService {
  private territories: Map<string, Territory> = new Map();
  private accountTerritoryMap: Map<string, string> = new Map();

  createTerritory(territory: Territory): Territory {
    this.territories.set(territory.id, territory);
    return territory;
  }

  assignAccountToTerritory(accountId: string, territoryId: string): boolean {
    const territory = this.territories.get(territoryId);
    if (!territory) return false;

    territory.accounts.push(accountId);
    territory.activeAccounts++;
    this.accountTerritoryMap.set(accountId, territoryId);
    return true;
  }

  reassignTerritory(fromTerritoryId: string, toTerritoryId: string, accountIds: string[]): {
    success: boolean;
    reassignedCount: number;
  } {
    const fromTerritory = this.territories.get(fromTerritoryId);
    const toTerritory = this.territories.get(toTerritoryId);

    if (!fromTerritory || !toTerritory) {
      return { success: false, reassignedCount: 0 };
    }

    let reassignedCount = 0;

    for (const accountId of accountIds) {
      const index = fromTerritory.accounts.indexOf(accountId);
      if (index > -1) {
        fromTerritory.accounts.splice(index, 1);
        toTerritory.accounts.push(accountId);
        this.accountTerritoryMap.set(accountId, toTerritoryId);
        reassignedCount++;
      }
    }

    fromTerritory.activeAccounts = Math.max(0, fromTerritory.activeAccounts - reassignedCount);
    toTerritory.activeAccounts += reassignedCount;

    return { success: true, reassignedCount };
  }

  getPerformance(territoryId: string): TerritoryPerformance {
    const territory = this.territories.get(territoryId);

    if (!territory) {
      return {
        territoryId,
        quotaAchievement: 0,
        accountGrowth: 0,
        conversionRate: 0,
        accountRetention: 0,
        averageDealSize: 0,
        salesPipeline: 0,
      };
    }

    return {
      territoryId,
      quotaAchievement: (territory.yearToDateRevenue / territory.revenueQuota) * 100,
      accountGrowth: ((territory.activeAccounts + territory.potentialAccounts) / territory.activeAccounts) * 100 - 100,
      conversionRate: (territory.activeAccounts / (territory.activeAccounts + territory.potentialAccounts)) * 100,
      accountRetention: 95,
      averageDealSize: territory.yearToDateRevenue / territory.activeAccounts,
      salesPipeline: territory.potentialAccounts * 50000,
    };
  }

  optimizeTerritories(): { recommendations: string[] } {
    const territories = Array.from(this.territories.values());
    const recommendations: string[] = [];

    const avgQuotaAchievement = territories.reduce((sum, t) => sum + (t.yearToDateRevenue / t.revenueQuota), 0) / territories.length;

    for (const territory of territories) {
      const achievement = territory.yearToDateRevenue / territory.revenueQuota;
      if (achievement < avgQuotaAchievement * 0.75) {
        recommendations.push(`Increase resources for ${territory.name} territory`);
      }
      if (territory.potentialAccounts > territory.activeAccounts * 2) {
        recommendations.push(`Focus conversion efforts in ${territory.name} territory`);
      }
    }

    return { recommendations };
  }
}
