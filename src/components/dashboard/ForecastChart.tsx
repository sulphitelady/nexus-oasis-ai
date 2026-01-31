import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Droplets, Zap, TrendingUp, Clock } from 'lucide-react';
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
  const chartData = forecasts.map(f => ({
    hour: `${f.hour}:00`,
    waterDemand: f.waterDemand,
    electricity: f.electricityConsumption,
    temperature: f.temperature
  }));

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
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
          
          {summary && (
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="font-normal">
                <Droplets className="w-3 h-3 mr-1 text-ocean" />
                Peak: {summary.peakWaterDemand} MG/h at {formatHour(summary.peakWaterHour)}
              </Badge>
              <Badge variant="outline" className="font-normal">
                <Zap className="w-3 h-3 mr-1 text-primary" />
                Peak: {summary.peakElectricityConsumption} GWh at {formatHour(summary.peakElectricityHour)}
              </Badge>
              <Badge variant="secondary" className="font-normal">
                <Clock className="w-3 h-3 mr-1" />
                {summary.averageConfidence}% Confidence
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
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
              
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px hsl(var(--foreground) / 0.1)'
                }}
                labelStyle={{ fontWeight: 600, marginBottom: 4 }}
              />
              
              <Legend 
                verticalAlign="top"
                height={36}
                formatter={(value) => (
                  <span style={{ color: 'hsl(var(--foreground))', fontSize: 12 }}>
                    {value === 'waterDemand' ? 'Water Demand' : 'Electricity'}
                  </span>
                )}
              />
              
              <Area
                yAxisId="water"
                type="monotone"
                dataKey="waterDemand"
                stroke="hsl(210, 79%, 46%)"
                strokeWidth={2}
                fill="url(#waterGradient)"
                name="waterDemand"
              />
              
              <Area
                yAxisId="electricity"
                type="monotone"
                dataKey="electricity"
                stroke="hsl(43, 52%, 54%)"
                strokeWidth={2}
                fill="url(#electricityGradient)"
                name="electricity"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-bold text-ocean">{summary.totalWaterDemand}</p>
              <p className="text-xs text-muted-foreground">Total Water (MG)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{summary.totalElectricityConsumption}</p>
              <p className="text-xs text-muted-foreground">Total Energy (GWh)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-destructive">{summary.maxTemperature}°C</p>
              <p className="text-xs text-muted-foreground">Max Temperature</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{summary.averageConfidence}%</p>
              <p className="text-xs text-muted-foreground">Avg Confidence</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
