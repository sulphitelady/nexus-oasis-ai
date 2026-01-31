import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Play,
  RefreshCw,
  Droplets,
  Zap,
  Leaf,
  Brain,
  ThermometerSun,
  Users,
  TrendingUp,
  Sun,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useSimulation } from '@/hooks/useSimulation';
import { scenarioModifiers, type ScenarioType } from '@/data/syntheticData';
import ForecastChart from '@/components/dashboard/ForecastChart';
import RecommendationsPanel from '@/components/dashboard/RecommendationsPanel';
import SustainabilityMetrics from '@/components/dashboard/SustainabilityMetrics';
import ExplainabilityPanel from '@/components/dashboard/ExplainabilityPanel';

export default function Dashboard() {
  const {
    params,
    forecasts,
    recommendations,
    metrics,
    explanation,
    isSimulating,
    forecastSummary,
    isFromCache,
    runSimulation,
    updateScenario,
    updateTemperature,
    updatePopulationGrowth,
    resetParams
  } = useSimulation();

  const scenarioIcons: Record<ScenarioType, typeof Sun> = {
    normal: Sun,
    heatwave: ThermometerSun,
    tourism: Users,
    future2030: TrendingUp
  };

  const hasResults = forecasts && recommendations && metrics;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-ocean" />
              <span className="font-display font-semibold text-foreground">NEXUS-AI</span>
              <Zap className="h-5 w-5 text-primary" />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isFromCache && hasResults && (
              <Badge variant="secondary" className="text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Cached
              </Badge>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetParams}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* Left Sidebar - Scenario Controls */}
          <aside className="lg:col-span-3">
            <Card className="sticky top-20">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings2Icon className="h-5 w-5 text-primary" />
                  Scenario Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Scenario Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Scenario Type</label>
                  <Select 
                    value={params.scenario} 
                    onValueChange={(value) => updateScenario(value as ScenarioType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(scenarioModifiers).map(([key, scenario]) => {
                        const Icon = scenarioIcons[key as ScenarioType];
                        return (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {scenario.name}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {scenarioModifiers[params.scenario].description}
                  </p>
                </div>

                <Separator />

                {/* Temperature Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Temperature</label>
                    <span className="text-sm font-mono text-primary">{params.temperature}°C</span>
                  </div>
                  <Slider
                    value={[params.temperature]}
                    onValueChange={([value]) => updateTemperature(value)}
                    min={35}
                    max={55}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>35°C</span>
                    <span>55°C</span>
                  </div>
                </div>

                {/* Population Growth Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Population Growth</label>
                    <span className="text-sm font-mono text-primary">{params.populationGrowth}%</span>
                  </div>
                  <Slider
                    value={[params.populationGrowth]}
                    onValueChange={([value]) => updatePopulationGrowth(value)}
                    min={0}
                    max={5}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>5%</span>
                  </div>
                </div>

                <Separator />

                {/* Run Simulation Button */}
                <Button 
                  className="w-full gradient-gold text-primary-foreground shadow-gold"
                  size="lg"
                  onClick={runSimulation}
                  disabled={isSimulating}
                >
                  {isSimulating ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Running Simulation...
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Run Simulation
                    </>
                  )}
                </Button>

                {/* Agent Status */}
                {hasResults && (
                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Agent Status
                    </p>
                    <div className="space-y-1">
                      <AgentStatus name="Forecasting" status="complete" />
                      <AgentStatus name="Optimization" status="complete" />
                      <AgentStatus name="Sustainability" status="complete" />
                      <AgentStatus 
                        name="Explainability" 
                        status={explanation ? 'complete' : 'loading'} 
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9 space-y-6">
            {!hasResults ? (
              // Empty State
              <Card className="py-16">
                <CardContent className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Play className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Ready to Simulate
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Configure your scenario parameters and click "Run Simulation" to generate 
                    AI-powered forecasts and optimization recommendations.
                  </p>
                  <Button 
                    className="gradient-gold text-primary-foreground shadow-gold"
                    onClick={runSimulation}
                    disabled={isSimulating}
                  >
                    {isSimulating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Run First Simulation
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Forecast Chart */}
                <ForecastChart 
                  forecasts={forecasts} 
                  summary={forecastSummary}
                  scenario={params.scenario}
                />

                {/* Two Column Layout for Recommendations and Sustainability */}
                <div className="grid md:grid-cols-2 gap-6">
                  <RecommendationsPanel 
                    recommendations={recommendations}
                  />
                  <SustainabilityMetrics 
                    metrics={metrics}
                  />
                </div>

                {/* Explainability Panel */}
                <ExplainabilityPanel 
                  explanation={explanation}
                  isLoading={!explanation}
                  forecastSummary={forecastSummary}
                />
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// Agent Status Component
function AgentStatus({ name, status }: { name: string; status: 'complete' | 'loading' | 'error' }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {status === 'complete' && <CheckCircle className="h-4 w-4 text-success" />}
      {status === 'loading' && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
      {status === 'error' && <AlertTriangle className="h-4 w-4 text-destructive" />}
      <span className={status === 'complete' ? 'text-foreground' : 'text-muted-foreground'}>
        {name}
      </span>
    </div>
  );
}

// Settings icon component
function Settings2Icon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M20 7h-9" />
      <path d="M14 17H5" />
      <circle cx="17" cy="17" r="3" />
      <circle cx="7" cy="7" r="3" />
    </svg>
  );
}
