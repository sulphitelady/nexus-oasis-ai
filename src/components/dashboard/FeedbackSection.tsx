import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  MessageSquare, 
  Star, 
  Send, 
  ThumbsUp, 
  ThumbsDown,
  Smile,
  Meh,
  Frown,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FeedbackSectionProps {
  context?: 'simulation' | 'recommendation' | 'general';
}

export default function FeedbackSection({ context = 'general' }: FeedbackSectionProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [feedbackType, setFeedbackType] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feedbackTypes = [
    { value: 'accuracy', label: 'Prediction Accuracy', icon: '🎯' },
    { value: 'recommendations', label: 'Recommendations Quality', icon: '💡' },
    { value: 'usability', label: 'Ease of Use', icon: '✨' },
    { value: 'performance', label: 'Performance/Speed', icon: '⚡' },
    { value: 'feature', label: 'Feature Request', icon: '🚀' },
    { value: 'bug', label: 'Report an Issue', icon: '🐛' },
  ];

  const handleSubmit = async () => {
    if (!rating || !feedbackType) {
      toast({
        title: "Please complete the feedback",
        description: "Select a rating and feedback type to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Store feedback locally
    const feedback = {
      id: Date.now(),
      rating,
      type: feedbackType,
      message,
      context,
      timestamp: new Date().toISOString()
    };

    const existingFeedback = JSON.parse(localStorage.getItem('nexus-feedback') || '[]');
    localStorage.setItem('nexus-feedback', JSON.stringify([...existingFeedback, feedback]));

    setIsSubmitted(true);
    setIsSubmitting(false);

    toast({
      title: "Thank you for your feedback! 🙏",
      description: "Your input helps us improve NEXUS-AI for everyone.",
    });
  };

  const handleReset = () => {
    setRating(null);
    setFeedbackType('');
    setMessage('');
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <Card className="border-success/20 bg-success/5">
        <CardContent className="py-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Feedback Submitted!
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              We appreciate you taking the time to help us improve.
            </p>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Submit More Feedback
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="p-2 rounded-lg bg-accent/10">
            <MessageSquare className="h-5 w-5 text-accent" />
          </div>
          <div>
            <span className="block">Share Your Feedback</span>
            <span className="text-xs font-normal text-muted-foreground">
              Help us improve NEXUS-AI
            </span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Rating */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            How would you rate your experience?
          </label>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => setRating(value)}
                className={`p-2 rounded-lg transition-all ${
                  rating === value 
                    ? 'bg-primary/20 ring-2 ring-primary scale-110' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <Star 
                  className={`h-6 w-6 ${
                    rating && value <= rating 
                      ? 'text-primary fill-primary' 
                      : 'text-muted-foreground'
                  }`} 
                />
              </button>
            ))}
          </div>
          <div className="flex justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Frown className="h-3 w-3" /> Poor
            </span>
            <span className="flex items-center gap-1">
              <Meh className="h-3 w-3" /> Average
            </span>
            <span className="flex items-center gap-1">
              <Smile className="h-3 w-3" /> Excellent
            </span>
          </div>
        </div>

        {/* Feedback Type */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            What's your feedback about?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {feedbackTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setFeedbackType(type.value)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  feedbackType === type.value 
                    ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <span className="text-lg">{type.icon}</span>
                <p className="text-xs font-medium text-foreground mt-1">{type.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Additional Comments (Optional)
          </label>
          <Textarea
            placeholder="Share your thoughts, suggestions, or report any issues you've encountered..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {message.length}/500 characters
          </p>
        </div>

        {/* Submit */}
        <Button 
          className="w-full gradient-gold text-primary-foreground"
          onClick={handleSubmit}
          disabled={isSubmitting || !rating || !feedbackType}
        >
          {isSubmitting ? (
            <>
              <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Feedback
            </>
          )}
        </Button>

        {/* Privacy note */}
        <p className="text-xs text-muted-foreground text-center">
          Your feedback is anonymous and helps us improve the platform.
        </p>
      </CardContent>
    </Card>
  );
}
