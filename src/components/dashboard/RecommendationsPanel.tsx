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
  Settings2, 
  Zap, 
  Sun, 
  BarChart3,
  Clock,
  CheckCircle2,
  BookmarkPlus,
  Share2,
  ChevronRight,
  Sparkles,
  Target,
  TrendingUp,
  Info,
  Play
} from 'lucide-react';
import { type OptimizationRecommendation, optimizationStrategies } from '@/data/syntheticData';
import { toast } from '@/hooks/use-toast';

interface RecommendationsPanelProps {
  recommendations: OptimizationRecommendation[];
}

const categoryIcons: Record<string, typeof Zap> = {
  operations: Settings2,
  technology: Zap,
  renewable: Sun,
  demand: BarChart3
};

const priorityConfig: Record<string, { color: string; label: string; bgColor: string }> = {
  high: { 
    color: 'text-destructive', 
    label: 'High Priority',
    bgColor: 'bg-destructive/10 border-destructive/20'
  },
  medium: { 
    color: 'text-warning', 
    label: 'Medium Priority',
    bgColor: 'bg-warning/10 border-warning/20'
  },
  low: { 
    color: 'text-muted-foreground', 
    label: 'Low Priority',
    bgColor: 'bg-muted border-border'
  }
};

export default function RecommendationsPanel({ recommendations }: RecommendationsPanelProps) {
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
  const [implementedItems, setImplementedItems] = useState<Set<string>>(new Set());

  const handleSave = (strategyId: string, strategyName: string) => {
    setSavedItems(prev => {
      const next = new Set(prev);
      if (next.has(strategyId)) {
        next.delete(strategyId);
        toast({
          title: "Removed from saved! 📌",
          description: `"${strategyName}" has been removed from your saved list.`,
        });
      } else {
        next.add(strategyId);
        toast({
          title: "Saved for later! 📌",
          description: `"${strategyName}" has been added to your implementation backlog.`,
        });
      }
      return next;
    });
  };

  const handleMarkImplemented = (strategyId: string, strategyName: string) => {
    setImplementedItems(prev => {
      const next = new Set(prev);
      if (next.has(strategyId)) {
        next.delete(strategyId);
      } else {
        next.add(strategyId);
        toast({
          title: "Great progress! 🎉",
          description: `"${strategyName}" marked as implemented. Keep up the excellent work!`,
        });
      }
      return next;
    });
  };

  const handleViewDetails = (strategyName: string) => {
    toast({
      title: "Detailed view coming soon! 📊",
      description: `We're building an in-depth analysis page for "${strategyName}".`,
    });
  };

  const handleShare = (strategyName: string) => {
    toast({
      title: "Share feature coming soon! 🚀",
      description: `You'll be able to share "${strategyName}" with your team.`,
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="block">Smart Recommendations</span>
              <span className="text-xs font-normal text-muted-foreground">
                AI-optimized strategies for your scenario
              </span>
            </div>
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            {recommendations.length} suggestions
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {recommendations.map((rec, index) => {
          const strategy = optimizationStrategies.find(s => s.id === rec.strategyId);
          if (!strategy) return null;
          
          const Icon = categoryIcons[strategy.category] || Settings2;
          const priority = priorityConfig[rec.priority];
          const isSaved = savedItems.has(rec.strategyId);
          const isImplemented = implementedItems.has(rec.strategyId);
          
          return (
            <div 
              key={rec.strategyId}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                isImplemented 
                  ? 'bg-success/5 border-success/30' 
                  : 'border-border bg-card hover:bg-muted/50 hover:border-primary/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                  isImplemented ? 'bg-success/20' : 'bg-primary/10'
                }`}>
                  {isImplemented ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <Icon className="h-5 w-5 text-primary" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className={`font-medium truncate ${isImplemented ? 'text-success line-through' : 'text-foreground'}`}>
                      {strategy.name}
                    </h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${priority.bgColor} ${priority.color}`}
                    >
                      {priority.label}
                    </Badge>
                    {index === 0 && !isImplemented && (
                      <Badge className="bg-accent text-accent-foreground text-xs">
                        Top Pick
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {rec.reasoning}
                  </p>
                  
                  {/* Impact metrics */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success cursor-help">
                            CO₂: -{rec.expectedImpact.co2Reduction}%
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Estimated carbon emission reduction</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary cursor-help">
                            Cost: -{rec.expectedImpact.costSavings}%
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Projected operational cost savings</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-ocean/10 text-ocean cursor-help">
                            Efficiency: +{rec.expectedImpact.efficiencyGain}%
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Expected efficiency improvement</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button 
                      variant={isImplemented ? 'outline' : 'default'}
                      size="sm" 
                      className={isImplemented ? '' : 'bg-primary/90 hover:bg-primary'}
                      onClick={() => handleMarkImplemented(rec.strategyId, strategy.name)}
                    >
                      {isImplemented ? (
                        <>
                          <TrendingUp className="h-3.5 w-3.5 mr-1" />
                          Undo
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Mark Done
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleSave(rec.strategyId, strategy.name)}
                      className={isSaved ? 'text-accent' : ''}
                    >
                      <BookmarkPlus className={`h-3.5 w-3.5 mr-1 ${isSaved ? 'fill-accent' : ''}`} />
                      {isSaved ? 'Saved' : 'Save'}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewDetails(strategy.name)}
                    >
                      <ChevronRight className="h-3.5 w-3.5 mr-1" />
                      Details
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleShare(strategy.name)}
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex-shrink-0 text-sm font-medium text-muted-foreground">
                  #{index + 1}
                </div>
              </div>
              
              {strategy.timeToImplement === 'immediate' && !isImplemented && (
                <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2 text-xs text-success">
                  <Clock className="h-3 w-3" />
                  <span className="font-medium">Quick win!</span>
                  <span className="text-muted-foreground">Can be implemented immediately</span>
                </div>
              )}
            </div>
          );
        })}
        
        {recommendations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
              <Settings2 className="h-8 w-8 opacity-50" />
            </div>
            <p className="font-medium mb-1">No recommendations yet</p>
            <p className="text-sm">Run a simulation to get personalized suggestions</p>
          </div>
        )}

        {/* Helpful tip */}
        {recommendations.length > 0 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/5 border border-accent/20 mt-4">
            <Info className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-accent">Pro tip: </span>
              Start with high-priority recommendations for maximum impact. 
              You can mark items as done to track your progress!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
