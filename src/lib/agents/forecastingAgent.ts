// Forecasting Agent: Predicts hourly water demand and electricity consumption
// Uses formula-based prediction algorithms with contextual adjustments

import {
  hourlyDemandBaseline,
  scenarioModifiers,
  type ScenarioType,
  type SimulationParams,
  type ForecastResult
} from '@/data/syntheticData';

/**
 * Forecasting Agent
 * Role: Predicts hourly water demand and electricity consumption
 * Inputs: Temperature, population, scenario type, time of day
 * Method: Formula-based prediction algorithms with contextual adjustments
 * Output: Hourly forecasts for the next 24 hours
 */
export class ForecastingAgent {
  private cache: Map<string, ForecastResult[]> = new Map();

  /**
   * Generate 24-hour forecast based on simulation parameters
   */
  generateForecast(params: SimulationParams): ForecastResult[] {
    const cacheKey = this.getCacheKey(params);
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const scenario = scenarioModifiers[params.scenario];
    const forecasts: ForecastResult[] = [];

    for (let hour = 0; hour < 24; hour++) {
      const forecast = this.calculateHourlyForecast(hour, params, scenario);
      forecasts.push(forecast);
    }

    // Cache the result
    this.cache.set(cacheKey, forecasts);
    
    return forecasts;
  }

  /**
   * Calculate forecast for a specific hour
   */
  private calculateHourlyForecast(
    hour: number,
    params: SimulationParams,
    scenario: typeof scenarioModifiers.normal
  ): ForecastResult {
    // Base values from historical data
    const baseWater = hourlyDemandBaseline.waterDemand[hour];
    const baseElectricity = hourlyDemandBaseline.electricityConsumption[hour];
    const baseTemp = hourlyDemandBaseline.temperature[hour];

    // Temperature adjustment (each degree above 40°C increases demand by 2%)
    const tempDelta = params.temperature - 40;
    const tempFactor = 1 + (tempDelta > 0 ? tempDelta * 0.02 : tempDelta * 0.01);

    // Population growth adjustment
    const populationFactor = 1 + (params.populationGrowth / 100);

    // Time-of-day weighting (peak hours have higher confidence)
    const isPeakHour = hour >= 10 && hour <= 18;
    const confidenceBase = isPeakHour ? 0.92 : 0.88;

    // Apply scenario multipliers
    const waterDemand = baseWater * scenario.waterMultiplier * tempFactor * populationFactor;
    const electricityConsumption = baseElectricity * scenario.electricityMultiplier * tempFactor * populationFactor;
    const temperature = baseTemp + scenario.temperatureOffset + (params.temperature - 42);

    // Calculate confidence based on scenario complexity
    const scenarioConfidenceModifier = {
      normal: 0.05,
      heatwave: -0.03,
      tourism: -0.02,
      future2030: -0.08
    };
    
    const confidence = Math.min(0.98, Math.max(0.75, 
      confidenceBase + scenarioConfidenceModifier[params.scenario] + (Math.random() * 0.04 - 0.02)
    ));

    return {
      hour,
      waterDemand: Math.round(waterDemand * 10) / 10,
      electricityConsumption: Math.round(electricityConsumption * 100) / 100,
      temperature: Math.round(temperature),
      confidence: Math.round(confidence * 100) / 100
    };
  }

  /**
   * Get summary statistics from forecast
   */
  getForecastSummary(forecasts: ForecastResult[]) {
    const totalWater = forecasts.reduce((sum, f) => sum + f.waterDemand, 0);
    const totalElectricity = forecasts.reduce((sum, f) => sum + f.electricityConsumption, 0);
    const peakWater = Math.max(...forecasts.map(f => f.waterDemand));
    const peakElectricity = Math.max(...forecasts.map(f => f.electricityConsumption));
    const avgConfidence = forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length;
    const maxTemp = Math.max(...forecasts.map(f => f.temperature));

    return {
      totalWaterDemand: Math.round(totalWater),
      totalElectricityConsumption: Math.round(totalElectricity * 10) / 10,
      peakWaterDemand: Math.round(peakWater * 10) / 10,
      peakElectricityConsumption: Math.round(peakElectricity * 100) / 100,
      averageConfidence: Math.round(avgConfidence * 100),
      maxTemperature: maxTemp,
      peakWaterHour: forecasts.findIndex(f => f.waterDemand === peakWater),
      peakElectricityHour: forecasts.findIndex(f => f.electricityConsumption === peakElectricity)
    };
  }

  /**
   * Generate cache key from parameters
   */
  private getCacheKey(params: SimulationParams): string {
    return `${params.scenario}-${params.temperature}-${params.populationGrowth}-${params.date.toDateString()}`;
  }

  /**
   * Clear the forecast cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Check if result is from cache
   */
  isCached(params: SimulationParams): boolean {
    return this.cache.has(this.getCacheKey(params));
  }
}

// Export singleton instance
export const forecastingAgent = new ForecastingAgent();
