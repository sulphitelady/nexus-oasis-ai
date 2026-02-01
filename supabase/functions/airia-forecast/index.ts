import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const AIRIA_FORECAST_URL = "https://api.airia.ai/v2/PipelineExecution/ea64f847-fa44-4aa4-b040-9187e2678d19";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const AIRIA_API_KEY = Deno.env.get("AIRIA_API_KEY");
    if (!AIRIA_API_KEY) {
      console.error("AIRIA_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AIRIA_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const requestData = await req.json();
    console.log("Forecast request:", JSON.stringify(requestData));

    const response = await fetch(AIRIA_FORECAST_URL, {
      method: "POST",
      headers: {
        "X-API-Key": AIRIA_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        UserInput: JSON.stringify(requestData)
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AIRIA forecast error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `AIRIA API error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("AIRIA forecast response:", JSON.stringify(data));

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("airia-forecast error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
