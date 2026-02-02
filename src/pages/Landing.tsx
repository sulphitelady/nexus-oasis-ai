import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Droplets, 
  Zap, 
  Leaf, 
  ChevronDown, 
  ArrowRight,
  ThermometerSun,
  Users,
  TrendingUp,
  Brain,
  BarChart3,
  Settings2
} from 'lucide-react';
import { useState } from 'react';
import { uaeStats } from '@/data/syntheticData';
import { FAQSection } from '@/components/landing/FAQSection';
import { AIChatbot } from '@/components/landing/AIChatbot';

export default function Landing() {
  const [howToUseOpen, setHowToUseOpen] = useState(false);

  const stats = [
    { 
      label: 'Daily Per Capita Consumption', 
      value: `${uaeStats.dailyWaterConsumption}L`,
      subtext: 'Among highest globally',
      icon: Droplets
    },
    { 
      label: 'Water from Desalination', 
      value: `${uaeStats.desalinationPercentage}%`,
      subtext: 'Of total water supply',
      icon: ThermometerSun
    },
    { 
      label: 'Energy for Water Production', 
      value: `${uaeStats.annualEnergyForWater}%`,
      subtext: 'Of national energy use',
      icon: Zap
    },
    { 
      label: 'Annual Demand Growth', 
      value: `${uaeStats.waterDemandGrowth}%`,
      subtext: 'Increasing yearly',
      icon: TrendingUp
    }
  ];

  const agents = [
    {
      name: 'Forecasting Agent',
      description: 'Predicts hourly water demand and electricity consumption using temperature, population, and scenario data.',
      icon: BarChart3,
      color: 'text-ocean'
    },
    {
      name: 'Optimization Agent',
      description: 'Recommends operational strategies to minimize energy use while meeting water demand.',
      icon: Settings2,
      color: 'text-primary'
    },
    {
      name: 'Sustainability Agent',
      description: 'Calculates CO₂ reduction, energy savings, and water efficiency metrics.',
      icon: Leaf,
      color: 'text-success'
    },
    {
      name: 'Explainability Agent',
      description: 'Provides human-readable explanations for all AI decisions using advanced language models.',
      icon: Brain,
      color: 'text-accent'
    }
  ];

  const steps = [
    { step: 1, title: 'Select a Scenario', description: 'Choose from Normal Day, Heatwave, Tourism Peak, or Future 2030' },
    { step: 2, title: 'Adjust Parameters', description: 'Set temperature and population growth factors' },
    { step: 3, title: 'Run Simulation', description: 'Click to generate AI-powered forecasts' },
    { step: 4, title: 'Review Forecasts', description: 'See water and electricity demand predictions' },
    { step: 5, title: 'Explore Recommendations', description: 'View AI-suggested optimizations' },
    { step: 6, title: 'Check Impact', description: 'See sustainability metrics and savings' },
    { step: 7, title: 'Read Explanations', description: 'Understand why the AI made each decision' }
  ];

  return (
    <div className="min-h-screen bg-background pattern-geometric">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
        
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo/Brand */}
            <div className="inline-flex items-center gap-3 mb-8 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Droplets className="w-5 h-5 text-ocean" />
              <span className="text-sm font-medium text-primary">NEXUS-AI</span>
              <Zap className="w-5 h-5 text-primary" />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6 leading-tight">
              Optimizing UAE's{' '}
              <span className="text-primary">Water-Energy</span>{' '}
              Future with AI
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              A multi-agent AI decision-support system that helps stakeholders optimize 
              the critical relationship between water desalination and energy consumption 
              in the United Arab Emirates.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="gradient-gold text-primary-foreground shadow-gold hover:shadow-lg transition-shadow">
                <Link to="/dashboard">
                  Launch Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setHowToUseOpen(!howToUseOpen)}
              >
                How to Use
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${howToUseOpen ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {/* How to Use Guide */}
            <Collapsible open={howToUseOpen} onOpenChange={setHowToUseOpen}>
              <CollapsibleContent className="animate-fade-in">
                <Card className="max-w-3xl mx-auto bg-card/80 backdrop-blur border-primary/20">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Quick Start Guide</h3>
                    <div className="grid sm:grid-cols-2 gap-3 text-left">
                      {steps.map(({ step, title, description }) => (
                        <div key={step} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full gradient-gold flex items-center justify-center text-sm font-bold text-primary-foreground">
                            {step}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{title}</p>
                            <p className="text-sm text-muted-foreground">{description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
              The Water-Energy Challenge
            </h2>
            <p className="text-muted-foreground">
              The UAE relies on desalination for over 98% of its potable water, making it one of the 
              most energy-intensive water systems in the world. As demand grows, so does the need 
              for intelligent optimization.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-card hover:shadow-card-hover transition-shadow border-border/50">
                <CardContent className="p-6 text-center">
                  <stat.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                  <p className="text-sm font-medium text-foreground mb-1">{stat.label}</p>
                  <p className="text-xs text-muted-foreground">{stat.subtext}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-Agent Architecture */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
              Multi-Agent AI Architecture
            </h2>
            <p className="text-muted-foreground">
              Four specialized AI agents work together to analyze, optimize, and explain 
              water-energy nexus decisions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {agents.map((agent, index) => (
              <Card 
                key={index} 
                className="bg-card hover:shadow-card-hover transition-all hover:-translate-y-1 border-border/50"
              >
                <CardContent className="p-6">
                  <agent.icon className={`w-10 h-10 mb-4 ${agent.color}`} />
                  <h3 className="font-semibold text-foreground mb-2">{agent.name}</h3>
                  <p className="text-sm text-muted-foreground">{agent.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <section className="py-16 gradient-desert">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
            Ready to Optimize?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Explore interactive scenarios and see how AI-powered optimization can reduce 
            CO₂ emissions and improve water efficiency.
          </p>
          <Button asChild size="lg" className="gradient-gold text-primary-foreground shadow-gold">
            <Link to="/dashboard">
              Launch Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            NEXUS-AI • UAE Water-Energy Nexus Optimization Platform • Hackathon Prototype
          </p>
        </div>
      </footer>

      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  );
}
