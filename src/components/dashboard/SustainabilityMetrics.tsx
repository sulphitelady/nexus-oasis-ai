import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Leaf, Zap, Droplets, TrendingDown, TrendingUp } from 'lucide-react';
import { type SustainabilityMetrics as SustainabilityMetricsType } from '@/data/syntheticData';

interface SustainabilityMetricsProps {
  metrics: SustainabilityMetricsType;
}

export default function SustainabilityMetrics({ metrics }: SustainabilityMetricsProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Leaf className="h-5 w-5 text-success" />
          Sustainability Impact
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Environmental benefits from optimization
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* CO2 Reduction */}
        <MetricCard
          icon={Leaf}
          iconColor="text-success"
          label="CO₂ Reduction"
          value={metrics.co2ReductionPercent}
          suffix="%"
          detail={`${metrics.co2Reduction} tonnes saved`}
          comparison={{ baseline: metrics.baselineCO2, optimized: metrics.optimizedCO2, unit: 't' }}
          progressColor="bg-success"
        />

        {/* Energy Savings */}
        <MetricCard
          icon={Zap}
          iconColor="text-primary"
          label="Energy Savings"
          value={metrics.energySavedPercent}
          suffix="%"
          detail={`${metrics.energySaved.toFixed(1)} GWh saved`}
          progressColor="bg-primary"
        />

        {/* Water Efficiency */}
        <MetricCard
          icon={Droplets}
          iconColor="text-ocean"
          label="Water Efficiency"
          value={metrics.waterEfficiencyPercent}
          suffix="%"
          detail={`${metrics.waterEfficiency.toFixed(2)} MG/GWh`}
          progressColor="bg-ocean"
          isPositiveIncrease={true}
        />

        {/* Summary */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm">
            <TrendingDown className="h-4 w-4 text-success" />
            <span className="text-muted-foreground">
              Combined optimization reduces environmental impact by
            </span>
            <span className="font-semibold text-success">
              {Math.round((metrics.co2ReductionPercent + metrics.energySavedPercent) / 2)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface MetricCardProps {
  icon: typeof Leaf;
  iconColor: string;
  label: string;
  value: number;
  suffix: string;
  detail: string;
  comparison?: {
    baseline: number;
    optimized: number;
    unit: string;
  };
  progressColor: string;
  isPositiveIncrease?: boolean;
}

function MetricCard({ 
  icon: Icon, 
  iconColor, 
  label, 
  value, 
  suffix, 
  detail,
  comparison,
  progressColor,
  isPositiveIncrease = false
}: MetricCardProps) {
  const displayValue = Math.abs(value);
  const isPositive = isPositiveIncrease ? value > 0 : value > 0;
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
          <span className="font-medium text-foreground">{label}</span>
        </div>
        <div className="flex items-center gap-1">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
          <span className={`text-xl font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
            {isPositiveIncrease ? '+' : ''}{displayValue.toFixed(1)}{suffix}
          </span>
        </div>
      </div>
      
      <Progress 
        value={Math.min(displayValue, 100)} 
        className="h-2"
        indicatorClassName={progressColor}
      />
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{detail}</span>
        {comparison && (
          <span>
            {comparison.baseline.toFixed(1)} → {comparison.optimized.toFixed(1)} {comparison.unit}
          </span>
        )}
      </div>
    </div>
  );
}
