// supabase/functions/generate-agenda/index.ts
// Edge Function: Generates structured meeting agenda using AI
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

type AgendaInput = {
  title: string;
  objectives: string[];
  attendees?: string[];
  duration_minutes?: number;
  constraints?: string[];
  notes?: string;
};

type AgendaSection = {
  section: string;
  objectives: string[];
  duration_minutes: number;
  talking_points: string[];
};

type AgendaOutput = {
  title: string;
  agenda: AgendaSection[];
  total_duration_minutes: number;
  action_items: string[];
  follow_up_questions: string[];
};

const DEFAULT_DURATION = 45;

function clean(input?: string) {
  return (input || "").toString().trim();
}

console.info("generate-agenda function started");

serve(async (req: Request) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    const payload = (await req.json()) as Partial<AgendaInput>;
    const title = clean(payload.title);
    const objectives = Array.isArray(payload.objectives)
      ? payload.objectives.map(clean).filter(Boolean)
      : [];
    const attendees = Array.isArray(payload.attendees)
      ? payload.attendees.map(clean).filter(Boolean)
      : [];
    const constraints = Array.isArray(payload.constraints)
      ? payload.constraints.map(clean).filter(Boolean)
      : [];
    const notes = clean(payload.notes);

    const duration =
      Number.isFinite(payload.duration_minutes) && (payload.duration_minutes as number) > 0
        ? Math.min(240, Math.max(15, payload.duration_minutes as number))
        : DEFAULT_DURATION;

    if (!title || objectives.length === 0) {
      return new Response(JSON.stringify({ error: "title and objectives[] are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Build prompt for AI
    const prompt = `
You are an expert meeting facilitator. Generate a concise, time-boxed agenda.
Return strictly valid JSON matching the schema:
{
  "title": string,
  "agenda": [
    { "section": string, "objectives": string[], "duration_minutes": number, "talking_points": string[] }
  ],
  "total_duration_minutes": number,
  "action_items": string[],
  "follow_up_questions": string[]
}
Rules:
- Total duration must not exceed the requested limit.
- Prefer 5–12 minute sections.
- Include checkpoints for decisions and next steps.
- Make talking_points actionable and specific.
- Avoid markdown; plain JSON only.

Input:
Title: ${title}
Objectives: ${objectives.join("; ")}
Attendees: ${attendees.join("; ") || "N/A"}
Duration (minutes): ${duration}
Constraints: ${constraints.join("; ") || "None"}
Notes: ${notes || "N/A"}
`;

    // Call OpenAI/Claude via Supabase secret
    const apiKey = Deno.env.get("Agenda_generator");
    if (!apiKey) throw new Error("API key not found in secrets");

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800,
      }),
    });

    const aiData = await aiRes.json();
    const text = aiData?.choices?.[0]?.message?.content ?? "";

    // Extract JSON from response
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
      return new Response(JSON.stringify({ error: "AI returned invalid output" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as AgendaOutput;

    // Ensure total duration does not exceed requested duration
    const sum = parsed.agenda.reduce((acc, s) => acc + (Number(s.duration_minutes) || 0), 0);
    if (sum > duration && sum > 0) {
      const scale = duration / sum;
      let remaining = duration;
      parsed.agenda = parsed.agenda.map((s, i) => {
        const base = Math.max(3, Math.round((s.duration_minutes || 5) * scale));
        const adjusted = i === parsed.agenda.length - 1 ? Math.max(3, remaining) : base;
        remaining -= adjusted;
        return { ...s, duration_minutes: adjusted };
      });
    }
    parsed.total_duration_minutes = parsed.agenda.reduce((a, s) => a + s.duration_minutes, 0);

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("generate-agenda error", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
