// supabase/functions/agenda-generator/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      action, 
      formData, 
      agendaData, 
      itemData, 
      context, 
      language = "zh",
      attachmentContent = null, // Add attachment content
      attachmentType = null     // Add attachment type
    } = await req.json()

    // 从环境变量获取 OpenAI API Key
    const openaiApiKey = Deno.env.get('Agenda_generator')
    if (!openaiApiKey) {
      throw new Error('OpenAI API Key not configured')
    }

    // 语言配置 - 更新提示词以包含附件
    const languageConfig = {
      zh: {
        systemPrompt: "你是一个专业的会议议程生成助手，请用正式、专业的商务中文回复。所有议程项和行动项都使用中文。",
        generatePrompt: "基于以下会议信息和提供的附件内容，生成详细且结构良好的议程：",
        regeneratePrompt: "请以不同的方法或角度重新生成议程项，并考虑附件内容：",
        regenerateItemPrompt: "请重新生成这个议程项，提供不同的角度或更详细的内容，并考虑附件内容：",
        jsonInstruction: "请生成以下结构的JSON响应（仅返回有效的JSON，不要markdown或解释）：",
        attachmentContext: "附件内容（用于参考）："
      },
      en: {
        systemPrompt: "You are a professional meeting agenda generator. Please use formal, professional business English. All agenda items and action items should be in English.",
        generatePrompt: "Based on the following meeting information and the provided attachment content, generate a detailed and well-structured agenda:",
        regeneratePrompt: "Please regenerate the agenda items with a different approach or perspective, considering the attachment content:",
        regenerateItemPrompt: "Please regenerate this agenda item with a different perspective or more detailed content, considering the attachment content:",
        jsonInstruction: "Generate a JSON response with the following structure (return ONLY valid JSON, no markdown, no explanations):",
        attachmentContext: "Attachment content (for reference):"
      },
      ms: {
        systemPrompt: "Anda adalah pembantu penjanaan agenda mesyuarat profesional. Sila gunakan Bahasa Melayu formal dan profesional. Semua item agenda dan item tindakan hendaklah dalam Bahasa Melayu.",
        generatePrompt: "Berdasarkan maklumat mesyuarat berikut dan kandungan lampiran yang disediakan, hasilkan agenda yang terperinci dan tersusun baik:",
        regeneratePrompt: "Sila hasilkan semula item agenda dengan pendekatan atau perspektif yang berbeza, dengan mengambil kira kandungan lampiran:",
        regenerateItemPrompt: "Sila hasilkan semula item agenda ini dengan perspektif yang berbeza atau kandungan yang lebih terperinci, dengan mengambil kira kandungan lampiran:",
        jsonInstruction: "Hasilkan respons JSON dengan struktur berikut (kembalikan HANYA JSON yang sah, tiada markdown, tiada penjelasan):",
        attachmentContext: "Kandungan lampiran (untuk rujukan):"
      },
      ta: {
        systemPrompt: "நீங்கள் ஒரு தொழில்முறை கூட்ட அட்டவணை உருவாக்கும் உதவியாளர். முறையான, தொழில்முறை வணிக தமிழைப் பயன்படுத்தவும். அனைத்து அட்டவணை உருப்படிகளும் செயல் உருப்படிகளும் தமிழில் இருக்க வேண்டும்.",
        generatePrompt: "பின்வரும் கூட்டத் தகவல்கள் மற்றும் வழங்கப்பட்ட இணைப்பு உள்ளடக்கத்தின் அடிப்படையில், விரிவான மற்றும் நன்கு கட்டமைக்கப்பட்ட அட்டவணையை உருவாக்கவும்:",
        regeneratePrompt: "இணைப்பு உள்ளடக்கத்தைக் கருத்தில் கொண்டு, வேறுபட்ட அணுகுமுறை அல்லது கோணத்துடன் அட்டவணை உருப்படிகளை மீண்டும் உருவாக்கவும்:",
        regenerateItemPrompt: "இணைப்பு உள்ளடக்கத்தைக் கருத்தில் கொண்டு, இந்த அட்டவணை உருப்படியை வேறுபட்ட கோணம் அல்லது மேலும் விரிவான உள்ளடக்கத்துடன் மீண்டும் உருவாக்கவும்:",
        jsonInstruction: "பின்வரும் கட்டமைப்புடன் JSON பதிலை உருவாக்கவும் (செல்லுபடியாகும் JSON மட்டுமே திருப்பி விடுங்கள், markdown அல்லது விளக்கங்கள் இல்லை):",
        attachmentContext: "இணைப்பு உள்ளடக்கம் (குறிப்புக்காக):"
      }
    }

    const config = languageConfig[language] || languageConfig.zh

    let prompt = ""

    // Build attachment context if available
    let attachmentContext = ""
    if (attachmentContent) {
      attachmentContext = `\n\n${config.attachmentContext}\n${attachmentContent}\n`
      
      // Add type information if available
      if (attachmentType) {
        attachmentContext = `\n\n${config.attachmentContext} (${attachmentType})\n${attachmentContent}\n`
      }
    }

    if (action === "generate") {
      prompt = `${config.systemPrompt}

${config.generatePrompt}

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
${attachmentContext}

${config.jsonInstruction}
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

Generate between 4-8 agenda items based on the meeting duration of ${formData.duration} minutes. Distribute time proportionally.`

    } else if (action === "regenerate") {
      prompt = `${config.systemPrompt}

${config.regeneratePrompt}

Current agenda items:
${agendaData.agendaItems.map((item) => `- ${item.topic} (${item.timeAllocation}min) - ${item.description}`).join("\n")}

Meeting context:
- Title: ${agendaData.meetingTitle}
- Duration: ${agendaData.duration} minutes
- Objective: ${agendaData.meetingObjective}
${attachmentContext}

${config.jsonInstruction}
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
}`

    } else if (action === "regenerate_item") {
      prompt = `${config.systemPrompt}

${config.regenerateItemPrompt}

Current item:
- Topic: ${itemData.topic}
- Description: ${itemData.description}
- Time Allocation: ${itemData.timeAllocation} minutes
${itemData.owner ? `- Owner: ${itemData.owner}` : ""}
${itemData.expectedOutput ? `- Expected Output: ${itemData.expectedOutput}` : ""}

Meeting context:
- Title: ${context.meetingTitle}
- Objective: ${context.meetingObjective}
${attachmentContext}

Please regenerate ONLY this single agenda item, returning valid JSON:
{
  "topic": "string",
  "owner": "string",
  "timeAllocation": number,
  "description": "string",
  "expectedOutput": "string"
}`

    } else {
      throw new Error("Invalid action")
    }

    console.log("AI Prompt:", prompt)

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
        response_format: { type: "json_object" }
      }),
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json()
      throw new Error(error.error?.message || "OpenAI API error")
    }

    const openaiData = await openaiResponse.json()
    const content = openaiData.choices[0].message.content

    console.log("AI Response:", content)

    // 清理可能的 markdown 代码块
    const cleanedContent = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim()

    const parsedData = JSON.parse(cleanedContent)

    return new Response(
      JSON.stringify(parsedData),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )

  } catch (error) {
    console.error('Error:', error)

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})