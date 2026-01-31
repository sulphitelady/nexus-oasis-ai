// Optimization Agent: Recommends operational strategies
// Uses rule-based optimization with efficiency calculations

import {
  desalinationPlants,
  optimizationStrategies,
  scenarioModifiers,
  type ScenarioType,
  type ForecastResult,
  type OptimizationRecommendation
} from '@/data/syntheticData';

/**
 * Optimization Agent
 * Role: Recommends operational strategies for desalination and energy usage
 * Inputs: Forecasted demand, current capacity, constraints
 * Method: Rule-based optimization with efficiency calculations
 * Output: Prioritized list of operational recommendations
 */
export class OptimizationAgent {
  private cache: Map<string, OptimizationRecommendation[]> = new Map();

  /**
   * Generate optimization recommendations based on forecast
   */
  generateRecommendations(
    forecasts: ForecastResult[],
    scenario: ScenarioType
  ): OptimizationRecommendation[] {
    const cacheKey = this.getCacheKey(forecasts, scenario);
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const recommendations: OptimizationRecommendation[] = [];
    const scenarioConfig = scenarioModifiers[scenario];
    
    // Analyze forecast patterns
    const analysis = this.analyzeForecast(forecasts);
    
    // Apply optimization rules
    for (const strategy of optimizationStrategies) {
      const recommendation = this.evaluateStrategy(strategy, analysis, scenario);
      if (recommendation) {
        recommendations.push(recommendation);
      }
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // Cache results
    this.cache.set(cacheKey, recommendations);
    
    return recommendations.slice(0, 5); // Top 5 recommendations
  }

  /**
   * Analyze forecast patterns to identify optimization opportunities
   */
  private analyzeForecast(forecasts: ForecastResult[]) {
    const peakHours = forecasts
      .filter(f => f.electricityConsumption > 24)
      .map(f => f.hour);
    
    const offPeakHours = forecasts
      .filter(f => f.electricityConsumption < 14)
      .map(f => f.hour);
    
    const avgDemand = forecasts.reduce((sum, f) => sum + f.waterDemand, 0) / 24;
    const avgElectricity = forecasts.reduce((sum, f) => sum + f.electricityConsumption, 0) / 24;
    const peakToAvgRatio = Math.max(...forecasts.map(f => f.electricityConsumption)) / avgElectricity;
    
    const highTempHours = forecasts.filter(f => f.temperature > 45).length;
    
    return {
      peakHours,
      offPeakHours,
      avgDemand,
      avgElectricity,
      peakToAvgRatio,
      highTempHours,
      hasMorningPeak: peakHours.some(h => h >= 9 && h <= 12),
      hasAfternoonPeak: peakHours.some(h => h >= 13 && h <= 17),
      hasEveningPeak: peakHours.some(h => h >= 18 && h <= 21)
    };
  }

  /**
   * Evaluate a strategy against current conditions
   */
  private evaluateStrategy(
    strategy: typeof optimizationStrategies[0],
    analysis: ReturnType<typeof this.analyzeForecast>,
    scenario: ScenarioType
  ): OptimizationRecommendation | null {
    let priority: 'high' | 'medium' | 'low' = 'low';
    let applicability = 0;
    let reasoning = '';

    switch (strategy.id) {
      case 'peak-shift':
        if (analysis.peakToAvgRatio > 1.5 && analysis.offPeakHours.length >= 6) {
          priority = 'high';
          applicability = 0.9;
          reasoning = `Significant peak-to-average ratio of ${analysis.peakToAvgRatio.toFixed(1)}x detected. ${analysis.offPeakHours.length} off-peak hours available for load shifting.`;
        } else if (analysis.peakToAvgRatio > 1.3) {
          priority = 'medium';
          applicability = 0.7;
          reasoning = `Moderate demand variation detected. Load shifting during ${analysis.offPeakHours.slice(0, 3).join(', ')}:00 hours recommended.`;
        } else {
          return null;
        }
        break;

      case 'ro-priority':
        const roPlants = desalinationPlants.filter(p => p.technology.includes('Osmosis'));
        const roCapacity = roPlants.reduce((sum, p) => sum + p.capacity * p.currentOutput, 0);
        if (scenario === 'heatwave' || scenario === 'future2030') {
          priority = 'high';
          applicability = 0.95;
          reasoning = `Under ${scenarioModifiers[scenario].name} conditions, prioritizing Taweelah RO plant (${roPlants[0]?.efficiency * 100}% efficiency) reduces energy consumption by 20%.`;
        } else {
          priority = 'medium';
          applicability = 0.75;
          reasoning = `RO plants offer 2.8 kWh/m³ vs MSF's 3.5 kWh/m³. Current RO capacity: ${Math.round(roCapacity)} MGD.`;
        }
        break;

      case 'solar-integration':
        if (analysis.highTempHours > 6) {
          priority = scenario === 'heatwave' ? 'high' : 'medium';
          applicability = 0.85;
          reasoning = `${analysis.highTempHours} hours of high solar irradiance detected. Peak generation aligns with ${analysis.hasMorningPeak ? 'morning' : 'afternoon'} demand peaks.`;
        } else {
          priority = 'low';
          applicability = 0.6;
          reasoning = 'Standard solar potential. Integration beneficial for long-term sustainability goals.';
        }
        break;

      case 'demand-response':
        if (scenario === 'tourism' || scenario === 'heatwave') {
          priority = 'high';
          applicability = 0.88;
          reasoning = `${scenarioModifiers[scenario].name} scenario requires coordinated demand response. Industrial consumers can shift ${Math.round(analysis.avgDemand * 0.08)} MG/h.`;
        } else {
          priority = 'low';
          applicability = 0.5;
          reasoning = 'Standard demand patterns. Maintain baseline demand response agreements.';
        }
        break;

      case 'storage-optimization':
        if (analysis.peakToAvgRatio > 1.4) {
          priority = 'medium';
          applicability = 0.8;
          reasoning = `Reservoir pre-filling during ${analysis.offPeakHours.slice(0, 4).join(', ')}:00 can smooth peak demand by 15%.`;
        } else {
          priority = 'low';
          applicability = 0.55;
          reasoning = 'Current storage utilization adequate. Monitor for seasonal adjustments.';
        }
        break;

      case 'hybrid-operation':
        if (scenario === 'future2030') {
          priority = 'high';
          applicability = 0.92;
          reasoning = 'Future demand projections require dynamic MSF/RO switching. Fujairah hybrid plant can serve as model.';
        } else if (analysis.peakToAvgRatio > 1.3) {
          priority = 'medium';
          applicability = 0.72;
          reasoning = 'Variable demand justifies hybrid scheduling. Switch to RO during grid stress periods.';
        } else {
          return null;
        }
        break;

      default:
        return null;
    }

    // Adjust impact based on applicability
    const impactMultiplier = applicability * (scenario === 'future2030' ? 1.2 : 1);

    return {
      strategyId: strategy.id,
      priority,
      expectedImpact: {
        co2Reduction: Math.round(strategy.impactCO2 * impactMultiplier),
        costSavings: Math.round(strategy.impactCost * impactMultiplier),
        efficiencyGain: Math.round(strategy.impactEfficiency * impactMultiplier)
      },
      reasoning
    };
  }

  /**
   * Get the strategy details by ID
   */
  getStrategyDetails(strategyId: string) {
    return optimizationStrategies.find(s => s.id === strategyId);
  }

  /**
   * Calculate total expected impact from selected recommendations
   */
  calculateTotalImpact(recommendations: OptimizationRecommendation[]) {
    // Account for diminishing returns
    let totalCO2 = 0;
    let totalCost = 0;
    let totalEfficiency = 0;

    recommendations.forEach((rec, index) => {
      const diminishingFactor = Math.pow(0.85, index); // 15% diminishing returns per additional strategy
      totalCO2 += rec.expectedImpact.co2Reduction * diminishingFactor;
      totalCost += rec.expectedImpact.costSavings * diminishingFactor;
      totalEfficiency += rec.expectedImpact.efficiencyGain * diminishingFactor;
    });

    return {
      totalCO2Reduction: Math.round(Math.min(totalCO2, 50)), // Cap at 50%
      totalCostSavings: Math.round(Math.min(totalCost, 40)), // Cap at 40%
      totalEfficiencyGain: Math.round(Math.min(totalEfficiency, 35)) // Cap at 35%
    };
  }

  private getCacheKey(forecasts: ForecastResult[], scenario: ScenarioType): string {
    const forecastHash = forecasts.map(f => `${f.hour}:${f.waterDemand.toFixed(0)}`).join('|');
    return `${scenario}-${forecastHash}`;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const optimizationAgent = new OptimizationAgent();
