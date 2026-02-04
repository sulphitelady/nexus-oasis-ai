import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Loader2, 
  CheckCircle, 
  Clock,
  Zap,
  Leaf,
  TrendingUp,
  Sparkles
} from 'lucide-react';

interface AgentStep {
  id: string;
  name: string;
  description: string;
  icon: typeof Brain;
  duration: number; // estimated duration in ms
}

interface SimulationProgressProps {
  isSimulating: boolean;
  useAiria: boolean;
  onComplete?: () => void;
}

const agentSteps: AgentStep[] = [
  {
    id: 'forecasting',
    name: 'Forecasting Agent',
    description: 'Predicting demand patterns...',
    icon: TrendingUp,
    duration: 800
  },
  {
    id: 'optimization',
    name: 'Optimization Agent',
    description: 'Generating recommendations...',
    icon: Zap,
    duration: 1000
  },
  {
    id: 'sustainability',
    name: 'Sustainability Agent',
    description: 'Calculating impact metrics...',
    icon: Leaf,
    duration: 800
  },
  {
    id: 'explainability',
    name: 'Explainability Agent',
    description: 'Preparing insights...',
    icon: Brain,
    duration: 1400
  }
];

export default function SimulationProgress({ 
  isSimulating, 
  useAiria,
  onComplete 
}: SimulationProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const totalDuration = agentSteps.reduce((acc, step) => acc + step.duration, 0);

  useEffect(() => {
    if (isSimulating) {
      setCurrentStep(0);
      setStepProgress(0);
      setElapsedTime(0);
      setStartTime(Date.now());
    } else {
      setStartTime(null);
    }
  }, [isSimulating]);

  useEffect(() => {
    if (!isSimulating || startTime === null) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setElapsedTime(elapsed);

      // Calculate which step we should be on
      let accumulatedTime = 0;
      let newStep = 0;
      let newProgress = 0;

      for (let i = 0; i < agentSteps.length; i++) {
        const step = agentSteps[i];
        if (elapsed < accumulatedTime + step.duration) {
          newStep = i;
          newProgress = ((elapsed - accumulatedTime) / step.duration) * 100;
          break;
        }
        accumulatedTime += step.duration;
        if (i === agentSteps.length - 1) {
          newStep = i;
          newProgress = 100;
        }
      }

      setCurrentStep(newStep);
      setStepProgress(Math.min(newProgress, 100));
    }, 50);

    return () => clearInterval(interval);
  }, [isSimulating, startTime]);

  if (!isSimulating) return null;

  const overallProgress = Math.min((elapsedTime / totalDuration) * 100, 100);
  const estimatedRemaining = Math.max(0, Math.ceil((totalDuration - elapsedTime) / 1000));

  return (
    <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
      <CardContent className="py-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <span className="font-medium text-foreground">
                {useAiria ? 'AIRIA Multi-Agent System' : 'Local Agents'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                ~{estimatedRemaining}s remaining
              </span>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium text-foreground">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>

          {/* Agent Steps */}
          <div className="grid grid-cols-4 gap-2">
            {agentSteps.map((step, index) => {
              const isComplete = index < currentStep;
              const isCurrent = index === currentStep;
              const Icon = step.icon;

              return (
                <div 
                  key={step.id}
                  className={`p-2 rounded-lg text-center transition-all ${
                    isComplete 
                      ? 'bg-success/10 border border-success/30' 
                      : isCurrent 
                        ? 'bg-primary/10 border border-primary/30' 
                        : 'bg-muted/50 border border-border'
                  }`}
                >
                  <div className="flex justify-center mb-1">
                    {isComplete ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : isCurrent ? (
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    ) : (
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-xs font-medium text-foreground truncate">
                    {step.name.split(' ')[0]}
                  </p>
                  {isCurrent && (
                    <div className="mt-1">
                      <Progress value={stepProgress} className="h-1" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Current Step Description */}
          <p className="text-sm text-center text-muted-foreground animate-pulse">
            {agentSteps[currentStep]?.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
