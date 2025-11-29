import { Injectable } from '@nestjs/common';

export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  effectiveDate: Date;
  source: string;
}

export interface TranslationResult {
  originalAmount: number;
  originalCurrency: string;
  translatedAmount: number;
  targetCurrency: string;
  exchangeRate: number;
  translationDate: Date;
  realizingGain: number;
  unrealizingGain: number;
}

@Injectable()
export class FXTranslationService {
  private exchangeRates: Map<string, ExchangeRate> = new Map();
  private historicalRates: ExchangeRate[] = [];

  setExchangeRate(rate: ExchangeRate): ExchangeRate {
    const key = `${rate.fromCurrency}-${rate.toCurrency}`;
    this.exchangeRates.set(key, rate);
    this.historicalRates.push(rate);
    return rate;
  }

  translateAmount(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    date: Date = new Date(),
  ): TranslationResult {
    const key = `${fromCurrency}-${toCurrency}`;
    const rate = this.exchangeRates.get(key);

    if (!rate) {
      return {
        originalAmount: amount,
        originalCurrency: fromCurrency,
        translatedAmount: amount,
        targetCurrency: toCurrency,
        exchangeRate: 1,
        translationDate: date,
        realizingGain: 0,
        unrealizingGain: 0,
      };
    }

    const translatedAmount = amount * rate.rate;

    return {
      originalAmount: amount,
      originalCurrency: fromCurrency,
      translatedAmount,
      targetCurrency: toCurrency,
      exchangeRate: rate.rate,
      translationDate: date,
      realizingGain: 0,
      unrealizingGain: translatedAmount - amount,
    };
  }

  getHistoricalRate(fromCurrency: string, toCurrency: string, date: Date): ExchangeRate | undefined {
    const key = `${fromCurrency}-${toCurrency}`;
    return this.historicalRates
      .filter((r) => r.fromCurrency === fromCurrency && r.toCurrency === toCurrency)
      .reduce((closest, current) => {
        const currentDiff = Math.abs(current.effectiveDate.getTime() - date.getTime());
        const closestDiff = Math.abs(closest.effectiveDate.getTime() - date.getTime());
        return currentDiff < closestDiff ? current : closest;
      });
  }

  calculateRealizedGain(
    originalRate: number,
    settledRate: number,
    amount: number,
  ): { gain: number; loss: number } {
    const gain = amount * (settledRate - originalRate);
    return {
      gain: gain > 0 ? gain : 0,
      loss: gain < 0 ? Math.abs(gain) : 0,
    };
  }
}
