import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ExplanationRequest {
  scenario: string;
  temperature: number;
  populationGrowth: number;
  forecastSummary: {
    totalWaterDemand: number;
    totalElectricityConsumption: number;
    peakWaterDemand: number;
    peakElectricityConsumption: number;
    averageConfidence: number;
    maxTemperature: number;
  };
  recommendations: Array<{
    strategy: string;
    priority: string;
    reasoning: string;
    impact: {
      co2Reduction: number;
      costSavings: number;
      efficiencyGain: number;
    };
  }>;
  metrics: {
    co2ReductionPercent: number;
    energySavedPercent: number;
    waterEfficiencyPercent: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestData: ExplanationRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ 
          explanation: generateFallbackExplanation(requestData)
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are the Explainability & Ethics Agent for NEXUS-AI, a water-energy nexus optimization system for the UAE. 

Your role is to provide clear, human-readable explanations for AI decisions made by the other agents in the system. You should:
1. Explain decisions in plain language that non-technical stakeholders can understand
2. Highlight the reasoning behind recommendations
3. Note any assumptions or limitations
4. Emphasize UAE-specific context and sustainability impact
5. Be concise but thorough - aim for 3-4 paragraphs

Keep your response professional but accessible. Use specific numbers when available. Format your response in paragraphs without headers.`;

    const userPrompt = `Please explain the following simulation results for the UAE water-energy nexus optimization:

**Scenario**: ${requestData.scenario}
**Temperature**: ${requestData.temperature}°C
**Population Growth Factor**: ${requestData.populationGrowth}%

**Forecast Summary**:
- Total Water Demand: ${requestData.forecastSummary.totalWaterDemand} million gallons
- Total Electricity: ${requestData.forecastSummary.totalElectricityConsumption} GWh
- Peak Water Demand: ${requestData.forecastSummary.peakWaterDemand} MG/h
- Peak Electricity: ${requestData.forecastSummary.peakElectricityConsumption} GWh
- Forecast Confidence: ${requestData.forecastSummary.averageConfidence}%
- Max Temperature: ${requestData.forecastSummary.maxTemperature}°C

**Top Recommendations**:
${requestData.recommendations.map((r, i) => 
  `${i + 1}. ${r.strategy} (${r.priority} priority) - ${r.reasoning}`
).join('\n')}

**Expected Sustainability Impact**:
- CO₂ Reduction: ${requestData.metrics.co2ReductionPercent}%
- Energy Savings: ${requestData.metrics.energySavedPercent}%
- Water Efficiency Improvement: ${requestData.metrics.waterEfficiencyPercent}%

Provide a comprehensive explanation of why these recommendations were made and their implications for UAE's water-energy sustainability.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Return fallback explanation for other errors
      return new Response(
        JSON.stringify({ 
          explanation: generateFallbackExplanation(requestData)
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const explanation = data.choices?.[0]?.message?.content || generateFallbackExplanation(requestData);

    return new Response(
      JSON.stringify({ explanation }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("nexus-explain error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        explanation: "Unable to generate AI explanation. The forecasting and optimization agents have completed their analysis based on UAE-specific data and operational parameters."
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateFallbackExplanation(data: ExplanationRequest): string {
  const topStrategy = data.recommendations[0];
  
  return `Based on the ${data.scenario} scenario at ${data.temperature}°C, our multi-agent system has analyzed the UAE's water-energy nexus and identified key optimization opportunities.

The forecasting agent predicts a total water demand of ${data.forecastSummary.totalWaterDemand} million gallons requiring ${data.forecastSummary.totalElectricityConsumption} GWh of electricity. Peak demand is expected at ${data.forecastSummary.peakWaterDemand} MG/h, with forecast confidence at ${data.forecastSummary.averageConfidence}%.

The optimization agent recommends ${topStrategy?.strategy || 'operational improvements'} as the highest priority action. ${topStrategy?.reasoning || 'This strategy optimizes the balance between water production and energy consumption.'} The combined recommendations could reduce CO₂ emissions by ${data.metrics.co2ReductionPercent}% while improving water efficiency by ${data.metrics.waterEfficiencyPercent}%.

These recommendations align with UAE's sustainability goals and the nation's commitment to reducing the carbon footprint of desalination operations.`;
}
