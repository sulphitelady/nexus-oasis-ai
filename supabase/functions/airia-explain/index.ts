import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const AIRIA_EXPLAIN_URL = "https://api.airia.ai/v2/PipelineExecution/2fd5b35c-2103-4076-a755-73682ac3f6fa";

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
    console.log("Explainability request:", JSON.stringify(requestData));

    const response = await fetch(AIRIA_EXPLAIN_URL, {
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
      console.error("AIRIA explainability error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `AIRIA API error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("AIRIA explainability response:", JSON.stringify(data));

    // Extract explanation from AIRIA response
    const explanation = data.result || data.output || data.explanation || JSON.stringify(data);

    return new Response(
      JSON.stringify({ explanation }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("airia-explain error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
