import { useState, useCallback, useMemo } from 'react';
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
  useAiria: boolean;
}

const defaultParams: SimulationParams = {
  scenario: 'normal',
  temperature: 42,
  populationGrowth: 1.4,
  date: new Date()
};

export function useSimulation() {
  const [params, setParams] = useState<SimulationParams>(defaultParams);
  const [isSimulating, setIsSimulating] = useState(false);
  const [useAiria, setUseAiria] = useState(true); // Default to using AIRIA
  const [results, setResults] = useState<Omit<SimulationState, 'params' | 'useAiria'>>({
    forecasts: null,
    recommendations: null,
    metrics: null,
    explanation: null,
    isFromCache: false
  });

  // Run simulation with AIRIA agents
  const runAiriaSimulation = useCallback(async () => {
    setIsSimulating(true);

    try {
      // Agent 1: AIRIA Forecasting
      console.log('Calling AIRIA forecast agent...');
      const { data: forecastData, error: forecastError } = await supabase.functions.invoke('airia-forecast', {
        body: {
          scenario: params.scenario,
          temperature: params.temperature,
          populationGrowth: params.populationGrowth,
          date: params.date.toISOString()
        }
      });

      if (forecastError) {
        console.error('AIRIA forecast error:', forecastError);
        throw forecastError;
      }

      // Parse forecast results - use local fallback if AIRIA doesn't return expected format
      let forecasts: ForecastResult[];
      if (forecastData?.forecasts && Array.isArray(forecastData.forecasts)) {
        forecasts = forecastData.forecasts;
      } else if (forecastData?.result) {
        try {
          const parsed = typeof forecastData.result === 'string' ? JSON.parse(forecastData.result) : forecastData.result;
          forecasts = parsed.forecasts || forecastingAgent.generateForecast(params);
        } catch {
          forecasts = forecastingAgent.generateForecast(params);
        }
      } else {
        forecasts = forecastingAgent.generateForecast(params);
      }

      // Agent 2: AIRIA Optimization
      console.log('Calling AIRIA optimization agent...');
      const { data: optimizeData, error: optimizeError } = await supabase.functions.invoke('airia-optimize', {
        body: {
          forecasts,
          scenario: params.scenario,
          temperature: params.temperature
        }
      });

      if (optimizeError) {
        console.error('AIRIA optimization error:', optimizeError);
      }

      // Parse optimization results
      let recommendations: OptimizationRecommendation[];
      if (optimizeData?.recommendations && Array.isArray(optimizeData.recommendations)) {
        recommendations = optimizeData.recommendations;
      } else if (optimizeData?.result) {
        try {
          const parsed = typeof optimizeData.result === 'string' ? JSON.parse(optimizeData.result) : optimizeData.result;
          recommendations = parsed.recommendations || optimizationAgent.generateRecommendations(forecasts, params.scenario);
        } catch {
          recommendations = optimizationAgent.generateRecommendations(forecasts, params.scenario);
        }
      } else {
        recommendations = optimizationAgent.generateRecommendations(forecasts, params.scenario);
      }

      // Agent 3: AIRIA Sustainability
      console.log('Calling AIRIA sustainability agent...');
      const { data: sustainData, error: sustainError } = await supabase.functions.invoke('airia-sustainability', {
        body: {
          forecasts,
          recommendations,
          scenario: params.scenario
        }
      });

      if (sustainError) {
        console.error('AIRIA sustainability error:', sustainError);
      }

      // Parse sustainability results
      let metrics: SustainabilityMetrics;
      if (sustainData?.metrics) {
        metrics = sustainData.metrics;
      } else if (sustainData?.result) {
        try {
          const parsed = typeof sustainData.result === 'string' ? JSON.parse(sustainData.result) : sustainData.result;
          metrics = parsed.metrics || sustainabilityAgent.calculateMetrics(forecasts, recommendations);
        } catch {
          metrics = sustainabilityAgent.calculateMetrics(forecasts, recommendations);
        }
      } else {
        metrics = sustainabilityAgent.calculateMetrics(forecasts, recommendations);
      }

      // Update results
      setResults({
        forecasts,
        recommendations,
        metrics,
        explanation: null,
        isFromCache: false
      });

      // Agent 4: AIRIA Explainability (async)
      fetchAiriaExplanation(params, forecasts, recommendations, metrics);

    } catch (error) {
      console.error('AIRIA simulation error:', error);
      // Fallback to local agents
      runLocalSimulation();
    } finally {
      setIsSimulating(false);
    }
  }, [params]);

  // Run simulation with local agents (fallback)
  const runLocalSimulation = useCallback(async () => {
    setIsSimulating(true);

    try {
      const isFromCache = forecastingAgent.isCached(params);
      const forecasts = forecastingAgent.generateForecast(params);
      const recommendations = optimizationAgent.generateRecommendations(forecasts, params.scenario);
      const metrics = sustainabilityAgent.calculateMetrics(forecasts, recommendations);

      setResults({
        forecasts,
        recommendations,
        metrics,
        explanation: null,
        isFromCache
      });

      // Fetch explanation from local edge function
      fetchLocalExplanation(params, forecasts, recommendations, metrics);

    } catch (error) {
      console.error('Local simulation error:', error);
    } finally {
      setIsSimulating(false);
    }
  }, [params]);

  // Main simulation runner
  const runSimulation = useCallback(async () => {
    if (useAiria) {
      await runAiriaSimulation();
    } else {
      await runLocalSimulation();
    }
  }, [useAiria, runAiriaSimulation, runLocalSimulation]);

  // Fetch AIRIA explanation
  const fetchAiriaExplanation = async (
    simParams: SimulationParams,
    forecasts: ForecastResult[],
    recommendations: OptimizationRecommendation[],
    metrics: SustainabilityMetrics
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('airia-explain', {
        body: {
          scenario: simParams.scenario,
          temperature: simParams.temperature,
          populationGrowth: simParams.populationGrowth,
          forecastSummary: forecastingAgent.getForecastSummary(forecasts),
          recommendations: recommendations.map(r => ({
            strategy: optimizationAgent.getStrategyDetails(r.strategyId)?.name || r.strategyId,
            priority: r.priority,
            reasoning: r.reasoning,
            impact: r.expectedImpact
          })),
          metrics
        }
      });

      if (error) {
        console.error('AIRIA explanation error:', error);
        setResults(prev => ({
          ...prev,
          explanation: 'Unable to generate AI explanation at this time.'
        }));
        return;
      }

      setResults(prev => ({
        ...prev,
        explanation: data?.explanation || 'No explanation available.'
      }));
    } catch (error) {
      console.error('AIRIA explanation fetch error:', error);
      setResults(prev => ({
        ...prev,
        explanation: 'Unable to connect to AIRIA service.'
      }));
    }
  };

  // Fetch local explanation (Lovable AI)
  const fetchLocalExplanation = async (
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
        console.error('Local explanation error:', error);
        setResults(prev => ({
          ...prev,
          explanation: 'Unable to generate AI explanation at this time.'
        }));
        return;
      }

      setResults(prev => ({
        ...prev,
        explanation: data?.explanation || 'No explanation available.'
      }));
    } catch (error) {
      console.error('Local explanation fetch error:', error);
      setResults(prev => ({
        ...prev,
        explanation: 'Unable to connect to AI service.'
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

  // Toggle AIRIA mode
  const toggleAiriaMode = useCallback((enabled: boolean) => {
    setUseAiria(enabled);
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
    useAiria,
    
    // Actions
    runSimulation,
    updateScenario,
    updateTemperature,
    updatePopulationGrowth,
    updateDate,
    clearCaches,
    resetParams,
    setParams,
    toggleAiriaMode
  };
}
