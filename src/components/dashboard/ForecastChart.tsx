import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  Brush
} from 'recharts';
import { Droplets, Zap, TrendingUp, Clock, Info, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { type ForecastResult, type ScenarioType, scenarioModifiers } from '@/data/syntheticData';

interface ForecastChartProps {
  forecasts: ForecastResult[];
  summary: {
    totalWaterDemand: number;
    totalElectricityConsumption: number;
    peakWaterDemand: number;
    peakElectricityConsumption: number;
    averageConfidence: number;
    maxTemperature: number;
    peakWaterHour: number;
    peakElectricityHour: number;
  } | null;
  scenario: ScenarioType;
}

export default function ForecastChart({ forecasts, summary, scenario }: ForecastChartProps) {
  const [showBrush, setShowBrush] = useState(false);
  const [activeDataKey, setActiveDataKey] = useState<string | null>(null);

  const chartData = forecasts.map(f => ({
    hour: `${f.hour}:00`,
    hourNum: f.hour,
    waterDemand: f.waterDemand,
    electricity: f.electricityConsumption,
    temperature: f.temperature,
    confidence: f.confidence * 100
  }));

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  };

  // Find peak hours for reference lines
  const peakWaterHour = summary?.peakWaterHour || 0;
  const peakElectricityHour = summary?.peakElectricityHour || 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-ocean">
                <Droplets className="h-3 w-3" />
                Water Demand
              </span>
              <span className="font-medium">{data.waterDemand.toFixed(1)} MG/h</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-primary">
                <Zap className="h-3 w-3" />
                Electricity
              </span>
              <span className="font-medium">{data.electricity.toFixed(1)} GWh</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Temperature</span>
              <span className="font-medium text-destructive">{data.temperature.toFixed(1)}°C</span>
            </div>
            <div className="flex items-center justify-between text-sm pt-1 border-t border-border mt-1">
              <span className="text-muted-foreground">Confidence</span>
              <span className="font-medium text-success">{data.confidence.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-ocean" />
              24-Hour Forecast
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {scenarioModifiers[scenario].name} scenario predictions
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {summary && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="font-normal cursor-help">
                        <Droplets className="w-3 h-3 mr-1 text-ocean" />
                        Peak: {summary.peakWaterDemand} MG/h
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Peak water demand at {formatHour(summary.peakWaterHour)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="font-normal cursor-help">
                        <Zap className="w-3 h-3 mr-1 text-primary" />
                        Peak: {summary.peakElectricityConsumption} GWh
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Peak electricity at {formatHour(summary.peakElectricityHour)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <Badge variant="secondary" className="font-normal">
                  <Clock className="w-3 h-3 mr-1" />
                  {summary.averageConfidence}% Confidence
                </Badge>
              </>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBrush(!showBrush)}
              className="h-7"
            >
              {showBrush ? <ZoomOut className="h-3.5 w-3.5" /> : <ZoomIn className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: showBrush ? 30 : 0 }}
              onMouseLeave={() => setActiveDataKey(null)}
            >
              <defs>
                <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(210, 79%, 46%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(210, 79%, 46%)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="electricityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(43, 52%, 54%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(43, 52%, 54%)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
                interval={2}
              />
              
              <YAxis 
                yAxisId="water"
                orientation="left"
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                label={{ 
                  value: 'Water (MG/h)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fontSize: 11, fill: 'hsl(210, 79%, 46%)' }
                }}
              />
              
              <YAxis 
                yAxisId="electricity"
                orientation="right"
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                label={{ 
                  value: 'Electricity (GWh)', 
                  angle: 90, 
                  position: 'insideRight',
                  style: { fontSize: 11, fill: 'hsl(43, 52%, 54%)' }
                }}
              />
              
              <RechartsTooltip content={<CustomTooltip />} />
              
              <Legend 
                verticalAlign="top"
                height={36}
                formatter={(value) => (
                  <span style={{ color: 'hsl(var(--foreground))', fontSize: 12 }}>
                    {value === 'waterDemand' ? 'Water Demand' : 'Electricity'}
                  </span>
                )}
                onClick={(e) => setActiveDataKey(activeDataKey === e.dataKey ? null : e.dataKey as string)}
              />

              {/* Peak hour reference lines */}
              <ReferenceLine 
                x={`${peakWaterHour}:00`} 
                yAxisId="water"
                stroke="hsl(210, 79%, 46%)" 
                strokeDasharray="3 3" 
                strokeOpacity={0.5}
              />
              <ReferenceLine 
                x={`${peakElectricityHour}:00`} 
                yAxisId="electricity"
                stroke="hsl(43, 52%, 54%)" 
                strokeDasharray="3 3" 
                strokeOpacity={0.5}
              />
              
              <Area
                yAxisId="water"
                type="monotone"
                dataKey="waterDemand"
                stroke="hsl(210, 79%, 46%)"
                strokeWidth={activeDataKey === 'electricity' ? 1 : 2}
                fill="url(#waterGradient)"
                name="waterDemand"
                opacity={activeDataKey === 'electricity' ? 0.3 : 1}
              />
              
              <Area
                yAxisId="electricity"
                type="monotone"
                dataKey="electricity"
                stroke="hsl(43, 52%, 54%)"
                strokeWidth={activeDataKey === 'waterDemand' ? 1 : 2}
                fill="url(#electricityGradient)"
                name="electricity"
                opacity={activeDataKey === 'waterDemand' ? 0.3 : 1}
              />

              {showBrush && (
                <Brush 
                  dataKey="hour" 
                  height={25} 
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--muted))"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-center cursor-help">
                    <p className="text-2xl font-bold text-ocean">{summary.totalWaterDemand}</p>
                    <p className="text-xs text-muted-foreground">Total Water (MG)</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total water demand for 24-hour period</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-center cursor-help">
                    <p className="text-2xl font-bold text-primary">{summary.totalElectricityConsumption}</p>
                    <p className="text-xs text-muted-foreground">Total Energy (GWh)</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total electricity consumption for 24-hour period</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-center cursor-help">
                    <p className="text-2xl font-bold text-destructive">{summary.maxTemperature}°C</p>
                    <p className="text-xs text-muted-foreground">Max Temperature</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Peak temperature during the forecast period</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-center cursor-help">
                    <p className="text-2xl font-bold text-success">{summary.averageConfidence}%</p>
                    <p className="text-xs text-muted-foreground">Avg Confidence</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Average prediction confidence across all hours</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {/* Chart info */}
        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
          <Info className="h-3 w-3" />
          <span>Click legend items to highlight. Dashed lines indicate peak hours. Use zoom to explore time ranges.</span>
        </div>
      </CardContent>
    </Card>
  );
}
