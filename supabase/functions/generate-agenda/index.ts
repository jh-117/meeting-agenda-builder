// supabase/functions/agenda-generator/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

serve(async (req) => {
  // 处理 CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, formData, agendaData } = await req.json();

    // 从环境变量获取 OpenAI API Key (从 Agenda_generator secret)
    const openaiApiKey = Deno.env.get("Agenda_generator");
    if (!openaiApiKey) {
      throw new Error("OpenAI API Key not configured");
    }

    let prompt = "";

    if (action === "generate") {
      // 生成新议程
      prompt = `You are a professional meeting agenda generator. Based on the following meeting information, generate a detailed and well-structured agenda in Chinese.

Meeting Information:
- Title: ${formData.meetingTitle}
- Date: ${formData.meetingDate}
- Time: ${formData.meetingTime}
- Duration: ${formData.duration} minutes
- Location: ${formData.location}
- Meeting Type: ${formData.meetingType}
- Facilitator: ${formData.facilitator}
- Attendees: ${formData.attendees || "Not specified"}
- Objective: ${formData.meetingObjective}
${formData.additionalInfo ? `- Additional Info: ${formData.additionalInfo}` : ""}

Please generate a JSON response with the following structure (return ONLY valid JSON, no markdown, no explanations):
{
  "agendaItems": [
    {
      "topic": "string",
      "owner": "string (person responsible for this topic)",
      "timeAllocation": number (in minutes),
      "description": "string (what will be discussed)",
      "expectedOutput": "string (what should be decided or delivered)"
    }
  ],
  "actionItems": [
    {
      "task": "string",
      "owner": "string",
      "deadline": "YYYY-MM-DD"
    }
  ]
}

Generate between 4-8 agenda items based on the meeting duration of ${formData.duration} minutes. Distribute time proportionally.`;
    } else if (action === "regenerate") {
      // 重新生成议程
      prompt = `You are a professional meeting agenda generator. Please regenerate the agenda items with a different approach or perspective. Generate response in Chinese.

Current agenda items:
${agendaData.agendaItems.map((item: any) => `- ${item.topic} (${item.timeAllocation}min) - ${item.description}`).join("\n")}

Meeting context:
- Title: ${agendaData.meetingTitle}
- Duration: ${agendaData.duration} minutes
- Objective: ${agendaData.meetingObjective}

Generate a NEW agenda with different structure or emphasis, returning ONLY valid JSON:
{
  "agendaItems": [
    {
      "topic": "string",
      "owner": "string",
      "timeAllocation": number,
      "description": "string",
      "expectedOutput": "string"
    }
  ],
  "actionItems": [
    {
      "task": "string",
      "owner": "string",
      "deadline": "YYYY-MM-DD"
    }
  ]
}`;
    } else {
      throw new Error("Invalid action");
    }

    // 调用 OpenAI API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: action === "generate" ? 0.7 : 0.8,
        max_tokens: 2000,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json();
      throw new Error(error.error?.message || "OpenAI API error");
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices[0].message.content;

    // 清理可能的 markdown 代码块
    const cleanedContent = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsedData = JSON.parse(cleanedContent);

    return new Response(JSON.stringify(parsedData), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error:", error);

    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});