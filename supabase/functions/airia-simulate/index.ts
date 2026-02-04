import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const AIRIA_FORECAST_URL = "https://api.airia.ai/v2/PipelineExecution/ea64f847-fa44-4aa4-b040-9187e2678d19";
const AIRIA_OPTIMIZE_URL = "https://api.airia.ai/v2/PipelineExecution/a1765058-4cc7-4953-844e-192e66dab80e";
const AIRIA_SUSTAINABILITY_URL = "https://api.airia.ai/v2/PipelineExecution/a49c7d6b-5f6f-4cf5-9d5b-935027d51bd1";

// Timeout wrapper for fetch with 3 second limit per call
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = 3000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    const AIRIA_API_KEY = Deno.env.get("AIRIA_API_KEY");
    if (!AIRIA_API_KEY) {
      console.error("AIRIA_API_KEY is not configured");
      return new Response(
        JSON.stringify({ 
          error: "AIRIA_API_KEY is not configured",
          useFallback: true 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const requestData = await req.json();
    const { scenario, temperature, populationGrowth, date } = requestData;
    
    console.log("Unified simulation request:", JSON.stringify({ scenario, temperature, populationGrowth }));

    // Run all AIRIA calls in PARALLEL with tight timeouts
    const [forecastResult, optimizeResult, sustainResult] = await Promise.allSettled([
      // Forecast call
      fetchWithTimeout(AIRIA_FORECAST_URL, {
        method: "POST",
        headers: {
          "X-API-Key": AIRIA_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          UserInput: JSON.stringify({ scenario, temperature, populationGrowth, date })
        }),
      }, 2500).then(async (res) => {
        if (!res.ok) throw new Error(`Forecast API error: ${res.status}`);
        return res.json();
      }),
      
      // Optimization call - runs independently with same params
      fetchWithTimeout(AIRIA_OPTIMIZE_URL, {
        method: "POST",
        headers: {
          "X-API-Key": AIRIA_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          UserInput: JSON.stringify({ scenario, temperature, populationGrowth })
        }),
      }, 2500).then(async (res) => {
        if (!res.ok) throw new Error(`Optimize API error: ${res.status}`);
        return res.json();
      }),
      
      // Sustainability call - runs independently
      fetchWithTimeout(AIRIA_SUSTAINABILITY_URL, {
        method: "POST",
        headers: {
          "X-API-Key": AIRIA_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          UserInput: JSON.stringify({ scenario, temperature, populationGrowth })
        }),
      }, 2500).then(async (res) => {
        if (!res.ok) throw new Error(`Sustainability API error: ${res.status}`);
        return res.json();
      }),
    ]);

    const elapsedMs = Date.now() - startTime;
    console.log(`All AIRIA calls completed in ${elapsedMs}ms`);

    // Build response with whatever succeeded
    const response: Record<string, unknown> = {
      elapsedMs,
      useFallback: false,
    };

    if (forecastResult.status === 'fulfilled') {
      response.forecastData = forecastResult.value;
    } else {
      console.error("Forecast failed:", forecastResult.reason);
      response.forecastError = true;
    }

    if (optimizeResult.status === 'fulfilled') {
      response.optimizeData = optimizeResult.value;
    } else {
      console.error("Optimize failed:", optimizeResult.reason);
      response.optimizeError = true;
    }

    if (sustainResult.status === 'fulfilled') {
      response.sustainData = sustainResult.value;
    } else {
      console.error("Sustainability failed:", sustainResult.reason);
      response.sustainError = true;
    }

    // If all failed, signal to use fallback
    if (forecastResult.status === 'rejected' && 
        optimizeResult.status === 'rejected' && 
        sustainResult.status === 'rejected') {
      response.useFallback = true;
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const elapsedMs = Date.now() - startTime;
    console.error("airia-simulate error:", error, `(${elapsedMs}ms)`);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        useFallback: true,
        elapsedMs 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
