import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { decision, mode } = await req.json();

    if (!decision || typeof decision !== "string" || !decision.trim()) {
      return new Response(
        JSON.stringify({ error: "A decision question is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = buildPrompt(decision.trim(), mode || "chaos");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const aiResponse = await fetch(`${supabaseUrl}/functions/v1/ai-gateway`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 600,
        temperature: mode === "accurate" ? 0.7 : 1.1,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", errText);
      return new Response(
        JSON.stringify({ error: "AI service unavailable. The machine is napping." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    const parsed = parseAIResponse(content);

    return new Response(
      JSON.stringify({ decision: decision.trim(), ...parsed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: "Something went wrong. The slot machine jammed." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildPrompt(decision: string, mode: string): string {
  const toneGuide = mode === "accurate"
    ? "Be slightly more grounded and add one fake statistical buzzword like 'Bayesian', 'regression', or 'confidence interval'. Still keep the humor."
    : "Go full chaos. Be wildly creative, absurd, and theatrical.";

  return `You are the "Life Decision Slot Machine" — a theatrical, absurdly confident decision-making oracle. A user asks a life question, and you deliver a verdict with maximum fake authority and humor.

User's question: "${decision}"

${toneGuide}

Respond with EXACTLY this JSON format (no markdown, no code fences, just raw JSON):
{
  "verdict": "A short punchy action (2-5 words, ALL CAPS) like QUIT YOUR JOB, TEXT THEM BACK, BUY THE SHOES, MOVE TO PARIS, DO NOT QUIT YET",
  "emotion": "A funny, specific emotional outcome (1-2 sentences) describing how they will feel, using vivid metaphors and unexpected details",
  "advice": "One piece of absurdly specific chaotic advice (1-2 sentences) that is technically actionable but delightfully unhinged",
  "consequence": "A ridiculous but plausible-sounding consequence (1-2 sentences) that could follow from this decision",
  "stats": "A fake statistical justification (1-2 sentences) with made-up numbers, fake sample sizes, and absurd metrics like 'sandwich happiness' or 'vibe liquidity'"
}`;
}

function parseAIResponse(content: string): Record<string, string> {
  const defaults = {
    verdict: "CONSULT THE MACHINE AGAIN",
    emotion: "The machine produced an unreadable emotion. Try again.",
    advice: "Spin once more. The oracle was distracted by a butterfly.",
    consequence: "Fate is buffering. Please hold.",
    stats: "0 out of 0 analysts could agree. The machine needs a moment.",
  };

  try {
    const cleaned = content.replace(/```json?\s*/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      verdict: typeof parsed.verdict === "string" ? parsed.verdict.toUpperCase() : defaults.verdict,
      emotion: typeof parsed.emotion === "string" ? parsed.emotion : defaults.emotion,
      advice: typeof parsed.advice === "string" ? parsed.advice : defaults.advice,
      consequence: typeof parsed.consequence === "string" ? parsed.consequence : defaults.consequence,
      stats: typeof parsed.stats === "string" ? parsed.stats : defaults.stats,
    };
  } catch {
    return defaults;
  }
}
