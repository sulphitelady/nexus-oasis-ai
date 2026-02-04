import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { 
  Settings2, 
  Zap, 
  Sun, 
  BarChart3,
  Clock,
  Target,
  TrendingUp,
  Leaf,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
  Gauge,
  Calendar,
  Users
} from 'lucide-react';
import { type OptimizationRecommendation, optimizationStrategies } from '@/data/syntheticData';

interface RecommendationDetailModalProps {
  recommendation: OptimizationRecommendation | null;
  isOpen: boolean;
  onClose: () => void;
  onImplement?: (strategyId: string) => void;
}

const categoryIcons: Record<string, typeof Zap> = {
  operations: Settings2,
  technology: Zap,
  renewable: Sun,
  demand: BarChart3
};

const difficultyConfig: Record<string, { label: string; color: string; progress: number }> = {
  low: { label: 'Easy', color: 'text-success', progress: 25 },
  medium: { label: 'Moderate', color: 'text-warning', progress: 50 },
  high: { label: 'Complex', color: 'text-destructive', progress: 85 }
};

const timeConfig: Record<string, { label: string; description: string }> = {
  immediate: { label: 'Immediate', description: 'Can be implemented within hours' },
  'short-term': { label: '1-3 Months', description: 'Requires planning and resources' },
  'long-term': { label: '6+ Months', description: 'Major infrastructure changes needed' }
};

export default function RecommendationDetailModal({ 
  recommendation, 
  isOpen, 
  onClose,
  onImplement 
}: RecommendationDetailModalProps) {
  if (!recommendation) return null;
  
  const strategy = optimizationStrategies.find(s => s.id === recommendation.strategyId);
  if (!strategy) return null;
  
  const Icon = categoryIcons[strategy.category] || Settings2;
  const difficulty = difficultyConfig[strategy.difficulty];
  const timeline = timeConfig[strategy.timeToImplement];

  // Calculate confidence score based on expected impact
  const confidenceScore = Math.round(
    (recommendation.expectedImpact.co2Reduction * 0.4 + 
     recommendation.expectedImpact.costSavings * 0.3 + 
     recommendation.expectedImpact.efficiencyGain * 0.3) / 3 * 10
  );

  // Risk assessment based on difficulty and impact
  const riskLevel = strategy.difficulty === 'high' 
    ? 'Medium-High' 
    : strategy.difficulty === 'medium' 
      ? 'Low-Medium' 
      : 'Low';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{strategy.name}</DialogTitle>
              <DialogDescription className="mt-1">
                {strategy.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Priority & Category Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={recommendation.priority === 'high' ? 'destructive' : 'secondary'}>
              {recommendation.priority.charAt(0).toUpperCase() + recommendation.priority.slice(1)} Priority
            </Badge>
            <Badge variant="outline" className="capitalize">
              {strategy.category}
            </Badge>
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {confidenceScore}% Confidence
            </Badge>
          </div>

          {/* AI Reasoning */}
          <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-accent" />
              <span className="font-medium text-foreground">AI Reasoning</span>
            </div>
            <p className="text-sm text-muted-foreground">{recommendation.reasoning}</p>
          </div>

          <Separator />

          {/* Impact Metrics */}
          <div>
            <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Expected Impact
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="p-4 rounded-lg bg-success/10 border border-success/20 text-center cursor-help">
                      <Leaf className="h-5 w-5 text-success mx-auto mb-2" />
                      <p className="text-2xl font-bold text-success">
                        -{recommendation.expectedImpact.co2Reduction}%
                      </p>
                      <p className="text-xs text-muted-foreground">CO₂ Reduction</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Estimated annual reduction in carbon emissions</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center cursor-help">
                      <DollarSign className="h-5 w-5 text-primary mx-auto mb-2" />
                      <p className="text-2xl font-bold text-primary">
                        -{recommendation.expectedImpact.costSavings}%
                      </p>
                      <p className="text-xs text-muted-foreground">Cost Savings</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Projected operational cost reduction</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="p-4 rounded-lg bg-ocean/10 border border-ocean/20 text-center cursor-help">
                      <TrendingUp className="h-5 w-5 text-ocean mx-auto mb-2" />
                      <p className="text-2xl font-bold text-ocean">
                        +{recommendation.expectedImpact.efficiencyGain}%
                      </p>
                      <p className="text-xs text-muted-foreground">Efficiency</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Expected improvement in operational efficiency</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <Separator />

          {/* Implementation Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Gauge className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">Difficulty</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${difficulty.color}`}>
                    {difficulty.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{difficulty.progress}%</span>
                </div>
                <Progress value={difficulty.progress} className="h-2" />
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">Timeline</span>
              </div>
              <p className="text-sm font-medium text-foreground">{timeline.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{timeline.description}</p>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="font-medium text-foreground">Risk Assessment</span>
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-warning">{riskLevel} Risk:</span> This strategy has been evaluated 
              for implementation complexity, resource requirements, and potential disruption to operations.
              {strategy.difficulty === 'high' && (
                <span className="block mt-2 text-warning">
                  ⚠️ Consider phased implementation and additional stakeholder review before proceeding.
                </span>
              )}
            </p>
          </div>

          {/* Stakeholders */}
          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">Key Stakeholders</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Operations Team</Badge>
              <Badge variant="secondary">Sustainability Officer</Badge>
              {strategy.category === 'technology' && <Badge variant="secondary">IT Department</Badge>}
              {strategy.category === 'renewable' && <Badge variant="secondary">Energy Manager</Badge>}
              {strategy.difficulty === 'high' && <Badge variant="secondary">Executive Sponsor</Badge>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button 
              className="flex-1 gradient-gold text-primary-foreground"
              onClick={() => {
                onImplement?.(recommendation.strategyId);
                onClose();
              }}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark as Implemented
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
