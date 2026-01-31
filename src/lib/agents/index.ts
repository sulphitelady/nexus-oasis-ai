// Multi-Agent System for NEXUS-AI
// Exports all agent instances for coordinated decision-making

export { forecastingAgent, ForecastingAgent } from './forecastingAgent';
export { optimizationAgent, OptimizationAgent } from './optimizationAgent';
export { sustainabilityAgent, SustainabilityAgent } from './sustainabilityAgent';

// Re-export types
export type {
  ScenarioType,
  SimulationParams,
  ForecastResult,
  OptimizationRecommendation,
  SustainabilityMetrics
} from '@/data/syntheticData';
