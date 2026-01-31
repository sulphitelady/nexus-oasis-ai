// Sustainability Impact Agent: Calculates environmental and efficiency metrics
// Uses UAE-specific emission factors and efficiency formulas

import {
  emissionFactors,
  desalinationPlants,
  type ForecastResult,
  type OptimizationRecommendation,
  type SustainabilityMetrics
} from '@/data/syntheticData';

/**
 * Sustainability Impact Agent
 * Role: Calculates environmental and efficiency metrics
 * Inputs: Optimization decisions, emission factors
 * Method: UAE-specific emission factors and efficiency formulas
 * Output: CO₂ reduction, energy savings, water efficiency percentages
 */
export class SustainabilityAgent {
  private cache: Map<string, SustainabilityMetrics> = new Map();

  /**
   * Calculate sustainability metrics comparing baseline vs optimized operations
   */
  calculateMetrics(
    forecasts: ForecastResult[],
    recommendations: OptimizationRecommendation[]
  ): SustainabilityMetrics {
    const cacheKey = this.getCacheKey(forecasts, recommendations);
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Calculate baseline emissions and energy
    const baseline = this.calculateBaseline(forecasts);
    
    // Calculate optimized values based on recommendations
    const optimized = this.calculateOptimized(baseline, recommendations);
    
    const metrics: SustainabilityMetrics = {
      baselineCO2: baseline.co2,
      optimizedCO2: optimized.co2,
      co2Reduction: baseline.co2 - optimized.co2,
      co2ReductionPercent: ((baseline.co2 - optimized.co2) / baseline.co2) * 100,
      energySaved: baseline.energy - optimized.energy,
      energySavedPercent: ((baseline.energy - optimized.energy) / baseline.energy) * 100,
      waterEfficiency: optimized.waterEfficiency,
      waterEfficiencyPercent: ((optimized.waterEfficiency - baseline.waterEfficiency) / baseline.waterEfficiency) * 100
    };

    // Round all values for cleaner display
    const roundedMetrics = this.roundMetrics(metrics);
    
    this.cache.set(cacheKey, roundedMetrics);
    return roundedMetrics;
  }

  /**
   * Calculate baseline emissions and energy without optimization
   */
  private calculateBaseline(forecasts: ForecastResult[]) {
    // Total electricity consumption in GWh
    const totalElectricity = forecasts.reduce((sum, f) => sum + f.electricityConsumption, 0);
    
    // Total water demand in million gallons
    const totalWater = forecasts.reduce((sum, f) => sum + f.waterDemand, 0);
    
    // Convert to cubic meters (1 gallon = 0.00378541 cubic meters)
    const totalWaterCubicMeters = totalWater * 1000000 * 0.00378541;
    
    // Calculate average plant mix emissions
    const avgEmissionFactor = this.calculateAverageEmissionFactor();
    
    // CO2 emissions in tonnes
    // Grid electricity: kWh * emission factor
    const gridCO2 = totalElectricity * 1000 * emissionFactors.gridElectricity;
    // Desalination process emissions
    const desalCO2 = totalWaterCubicMeters * avgEmissionFactor / 1000;
    
    const totalCO2 = (gridCO2 + desalCO2) / 1000; // Convert to tonnes
    
    // Current water efficiency (water output / energy input)
    const waterEfficiency = totalWater / totalElectricity; // MG per GWh

    return {
      co2: totalCO2,
      energy: totalElectricity,
      water: totalWater,
      waterEfficiency
    };
  }

  /**
   * Calculate optimized values based on recommendations
   */
  private calculateOptimized(
    baseline: ReturnType<typeof this.calculateBaseline>,
    recommendations: OptimizationRecommendation[]
  ) {
    // Sum up percentage reductions from all recommendations
    let totalCO2ReductionPercent = 0;
    let totalEnergyReductionPercent = 0;
    let totalEfficiencyGainPercent = 0;

    // Apply diminishing returns for stacking strategies
    recommendations.forEach((rec, index) => {
      const diminishingFactor = Math.pow(0.85, index);
      totalCO2ReductionPercent += rec.expectedImpact.co2Reduction * diminishingFactor;
      totalEnergyReductionPercent += rec.expectedImpact.costSavings * 0.7 * diminishingFactor; // Cost correlates ~70% with energy
      totalEfficiencyGainPercent += rec.expectedImpact.efficiencyGain * diminishingFactor;
    });

    // Cap maximum reductions at realistic levels
    totalCO2ReductionPercent = Math.min(totalCO2ReductionPercent, 45);
    totalEnergyReductionPercent = Math.min(totalEnergyReductionPercent, 35);
    totalEfficiencyGainPercent = Math.min(totalEfficiencyGainPercent, 30);

    return {
      co2: baseline.co2 * (1 - totalCO2ReductionPercent / 100),
      energy: baseline.energy * (1 - totalEnergyReductionPercent / 100),
      waterEfficiency: baseline.waterEfficiency * (1 + totalEfficiencyGainPercent / 100)
    };
  }

  /**
   * Calculate weighted average emission factor based on plant mix
   */
  private calculateAverageEmissionFactor(): number {
    let totalCapacity = 0;
    let weightedEmissions = 0;

    for (const plant of desalinationPlants) {
      const effectiveCapacity = plant.capacity * plant.currentOutput;
      totalCapacity += effectiveCapacity;

      let plantEmissionFactor: number;
      if (plant.technology.includes('Reverse Osmosis')) {
        plantEmissionFactor = emissionFactors.desalinationRO;
      } else if (plant.technology.includes('Hybrid')) {
        plantEmissionFactor = emissionFactors.desalinationHybrid;
      } else {
        plantEmissionFactor = emissionFactors.desalinationMSF;
      }

      weightedEmissions += effectiveCapacity * plantEmissionFactor;
    }

    return weightedEmissions / totalCapacity;
  }

  /**
   * Get detailed breakdown of emissions by source
   */
  getEmissionsBreakdown(forecasts: ForecastResult[]) {
    const totalElectricity = forecasts.reduce((sum, f) => sum + f.electricityConsumption, 0);
    const totalWater = forecasts.reduce((sum, f) => sum + f.waterDemand, 0);
    const totalWaterCubicMeters = totalWater * 1000000 * 0.00378541;

    const gridEmissions = (totalElectricity * 1000 * emissionFactors.gridElectricity) / 1000;
    
    // Breakdown by plant technology
    const msfEmissions = (totalWaterCubicMeters * 0.4 * emissionFactors.desalinationMSF) / 1000;
    const roEmissions = (totalWaterCubicMeters * 0.35 * emissionFactors.desalinationRO) / 1000;
    const hybridEmissions = (totalWaterCubicMeters * 0.25 * emissionFactors.desalinationHybrid) / 1000;

    return {
      gridElectricity: { value: gridEmissions, percent: 0 },
      msfDesalination: { value: msfEmissions, percent: 0 },
      roDesalination: { value: roEmissions, percent: 0 },
      hybridDesalination: { value: hybridEmissions, percent: 0 },
      total: gridEmissions + msfEmissions + roEmissions + hybridEmissions
    };
  }

  /**
   * Calculate potential future savings with full optimization
   */
  getOptimizationPotential() {
    return {
      solarIntegration: Math.round(emissionFactors.solarPotential * 100),
      operationalEfficiency: Math.round(emissionFactors.efficiencyPotential * 100),
      roConversion: Math.round((1 - emissionFactors.desalinationRO / emissionFactors.desalinationMSF) * 100),
      renewableGrid: Math.round((1 - emissionFactors.renewableOffset) * emissionFactors.uaeGridAverage / emissionFactors.uaeGridAverage * 30)
    };
  }

  /**
   * Round all metrics for display
   */
  private roundMetrics(metrics: SustainabilityMetrics): SustainabilityMetrics {
    return {
      baselineCO2: Math.round(metrics.baselineCO2 * 10) / 10,
      optimizedCO2: Math.round(metrics.optimizedCO2 * 10) / 10,
      co2Reduction: Math.round(metrics.co2Reduction * 10) / 10,
      co2ReductionPercent: Math.round(metrics.co2ReductionPercent * 10) / 10,
      energySaved: Math.round(metrics.energySaved * 100) / 100,
      energySavedPercent: Math.round(metrics.energySavedPercent * 10) / 10,
      waterEfficiency: Math.round(metrics.waterEfficiency * 100) / 100,
      waterEfficiencyPercent: Math.round(metrics.waterEfficiencyPercent * 10) / 10
    };
  }

  private getCacheKey(
    forecasts: ForecastResult[],
    recommendations: OptimizationRecommendation[]
  ): string {
    const forecastSum = forecasts.reduce((sum, f) => sum + f.waterDemand + f.electricityConsumption, 0);
    const recIds = recommendations.map(r => r.strategyId).join(',');
    return `${forecastSum.toFixed(0)}-${recIds}`;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const sustainabilityAgent = new SustainabilityAgent();
