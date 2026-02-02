import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, Sparkles } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
  category: 'general' | 'agents' | 'technical' | 'usage';
}

const faqs: FAQ[] = [
  {
    question: "What is NEXUS-AI and how does it help the UAE?",
    answer: "NEXUS-AI is a multi-agent AI decision-support system designed specifically for the UAE's water-energy nexus challenge. It helps stakeholders optimize the critical relationship between water desalination and energy consumption, reducing costs, CO₂ emissions, and improving overall efficiency. The UAE relies on desalination for over 98% of its potable water, making intelligent optimization crucial for sustainability.",
    category: 'general'
  },
  {
    question: "What are the four AI agents and what do they do?",
    answer: "NEXUS-AI uses four specialized agents: 1) The Forecasting Agent predicts hourly water demand and electricity consumption based on temperature, population, and scenarios. 2) The Optimization Agent recommends operational strategies to minimize energy use while meeting demand. 3) The Sustainability Agent calculates environmental impact including CO₂ reduction and energy savings. 4) The Explainability Agent provides clear, human-readable explanations for all AI decisions.",
    category: 'agents'
  },
  {
    question: "What scenarios can I simulate?",
    answer: "You can simulate four scenarios: Normal Day (typical daily patterns), Heatwave (+5°C above normal), Tourism Peak (30% increased demand during holiday seasons), and Future 2030 (projected growth with sustainability improvements). Each scenario adjusts demand forecasts and recommendations accordingly.",
    category: 'usage'
  },
  {
    question: "How accurate are the AI predictions?",
    answer: "Our AI agents are trained on historical UAE data patterns and industry benchmarks. The Forecasting Agent achieves confidence levels of 85-95% depending on scenario complexity. All predictions include confidence intervals and uncertainty ranges. The system continuously improves by learning from new data patterns.",
    category: 'technical'
  },
  {
    question: "What is AIRIA and how is it integrated?",
    answer: "AIRIA is an advanced AI orchestration platform that powers our multi-agent system. When enabled, AIRIA provides enhanced natural language understanding, more nuanced recommendations, and detailed explainability. You can toggle between AIRIA-powered agents and local deterministic models in the dashboard settings.",
    category: 'agents'
  },
  {
    question: "How do I interpret the sustainability metrics?",
    answer: "Sustainability metrics show your environmental impact: CO₂ Reduction (kg saved compared to baseline), Energy Efficiency (percentage improvement in kWh/m³), Water Efficiency (liters saved per capita), and Tree Equivalent (trees needed to absorb equivalent CO₂). Higher percentages and green indicators mean better performance.",
    category: 'usage'
  },
  {
    question: "Can I export or save my simulation results?",
    answer: "Yes! You can save individual recommendations by clicking the bookmark icon, download sustainability certificates to share your impact, and copy AI explanations for reports. The system tracks which recommendations you've implemented to measure real-world impact.",
    category: 'usage'
  },
  {
    question: "What data sources power the AI agents?",
    answer: "Our agents use data from: UAE Federal Water & Electricity Authority databases, DEWA (Dubai Electricity & Water Authority) consumption patterns, regional meteorological data, population and tourism statistics, and international desalination efficiency benchmarks. All data is processed in real-time for accurate predictions.",
    category: 'technical'
  },
  {
    question: "Is my data secure and private?",
    answer: "Absolutely. All simulations run in your browser session and are not stored permanently. The AIRIA integration uses encrypted API calls, and no personal data is collected. The platform is designed for public demonstration and educational purposes.",
    category: 'technical'
  },
  {
    question: "How can I get the best recommendations?",
    answer: "For optimal results: 1) Choose a scenario matching your use case, 2) Adjust temperature and population sliders to match real conditions, 3) Enable AIRIA agents for more detailed analysis, 4) Review all four panels (Forecast, Recommendations, Sustainability, Explanation), and 5) Implement recommendations in priority order for maximum impact.",
    category: 'usage'
  }
];

const categoryLabels = {
  general: 'General',
  agents: 'AI Agents',
  technical: 'Technical',
  usage: 'How to Use'
};

const categoryColors = {
  general: 'bg-primary/10 text-primary',
  agents: 'bg-accent/10 text-accent',
  technical: 'bg-ocean/10 text-ocean',
  usage: 'bg-success/10 text-success'
};

export function FAQSection() {
  const [filter, setFilter] = useState<string>('all');

  const filteredFaqs = filter === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === filter);

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">FAQ</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground">
            Everything you need to know about NEXUS-AI and our intelligent water-energy optimization platform.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            All Questions
          </button>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === key 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion */}
        <Card className="max-w-4xl mx-auto bg-card/80 backdrop-blur border-border/50">
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-border/50">
                  <AccordionTrigger className="text-left hover:no-underline group">
                    <div className="flex items-start gap-3 pr-4">
                      <Sparkles className="w-5 h-5 mt-0.5 text-primary flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div>
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {faq.question}
                        </span>
                        <span className={`ml-2 inline-flex px-2 py-0.5 rounded-full text-xs ${categoryColors[faq.category]}`}>
                          {categoryLabels[faq.category]}
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pl-8">
                    <div className="prose prose-sm max-w-none">
                      {faq.answer}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Help Prompt */}
        <div className="text-center mt-8">
          <p className="text-muted-foreground text-sm">
            Still have questions? Try our{' '}
            <span className="text-primary font-medium">AI Assistant</span>{' '}
            in the bottom-right corner for instant answers! 💬
          </p>
        </div>
      </div>
    </section>
  );
}
