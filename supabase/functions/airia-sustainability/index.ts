import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const AIRIA_SUSTAINABILITY_URL = "https://api.airia.ai/v2/PipelineExecution/a49c7d6b-5f6f-4cf5-9d5b-935027d51bd1";

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
    console.log("Sustainability request:", JSON.stringify(requestData));

    const response = await fetch(AIRIA_SUSTAINABILITY_URL, {
      method: "POST",
      headers: {
        "X-API-Key": AIRIA_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: JSON.stringify(requestData)
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AIRIA sustainability error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `AIRIA API error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("AIRIA sustainability response:", JSON.stringify(data));

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("airia-sustainability error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
