import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, Sparkles, Info, CheckCircle } from 'lucide-react';

interface ExplainabilityPanelProps {
  explanation: string | null;
  isLoading: boolean;
  forecastSummary: {
    averageConfidence: number;
  } | null;
}

export default function ExplainabilityPanel({ 
  explanation, 
  isLoading,
  forecastSummary 
}: ExplainabilityPanelProps) {
  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-accent" />
            AI Decision Explanation
            <Badge variant="outline" className="ml-2 text-xs font-normal">
              <Sparkles className="w-3 h-3 mr-1" />
              Powered by Lovable AI
            </Badge>
          </CardTitle>
          
          {forecastSummary && (
            <Badge variant="secondary" className="font-normal">
              <CheckCircle className="w-3 h-3 mr-1 text-success" />
              {forecastSummary.averageConfidence}% Confidence
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Human-readable explanations for AI recommendations and decisions
        </p>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[95%]" />
            <Skeleton className="h-4 w-[85%]" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[92%]" />
          </div>
        ) : explanation ? (
          <div className="prose prose-sm max-w-none">
            <div className="text-foreground leading-relaxed whitespace-pre-wrap">
              {explanation.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Waiting for simulation results...</p>
          </div>
        )}
        
        {/* Assumptions & Data Sources */}
        {explanation && (
          <div className="mt-6 pt-4 border-t border-border space-y-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Assumptions: </span>
                This analysis assumes current UAE grid emission factors, desalination plant operational capacities, 
                and historical demand patterns. Actual results may vary based on real-time conditions.
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs font-normal">
                UAE Grid Data
              </Badge>
              <Badge variant="outline" className="text-xs font-normal">
                Desalination Plants
              </Badge>
              <Badge variant="outline" className="text-xs font-normal">
                Historical Demand
              </Badge>
              <Badge variant="outline" className="text-xs font-normal">
                Emission Factors
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
