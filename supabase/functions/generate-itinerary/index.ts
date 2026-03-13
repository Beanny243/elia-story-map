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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Calculate number of days
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

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
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
