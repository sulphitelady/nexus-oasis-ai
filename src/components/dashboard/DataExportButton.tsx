import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { 
  Download, 
  FileJson, 
  FileText, 
  FileSpreadsheet,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { type ForecastResult, type OptimizationRecommendation, type SustainabilityMetrics } from '@/data/syntheticData';

interface DataExportButtonProps {
  forecasts: ForecastResult[] | null;
  recommendations: OptimizationRecommendation[] | null;
  metrics: SustainabilityMetrics | null;
  scenario: string;
}

export default function DataExportButton({
  forecasts,
  recommendations,
  metrics,
  scenario
}: DataExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportData = {
    exportedAt: new Date().toISOString(),
    scenario,
    forecasts,
    recommendations,
    metrics
  };

  const handleExportJSON = () => {
    setIsExporting(true);
    try {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      downloadFile(blob, `nexus-ai-export-${Date.now()}.json`);
      toast({
        title: "Export successful! 📥",
        description: "Your data has been exported as JSON.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Unable to export data. Please try again.",
        variant: "destructive"
      });
    }
    setIsExporting(false);
  };

  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      if (!forecasts) {
        toast({
          title: "No data to export",
          description: "Run a simulation first to generate data.",
          variant: "destructive"
        });
        return;
      }

      const headers = ['Hour', 'Water Demand (MG/h)', 'Electricity (GWh)', 'Temperature (°C)', 'Confidence (%)'];
      const rows = forecasts.map(f => [
        f.hour,
        f.waterDemand.toFixed(2),
        f.electricityConsumption.toFixed(2),
        f.temperature.toFixed(1),
        (f.confidence * 100).toFixed(1)
      ]);

      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      downloadFile(blob, `nexus-ai-forecasts-${Date.now()}.csv`);

      toast({
        title: "Export successful! 📥",
        description: "Forecast data has been exported as CSV.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Unable to export data. Please try again.",
        variant: "destructive"
      });
    }
    setIsExporting(false);
  };

  const handleExportReport = () => {
    setIsExporting(true);
    try {
      const report = generateTextReport();
      const blob = new Blob([report], { type: 'text/plain' });
      downloadFile(blob, `nexus-ai-report-${Date.now()}.txt`);

      toast({
        title: "Report generated! 📄",
        description: "Your comprehensive report has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Unable to generate report. Please try again.",
        variant: "destructive"
      });
    }
    setIsExporting(false);
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateTextReport = () => {
    const divider = '='.repeat(60);
    
    let report = `
${divider}
NEXUS-AI SIMULATION REPORT
UAE Water-Energy Nexus Optimization Platform
${divider}

Generated: ${new Date().toLocaleString()}
Scenario: ${scenario.toUpperCase()}

${divider}
EXECUTIVE SUMMARY
${divider}
`;

    if (metrics) {
      report += `
SUSTAINABILITY METRICS
----------------------
• CO₂ Reduction: ${metrics.co2ReductionPercent.toFixed(1)}% (${metrics.co2Reduction.toFixed(2)} tonnes saved)
• Energy Savings: ${metrics.energySavedPercent.toFixed(1)}% (${metrics.energySaved.toFixed(2)} GWh)
• Water Efficiency: +${metrics.waterEfficiencyPercent.toFixed(1)}%

Baseline CO₂: ${metrics.baselineCO2.toFixed(2)} tonnes
Optimized CO₂: ${metrics.optimizedCO2.toFixed(2)} tonnes
`;
    }

    if (recommendations && recommendations.length > 0) {
      report += `
${divider}
TOP RECOMMENDATIONS
${divider}
`;
      recommendations.forEach((rec, index) => {
        report += `
${index + 1}. ${rec.strategyId.toUpperCase().replace(/-/g, ' ')}
   Priority: ${rec.priority.toUpperCase()}
   Expected Impact:
   - CO₂ Reduction: -${rec.expectedImpact.co2Reduction}%
   - Cost Savings: -${rec.expectedImpact.costSavings}%
   - Efficiency Gain: +${rec.expectedImpact.efficiencyGain}%
   
   Reasoning: ${rec.reasoning}
`;
      });
    }

    if (forecasts && forecasts.length > 0) {
      const totalWater = forecasts.reduce((sum, f) => sum + f.waterDemand, 0);
      const totalEnergy = forecasts.reduce((sum, f) => sum + f.electricityConsumption, 0);
      const maxTemp = Math.max(...forecasts.map(f => f.temperature));
      const avgConfidence = forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length;

      report += `
${divider}
24-HOUR FORECAST SUMMARY
${divider}
• Total Water Demand: ${totalWater.toFixed(0)} MG
• Total Electricity: ${totalEnergy.toFixed(1)} GWh
• Max Temperature: ${maxTemp.toFixed(1)}°C
• Average Confidence: ${(avgConfidence * 100).toFixed(1)}%
`;
    }

    report += `
${divider}
DISCLAIMER
${divider}
This report is generated by NEXUS-AI using predictive models and 
optimization algorithms. Actual results may vary based on real-time 
conditions, policy changes, and implementation factors.

For more information, visit the NEXUS-AI dashboard.
${divider}
`;

    return report.trim();
  };

  const hasData = forecasts || recommendations || metrics;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          disabled={!hasData || isExporting}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleExportJSON}>
          <FileJson className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export Forecasts (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportReport}>
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
