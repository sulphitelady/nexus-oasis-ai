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

// Fast timeout for AIRIA - abort after 4 seconds
const AIRIA_TIMEOUT_MS = 4000;

export function useSimulation() {
  const [params, setParams] = useState<SimulationParams>(defaultParams);
  const [isSimulating, setIsSimulating] = useState(false);
  const [useAiria, setUseAiria] = useState(true);
  const [results, setResults] = useState<Omit<SimulationState, 'params' | 'useAiria'>>({
    forecasts: null,
    recommendations: null,
    metrics: null,
    explanation: null,
    isFromCache: false
  });

  // Optimized: Run simulation with unified AIRIA endpoint (parallel calls)
  const runAiriaSimulation = useCallback(async () => {
    setIsSimulating(true);
    const startTime = Date.now();

    try {
      // Use AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), AIRIA_TIMEOUT_MS);

      console.log('Calling unified AIRIA simulate endpoint...');
      
      // Start local computation in parallel as backup
      const localForecasts = forecastingAgent.generateForecast(params);
      const localRecommendations = optimizationAgent.generateRecommendations(localForecasts, params.scenario);
      const localMetrics = sustainabilityAgent.calculateMetrics(localForecasts, localRecommendations);

      let forecasts: ForecastResult[] = localForecasts;
      let recommendations: OptimizationRecommendation[] = localRecommendations;
      let metrics: SustainabilityMetrics = localMetrics;
      let usedAiria = false;

      try {
        const { data, error } = await supabase.functions.invoke('airia-simulate', {
          body: {
            scenario: params.scenario,
            temperature: params.temperature,
            populationGrowth: params.populationGrowth,
            date: params.date.toISOString()
          }
        });

        clearTimeout(timeoutId);
        
        const elapsed = Date.now() - startTime;
        console.log(`AIRIA response in ${elapsed}ms:`, data?.useFallback ? 'fallback needed' : 'success');

        if (!error && data && !data.useFallback) {
          // Parse AIRIA forecast data
          if (data.forecastData?.forecasts && Array.isArray(data.forecastData.forecasts)) {
            forecasts = data.forecastData.forecasts;
            usedAiria = true;
          } else if (data.forecastData?.result) {
            try {
              const parsed = typeof data.forecastData.result === 'string' 
                ? JSON.parse(data.forecastData.result) 
                : data.forecastData.result;
              if (parsed.forecasts) {
                forecasts = parsed.forecasts;
                usedAiria = true;
              }
            } catch { /* use local */ }
          }

          // Parse AIRIA optimization data
          if (data.optimizeData?.recommendations && Array.isArray(data.optimizeData.recommendations)) {
            recommendations = data.optimizeData.recommendations;
          } else if (data.optimizeData?.result) {
            try {
              const parsed = typeof data.optimizeData.result === 'string' 
                ? JSON.parse(data.optimizeData.result) 
                : data.optimizeData.result;
              if (parsed.recommendations) {
                recommendations = parsed.recommendations;
              }
            } catch { /* use local */ }
          }

          // Parse AIRIA sustainability data
          if (data.sustainData?.metrics) {
            metrics = data.sustainData.metrics;
          } else if (data.sustainData?.result) {
            try {
              const parsed = typeof data.sustainData.result === 'string' 
                ? JSON.parse(data.sustainData.result) 
                : data.sustainData.result;
              if (parsed.metrics) {
                metrics = parsed.metrics;
              }
            } catch { /* use local */ }
          }
        }
      } catch (airiaError) {
        clearTimeout(timeoutId);
        console.warn('AIRIA call failed or timed out, using local agents:', airiaError);
      }

      const totalElapsed = Date.now() - startTime;
      console.log(`Simulation completed in ${totalElapsed}ms (AIRIA: ${usedAiria})`);

      // Update results immediately
      setResults({
        forecasts,
        recommendations,
        metrics,
        explanation: null,
        isFromCache: false
      });

      // Fetch explanation asynchronously (non-blocking)
      fetchAiriaExplanation(params, forecasts, recommendations, metrics);

    } catch (error) {
      console.error('Simulation error:', error);
      // Fallback to pure local
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
