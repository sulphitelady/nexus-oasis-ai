import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Settings2, 
  Zap, 
  Sun, 
  BarChart3,
  Clock,
  ArrowRight
} from 'lucide-react';
import { type OptimizationRecommendation, optimizationStrategies } from '@/data/syntheticData';

interface RecommendationsPanelProps {
  recommendations: OptimizationRecommendation[];
}

const categoryIcons: Record<string, typeof Zap> = {
  operations: Settings2,
  technology: Zap,
  renewable: Sun,
  demand: BarChart3
};

const priorityColors: Record<string, string> = {
  high: 'bg-destructive/10 text-destructive border-destructive/20',
  medium: 'bg-warning/10 text-warning border-warning/20',
  low: 'bg-muted text-muted-foreground border-border'
};

export default function RecommendationsPanel({ recommendations }: RecommendationsPanelProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-primary" />
          Optimization Recommendations
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          AI-suggested operational strategies
        </p>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {recommendations.map((rec, index) => {
          const strategy = optimizationStrategies.find(s => s.id === rec.strategyId);
          if (!strategy) return null;
          
          const Icon = categoryIcons[strategy.category] || Settings2;
          
          return (
            <div 
              key={rec.strategyId}
              className="p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground truncate">
                      {strategy.name}
                    </h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${priorityColors[rec.priority]}`}
                    >
                      {rec.priority}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {rec.reasoning}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <ImpactBadge 
                      label="CO₂" 
                      value={`-${rec.expectedImpact.co2Reduction}%`} 
                      color="success"
                    />
                    <ImpactBadge 
                      label="Cost" 
                      value={`-${rec.expectedImpact.costSavings}%`} 
                      color="primary"
                    />
                    <ImpactBadge 
                      label="Efficiency" 
                      value={`+${rec.expectedImpact.efficiencyGain}%`} 
                      color="ocean"
                    />
                  </div>
                </div>
                
                <div className="flex-shrink-0 text-sm font-medium text-muted-foreground">
                  #{index + 1}
                </div>
              </div>
              
              {strategy.timeToImplement === 'immediate' && (
                <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2 text-xs text-success">
                  <Clock className="h-3 w-3" />
                  Can be implemented immediately
                </div>
              )}
            </div>
          );
        })}
        
        {recommendations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Settings2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No recommendations available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ImpactBadge({ 
  label, 
  value, 
  color 
}: { 
  label: string; 
  value: string; 
  color: 'success' | 'primary' | 'ocean';
}) {
  const colorClasses = {
    success: 'bg-success/10 text-success',
    primary: 'bg-primary/10 text-primary',
    ocean: 'bg-ocean/10 text-ocean'
  };
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colorClasses[color]}`}>
      {label}: {value}
    </span>
  );
}
