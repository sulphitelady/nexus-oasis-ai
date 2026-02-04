import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { 
  Leaf, 
  Zap, 
  Droplets, 
  TrendingDown, 
  TrendingUp, 
  Award,
  Share2,
  Download,
  Info,
  Sparkles,
  Globe,
  Calendar,
  Target
} from 'lucide-react';
import { type SustainabilityMetrics as SustainabilityMetricsType } from '@/data/syntheticData';
import { toast } from '@/hooks/use-toast';
import ShareModal from './ShareModal';

interface SustainabilityMetricsProps {
  metrics: SustainabilityMetricsType;
}

export default function SustainabilityMetrics({ metrics }: SustainabilityMetricsProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [showMonthly, setShowMonthly] = useState(false);
  
  const overallScore = Math.round((metrics.co2ReductionPercent + metrics.energySavedPercent + metrics.waterEfficiencyPercent) / 3);
  
  // Calculate monthly projections
  const monthlyMetrics = {
    co2Reduction: metrics.co2Reduction * 30,
    energySaved: metrics.energySaved * 30,
    treesEquivalent: Math.round(metrics.co2Reduction * 50 * 30)
  };
  
  const getScoreLabel = (score: number) => {
    if (score >= 20) return { label: 'Excellent', color: 'text-success', emoji: '🌟' };
    if (score >= 15) return { label: 'Very Good', color: 'text-success', emoji: '✨' };
    if (score >= 10) return { label: 'Good', color: 'text-primary', emoji: '👍' };
    if (score >= 5) return { label: 'Fair', color: 'text-warning', emoji: '📈' };
    return { label: 'Needs Improvement', color: 'text-muted-foreground', emoji: '🎯' };
  };

  const scoreInfo = getScoreLabel(overallScore);

  const handleShareImpact = () => {
    setShareModalOpen(true);
  };

  const handleDownloadCertificate = () => {
    // Generate certificate content
    const certificate = `
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║              SUSTAINABILITY IMPACT CERTIFICATE                ║
║                        NEXUS-AI                               ║
║                                                               ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  This certifies that the optimization strategies             ║
║  implemented through NEXUS-AI have achieved:                 ║
║                                                               ║
║  🌿 CO₂ Reduction:     ${metrics.co2ReductionPercent.toFixed(1).padStart(6)}% (${metrics.co2Reduction.toFixed(2)} tonnes)      ║
║  ⚡ Energy Savings:    ${metrics.energySavedPercent.toFixed(1).padStart(6)}% (${metrics.energySaved.toFixed(1)} GWh)          ║
║  💧 Water Efficiency:  +${metrics.waterEfficiencyPercent.toFixed(1).padStart(5)}%                            ║
║                                                               ║
║  Overall Impact Score: ${overallScore}% - ${scoreInfo.label.padEnd(15)}            ║
║                                                               ║
║  Equivalent to planting ${Math.round(metrics.co2Reduction * 50)} trees 🌳              ║
║                                                               ║
║  Generated: ${new Date().toLocaleDateString()}                               ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    `.trim();

    const blob = new Blob([certificate], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sustainability-certificate-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Certificate downloaded! 📜",
      description: "Your sustainability impact certificate has been saved.",
    });
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-2 rounded-lg bg-success/10">
                <Globe className="h-5 w-5 text-success" />
              </div>
              <div>
                <span className="block">Sustainability Impact</span>
                <span className="text-xs font-normal text-muted-foreground">
                  Your environmental contribution
                </span>
              </div>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMonthly(!showMonthly)}
                className="text-xs"
              >
                <Calendar className="h-3 w-3 mr-1" />
                {showMonthly ? 'Daily' : 'Monthly'}
              </Button>
              <Badge variant="outline" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                Live data
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Overall Score Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-success/10 to-ocean/10 border border-success/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-success" />
                <span className="font-medium text-foreground">Overall Impact Score</span>
              </div>
              <span className="text-2xl">{scoreInfo.emoji}</span>
            </div>
            <div className="flex items-end gap-3">
              <span className={`text-4xl font-bold ${scoreInfo.color}`}>
                {overallScore}%
              </span>
              <span className={`text-sm font-medium ${scoreInfo.color} mb-1`}>
                {scoreInfo.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Combined improvement across all sustainability metrics
            </p>
            
            {/* Progress breakdown */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <Leaf className="h-3 w-3 text-success" />
                <Progress value={Math.min(metrics.co2ReductionPercent * 3, 100)} className="h-1.5 flex-1" />
                <span className="text-xs text-muted-foreground w-10 text-right">{metrics.co2ReductionPercent.toFixed(0)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-primary" />
                <Progress value={Math.min(metrics.energySavedPercent * 3, 100)} className="h-1.5 flex-1" />
                <span className="text-xs text-muted-foreground w-10 text-right">{metrics.energySavedPercent.toFixed(0)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="h-3 w-3 text-ocean" />
                <Progress value={Math.min(metrics.waterEfficiencyPercent * 3, 100)} className="h-1.5 flex-1" />
                <span className="text-xs text-muted-foreground w-10 text-right">{metrics.waterEfficiencyPercent.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* CO2 Reduction */}
          <MetricCard
            icon={Leaf}
            iconColor="text-success"
            bgColor="bg-success/10"
            label="CO₂ Reduction"
            value={metrics.co2ReductionPercent}
            suffix="%"
            detail={showMonthly 
              ? `${monthlyMetrics.co2Reduction.toFixed(1)} tonnes/month` 
              : `${metrics.co2Reduction} tonnes saved`
            }
            comparison={{ baseline: metrics.baselineCO2, optimized: metrics.optimizedCO2, unit: 't' }}
            progressColor="bg-success"
            tooltip="Carbon dioxide emissions prevented through optimized operations"
          />

          {/* Energy Savings */}
          <MetricCard
            icon={Zap}
            iconColor="text-primary"
            bgColor="bg-primary/10"
            label="Energy Savings"
            value={metrics.energySavedPercent}
            suffix="%"
            detail={showMonthly 
              ? `${monthlyMetrics.energySaved.toFixed(1)} GWh/month`
              : `${metrics.energySaved.toFixed(1)} GWh saved`
            }
            progressColor="bg-primary"
            tooltip="Electricity consumption reduction from smart scheduling"
          />

          {/* Water Efficiency */}
          <MetricCard
            icon={Droplets}
            iconColor="text-ocean"
            bgColor="bg-ocean/10"
            label="Water Efficiency"
            value={metrics.waterEfficiencyPercent}
            suffix="%"
            detail={`${metrics.waterEfficiency.toFixed(2)} MG/GWh`}
            progressColor="bg-ocean"
            isPositiveIncrease={true}
            tooltip="Water produced per unit of energy consumed"
          />

          {/* Summary with actions */}
          <div className="pt-4 border-t border-border space-y-4">
            <div className="flex items-center gap-2 text-sm p-3 rounded-lg bg-success/5 border border-success/20">
              <TrendingDown className="h-5 w-5 text-success flex-shrink-0" />
              <div>
                <span className="text-foreground font-medium">
                  Combined optimization reduces environmental impact by{' '}
                  <span className="text-success font-bold">
                    {Math.round((metrics.co2ReductionPercent + metrics.energySavedPercent) / 2)}%
                  </span>
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Equivalent to planting approximately {showMonthly ? monthlyMetrics.treesEquivalent : Math.round(metrics.co2Reduction * 50)} trees 🌳
                </p>
              </div>
            </div>

            {/* Net Zero Target Progress */}
            <div className="p-3 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium text-foreground">Net Zero 2050 Progress</span>
                </div>
                <span className="text-xs text-muted-foreground">{Math.min(overallScore * 2, 100)}%</span>
              </div>
              <Progress value={Math.min(overallScore * 2, 100)} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Your optimization contributes to UAE's climate goals
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={handleShareImpact}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Impact
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={handleDownloadCertificate}>
                <Download className="h-4 w-4 mr-2" />
                Certificate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="Sustainability Impact Achievement"
        description={`Our optimization has achieved ${metrics.co2ReductionPercent.toFixed(1)}% CO₂ reduction, ${metrics.energySavedPercent.toFixed(1)}% energy savings, and ${metrics.waterEfficiencyPercent.toFixed(1)}% water efficiency improvement.`}
        metrics={{
          co2Reduction: Math.round(metrics.co2ReductionPercent),
          costSavings: Math.round(metrics.energySavedPercent),
          efficiencyGain: Math.round(metrics.waterEfficiencyPercent)
        }}
        type="sustainability"
      />
    </>
  );
}

interface MetricCardProps {
  icon: typeof Leaf;
  iconColor: string;
  bgColor: string;
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
  tooltip: string;
}

function MetricCard({ 
  icon: Icon, 
  iconColor, 
  bgColor,
  label, 
  value, 
  suffix, 
  detail,
  comparison,
  progressColor,
  isPositiveIncrease = false,
  tooltip
}: MetricCardProps) {
  const displayValue = Math.abs(value);
  const isPositive = isPositiveIncrease ? value > 0 : value > 0;
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-help">
                <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
                <span className="font-medium text-foreground">{label}</span>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
      />
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{detail}</span>
        {comparison && (
          <span className="flex items-center gap-1">
            <span className="text-destructive/70">{comparison.baseline.toFixed(1)}</span>
            <span>→</span>
            <span className="text-success">{comparison.optimized.toFixed(1)} {comparison.unit}</span>
          </span>
        )}
      </div>
    </div>
  );
}
