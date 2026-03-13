import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { destination, startDate, endDate, travelStyle, budget, companions, prompt } =
      await req.json();

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    let numDays = 3;
    if (startDate && endDate) {
      const diff = Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (diff > 0) numDays = Math.min(diff, 14);
    }

    const systemPrompt = `You are an expert travel planner. Generate a detailed day-by-day itinerary in valid JSON format.

Return ONLY a JSON array with this exact structure (no markdown, no code fences):
[
  {
    "day_number": 1,
    "title": "Arrival & City Exploration",
    "activities": ["Activity 1 with brief description", "Activity 2 with brief description", "Activity 3 with brief description"]
  }
]

Rules:
- Generate exactly ${numDays} days
- Each day should have 3-5 activities
- Activities should be specific, actionable, and include real place names
- Consider the travel style, budget level, and companions when suggesting activities
- Make the itinerary flow naturally with logical sequencing`;

    const userPrompt = `Create a ${numDays}-day itinerary for ${destination}.
${travelStyle ? `Travel style: ${travelStyle}` : ""}
${budget ? `Budget: ${budget}` : ""}
${companions ? `Traveling: ${companions}` : ""}
${startDate ? `Starting: ${startDate}` : ""}
${prompt ? `Additional preferences: ${prompt}` : ""}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("OpenAI API error:", response.status, t);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402 || response.status === 401) {
        return new Response(
          JSON.stringify({ error: "OpenAI API key issue. Please check your API key and billing." }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("generate-itinerary error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
