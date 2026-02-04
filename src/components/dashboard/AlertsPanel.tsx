import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  X,
  ThermometerSun,
  Droplets,
  Zap,
  TrendingUp
} from 'lucide-react';
import { type ForecastResult, type SustainabilityMetrics } from '@/data/syntheticData';

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  icon: typeof AlertTriangle;
  timestamp: Date;
  dismissed?: boolean;
}

interface AlertsPanelProps {
  forecasts: ForecastResult[] | null;
  metrics: SustainabilityMetrics | null;
  scenario: string;
}

export default function AlertsPanel({ forecasts, metrics, scenario }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showDismissed, setShowDismissed] = useState(false);

  useEffect(() => {
    const newAlerts: Alert[] = [];

    if (forecasts && forecasts.length > 0) {
      // Check for extreme temperatures
      const maxTemp = Math.max(...forecasts.map(f => f.temperature));
      if (maxTemp > 48) {
        newAlerts.push({
          id: 'extreme-heat',
          type: 'warning',
          title: 'Extreme Heat Warning',
          message: `Peak temperature of ${maxTemp.toFixed(1)}°C detected. Expect increased cooling demand and potential stress on infrastructure.`,
          icon: ThermometerSun,
          timestamp: new Date()
        });
      }

      // Check for peak demand
      const peakWater = Math.max(...forecasts.map(f => f.waterDemand));
      if (peakWater > 100) {
        newAlerts.push({
          id: 'high-water-demand',
          type: 'warning',
          title: 'High Water Demand Alert',
          message: `Peak water demand of ${peakWater.toFixed(0)} MG/h predicted. Consider activating additional desalination capacity.`,
          icon: Droplets,
          timestamp: new Date()
        });
      }

      // Check for peak electricity
      const peakElectricity = Math.max(...forecasts.map(f => f.electricityConsumption));
      if (peakElectricity > 30) {
        newAlerts.push({
          id: 'peak-electricity',
          type: 'warning',
          title: 'Peak Load Warning',
          message: `Electricity consumption expected to reach ${peakElectricity.toFixed(1)} GWh. Recommend load balancing strategies.`,
          icon: Zap,
          timestamp: new Date()
        });
      }

      // Low confidence alerts
      const avgConfidence = forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length;
      if (avgConfidence < 0.85) {
        newAlerts.push({
          id: 'low-confidence',
          type: 'info',
          title: 'Forecast Uncertainty',
          message: `Average prediction confidence is ${(avgConfidence * 100).toFixed(1)}%. Consider additional data sources for validation.`,
          icon: Info,
          timestamp: new Date()
        });
      }
    }

    if (metrics) {
      // Good sustainability metrics
      if (metrics.co2ReductionPercent > 15) {
        newAlerts.push({
          id: 'sustainability-milestone',
          type: 'success',
          title: 'Sustainability Milestone!',
          message: `Your optimization achieves ${metrics.co2ReductionPercent.toFixed(1)}% CO₂ reduction. Excellent progress toward net-zero goals!`,
          icon: CheckCircle2,
          timestamp: new Date()
        });
      }

      // Significant energy savings
      if (metrics.energySavedPercent > 10) {
        newAlerts.push({
          id: 'energy-savings',
          type: 'success',
          title: 'Energy Efficiency Achieved',
          message: `Potential energy savings of ${metrics.energySaved.toFixed(1)} GWh identified. Implementing recommendations could reduce operational costs significantly.`,
          icon: TrendingUp,
          timestamp: new Date()
        });
      }
    }

    // Scenario-specific alerts
    if (scenario === 'heatwave') {
      newAlerts.push({
        id: 'heatwave-scenario',
        type: 'warning',
        title: 'Heatwave Scenario Active',
        message: 'You are simulating extreme heat conditions. All recommendations are optimized for high-temperature operations.',
        icon: ThermometerSun,
        timestamp: new Date()
      });
    }

    setAlerts(newAlerts);
  }, [forecasts, metrics, scenario]);

  const handleDismiss = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, dismissed: true } : a
    ));
  };

  const visibleAlerts = alerts.filter(a => showDismissed || !a.dismissed);
  const dismissedCount = alerts.filter(a => a.dismissed).length;

  if (alerts.length === 0) return null;

  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return 'bg-warning/5 border-warning/30 text-warning';
      case 'success':
        return 'bg-success/5 border-success/30 text-success';
      case 'info':
      default:
        return 'bg-ocean/5 border-ocean/30 text-ocean';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 rounded-lg bg-warning/10">
              <Bell className="h-5 w-5 text-warning" />
            </div>
            <div>
              <span className="block">Alerts & Notifications</span>
              <span className="text-xs font-normal text-muted-foreground">
                {visibleAlerts.length} active alert{visibleAlerts.length !== 1 ? 's' : ''}
              </span>
            </div>
          </CardTitle>
          {dismissedCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowDismissed(!showDismissed)}
            >
              {showDismissed ? 'Hide' : 'Show'} dismissed ({dismissedCount})
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {visibleAlerts.map((alert) => {
          const Icon = alert.icon;
          const styles = getAlertStyles(alert.type);
          
          return (
            <div 
              key={alert.id}
              className={`p-3 rounded-lg border transition-all ${styles} ${
                alert.dismissed ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground text-sm">{alert.title}</h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${styles}`}
                    >
                      {alert.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{alert.message}</p>
                </div>
                {!alert.dismissed && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-6 w-6 flex-shrink-0"
                    onClick={() => handleDismiss(alert.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
