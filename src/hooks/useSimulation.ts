import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  forecastingAgent,
  optimizationAgent,
  sustainabilityAgent,
  type SimulationParams,
  type ScenarioType,
  type ForecastResult,
  type OptimizationRecommendation,
  type SustainabilityMetrics
} from '@/lib/agents';

interface SimulationState {
  params: SimulationParams;
  forecasts: ForecastResult[] | null;
  recommendations: OptimizationRecommendation[] | null;
  metrics: SustainabilityMetrics | null;
  explanation: string | null;
  isFromCache: boolean;
}

const defaultParams: SimulationParams = {
  scenario: 'normal',
  temperature: 42,
  populationGrowth: 1.4,
  date: new Date()
};

export function useSimulation() {
  const queryClient = useQueryClient();
  const [params, setParams] = useState<SimulationParams>(defaultParams);
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState<Omit<SimulationState, 'params'>>({
    forecasts: null,
    recommendations: null,
    metrics: null,
    explanation: null,
    isFromCache: false
  });

  // Run the simulation with all agents
  const runSimulation = useCallback(async () => {
    setIsSimulating(true);

    try {
      // Check if forecasts are cached
      const isFromCache = forecastingAgent.isCached(params);

      // Agent 1: Forecasting
      const forecasts = forecastingAgent.generateForecast(params);

      // Agent 2: Optimization
      const recommendations = optimizationAgent.generateRecommendations(
        forecasts,
        params.scenario
      );

      // Agent 3: Sustainability
      const metrics = sustainabilityAgent.calculateMetrics(forecasts, recommendations);

      // Update results (explanation will be fetched separately)
      setResults({
        forecasts,
        recommendations,
        metrics,
        explanation: null,
        isFromCache
      });

      // Agent 4: Explainability (async, via edge function)
      fetchExplanation(params, forecasts, recommendations, metrics);

    } catch (error) {
      console.error('Simulation error:', error);
    } finally {
      setIsSimulating(false);
    }
  }, [params]);

  // Fetch AI explanation from edge function
  const fetchExplanation = async (
    simParams: SimulationParams,
    forecasts: ForecastResult[],
    recommendations: OptimizationRecommendation[],
    metrics: SustainabilityMetrics
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('nexus-explain', {
        body: {
          scenario: simParams.scenario,
          temperature: simParams.temperature,
          populationGrowth: simParams.populationGrowth,
          forecastSummary: forecastingAgent.getForecastSummary(forecasts),
          recommendations: recommendations.map(r => ({
            strategy: optimizationAgent.getStrategyDetails(r.strategyId)?.name,
            priority: r.priority,
            reasoning: r.reasoning,
            impact: r.expectedImpact
          })),
          metrics
        }
      });

      if (error) {
        console.error('Explanation error:', error);
        setResults(prev => ({
          ...prev,
          explanation: 'Unable to generate AI explanation at this time. Please try again.'
        }));
        return;
      }

      setResults(prev => ({
        ...prev,
        explanation: data?.explanation || 'No explanation available.'
      }));
    } catch (error) {
      console.error('Explanation fetch error:', error);
      setResults(prev => ({
        ...prev,
        explanation: 'Unable to connect to AI service. The other agents have completed their analysis.'
      }));
    }
  };

  // Update individual parameters
  const updateScenario = useCallback((scenario: ScenarioType) => {
    setParams(prev => ({ ...prev, scenario }));
  }, []);

  const updateTemperature = useCallback((temperature: number) => {
    setParams(prev => ({ ...prev, temperature }));
  }, []);

  const updatePopulationGrowth = useCallback((populationGrowth: number) => {
    setParams(prev => ({ ...prev, populationGrowth }));
  }, []);

  const updateDate = useCallback((date: Date) => {
    setParams(prev => ({ ...prev, date }));
  }, []);

  // Get forecast summary
  const forecastSummary = useMemo(() => {
    if (!results.forecasts) return null;
    return forecastingAgent.getForecastSummary(results.forecasts);
  }, [results.forecasts]);

  // Get total optimization impact
  const totalImpact = useMemo(() => {
    if (!results.recommendations) return null;
    return optimizationAgent.calculateTotalImpact(results.recommendations);
  }, [results.recommendations]);

  // Clear all caches
  const clearCaches = useCallback(() => {
    forecastingAgent.clearCache();
    optimizationAgent.clearCache();
    sustainabilityAgent.clearCache();
  }, []);

  // Reset to default parameters
  const resetParams = useCallback(() => {
    setParams(defaultParams);
    setResults({
      forecasts: null,
      recommendations: null,
      metrics: null,
      explanation: null,
      isFromCache: false
    });
  }, []);

  return {
    // State
    params,
    ...results,
    isSimulating,
    forecastSummary,
    totalImpact,
    
    // Actions
    runSimulation,
    updateScenario,
    updateTemperature,
    updatePopulationGrowth,
    updateDate,
    clearCaches,
    resetParams,
    setParams
  };
}
