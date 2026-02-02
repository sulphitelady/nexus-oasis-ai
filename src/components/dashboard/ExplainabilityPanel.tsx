import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { 
  Brain, 
  Sparkles, 
  Info, 
  CheckCircle, 
  ChevronDown,
  Copy,
  Download,
  Share2,
  Lightbulb,
  MessageCircle,
  BookOpen,
  Database,
  Cpu,
  Cloud,
  ExternalLink,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface DataSource {
  name: string;
  type: 'agent' | 'database' | 'api' | 'model';
  description: string;
  confidence?: number;
}

interface ExplainabilityPanelProps {
  explanation: string | null;
  isLoading: boolean;
  forecastSummary: {
    averageConfidence: number;
  } | null;
  dataSources?: DataSource[];
  useAiria?: boolean;
}

const defaultDataSources: DataSource[] = [
  {
    name: 'AIRIA Forecasting Agent',
    type: 'agent',
    description: 'Predicted water demand and electricity consumption patterns',
    confidence: 94
  },
  {
    name: 'AIRIA Optimization Agent',
    type: 'agent',
    description: 'Generated operational strategy recommendations',
    confidence: 92
  },
  {
    name: 'AIRIA Sustainability Agent',
    type: 'agent',
    description: 'Calculated environmental impact metrics',
    confidence: 96
  },
  {
    name: 'UAE Grid Emission Database',
    type: 'database',
    description: 'Real-time carbon intensity factors for UAE power grid'
  },
  {
    name: 'Historical Demand Patterns',
    type: 'database',
    description: 'Desalination plant operational data from 2020-2024'
  }
];

export default function ExplainabilityPanel({ 
  explanation, 
  isLoading,
  forecastSummary,
  dataSources = defaultDataSources,
  useAiria = true
}: ExplainabilityPanelProps) {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<'helpful' | 'not-helpful' | null>(null);

  const handleCopyExplanation = () => {
    if (explanation) {
      navigator.clipboard.writeText(explanation);
      toast({
        title: "Copied to clipboard! 📋",
        description: "The explanation has been copied successfully.",
      });
    }
  };

  const handleDownloadReport = () => {
    if (explanation) {
      const blob = new Blob([explanation], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'nexus-ai-analysis.txt';
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: "Report downloaded! 📄",
        description: "Your analysis report has been saved.",
      });
    }
  };

  const handleShare = () => {
    toast({
      title: "Share feature coming soon! 🚀",
      description: "We're working on making it easy to share insights with your team.",
    });
  };

  const handleFeedback = (type: 'helpful' | 'not-helpful') => {
    setFeedbackGiven(type);
    toast({
      title: type === 'helpful' ? "Thank you! 🙏" : "Thanks for the feedback!",
      description: type === 'helpful' 
        ? "We're glad this explanation was useful!" 
        : "We'll use your feedback to improve our explanations.",
    });
  };

  const getSourceIcon = (type: DataSource['type']) => {
    switch (type) {
      case 'agent': return <Cpu className="h-3.5 w-3.5" />;
      case 'database': return <Database className="h-3.5 w-3.5" />;
      case 'api': return <Cloud className="h-3.5 w-3.5" />;
      case 'model': return <Brain className="h-3.5 w-3.5" />;
    }
  };

  const getSourceColor = (type: DataSource['type']) => {
    switch (type) {
      case 'agent': return 'text-accent bg-accent/10 border-accent/20';
      case 'database': return 'text-ocean bg-ocean/10 border-ocean/20';
      case 'api': return 'text-primary bg-primary/10 border-primary/20';
      case 'model': return 'text-success bg-success/10 border-success/20';
    }
  };

  return (
    <Card className="border-primary/20 overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent/10">
              <Brain className="h-5 w-5 text-accent" />
            </div>
            <div>
              <span className="block">AI Decision Explanation</span>
              <span className="text-xs font-normal text-muted-foreground">
                Human-readable insights from our analysis
              </span>
            </div>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {useAiria && (
              <Badge variant="outline" className="text-xs font-normal bg-background">
                <Sparkles className="w-3 h-3 mr-1 text-accent" />
                Powered by AIRIA
              </Badge>
            )}
            {forecastSummary && (
              <Badge variant="secondary" className="font-normal">
                <CheckCircle className="w-3 h-3 mr-1 text-success" />
                {forecastSummary.averageConfidence}% Confidence
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm animate-pulse">
              <Lightbulb className="h-4 w-4" />
              <span>Our AI is analyzing the results and preparing an explanation...</span>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[95%]" />
              <Skeleton className="h-4 w-[85%]" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[92%]" />
            </div>
          </div>
        ) : explanation ? (
          <div className="space-y-6">
            {/* Friendly intro */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-success/5 border border-success/20">
              <MessageCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <div className="text-sm text-foreground">
                <span className="font-medium text-success">Great news! </span>
                We've analyzed your simulation and prepared the following insights to help you make informed decisions.
              </div>
            </div>

            {/* Main explanation */}
            <div className="prose prose-sm max-w-none">
              <div className="text-foreground leading-relaxed">
                {explanation.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={handleCopyExplanation}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadReport}>
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Feedback section */}
            <div className="flex items-center gap-4 pt-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Was this explanation helpful?</span>
              <div className="flex gap-2">
                <Button 
                  variant={feedbackGiven === 'helpful' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => handleFeedback('helpful')}
                  disabled={feedbackGiven !== null}
                  className={feedbackGiven === 'helpful' ? 'bg-success hover:bg-success/90' : ''}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Yes
                </Button>
                <Button 
                  variant={feedbackGiven === 'not-helpful' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => handleFeedback('not-helpful')}
                  disabled={feedbackGiven !== null}
                >
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  Not really
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
              <Brain className="h-8 w-8 opacity-50" />
            </div>
            <p className="font-medium mb-1">Waiting for simulation results...</p>
            <p className="text-sm">Run a simulation to get AI-powered insights</p>
          </div>
        )}
        
        {/* Data Sources & Citations */}
        {explanation && (
          <Collapsible open={sourcesOpen} onOpenChange={setSourcesOpen} className="mt-6">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between py-6 border-t border-border rounded-none -mx-6 px-6" style={{ width: 'calc(100% + 3rem)' }}>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Data Sources & Citations</span>
                  <Badge variant="secondary" className="text-xs">
                    {dataSources.length} sources
                  </Badge>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${sourcesOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-3">
              {dataSources.map((source, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className={`p-1.5 rounded border ${getSourceColor(source.type)}`}>
                    {getSourceIcon(source.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground">{source.name}</span>
                      {source.confidence && (
                        <Badge variant="outline" className="text-xs">
                          {source.confidence}% accuracy
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{source.description}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              
              {/* Assumptions note */}
              <div className="flex items-start gap-2 mt-4 p-3 rounded-lg bg-warning/5 border border-warning/20">
                <Info className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-warning">Important: </span>
                  This analysis assumes current UAE grid emission factors, desalination plant operational capacities, 
                  and historical demand patterns. Actual results may vary based on real-time conditions and policy changes.
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
