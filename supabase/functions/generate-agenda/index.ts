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
      attachmentContent = null,
      attachmentType = null
    } = await req.json()

    // 从环境变量获取 OpenAI API Key
    const openaiApiKey = Deno.env.get('Agenda_generator')
    if (!openaiApiKey) {
      throw new Error('OpenAI API Key not configured')
    }

    // 语言配置 - 强化提示词以强制使用附件内容
    const languageConfig = {
      zh: {
        systemPrompt: "你是一个专业的会议议程生成助手。请用正式、专业的商务中文回复。所有议程项和行动项都使用中文。\n\n重要：你必须基于提供的附件内容创建具体、详细的议程项，不要生成通用的议程模板。",
        generatePrompt: "基于以下会议信息和提供的附件内容，生成详细且结构良好的议程。必须使用附件中的具体信息：",
        regeneratePrompt: "请以不同的方法或角度重新生成议程项，必须深入利用附件内容：",
        regenerateItemPrompt: "请重新生成这个议程项，提供不同的角度或更详细的内容，必须参考附件内容：",
        jsonInstruction: "请生成以下结构的JSON响应（仅返回有效的JSON，不要markdown或解释）。议程项必须反映附件中的具体内容：",
        attachmentContext: "附件内容（必须使用此内容创建具体议程项）：",
        attachmentInstruction: "重要提示：你必须使用上述附件内容中的具体信息来创建议程项。议程项应直接反映附件中提到的项目目标、交付成果、时间线、资源分配和风险。不要创建通用的议程模板。"
      },
      en: {
        systemPrompt: "You are a professional meeting agenda generator. Please use formal, professional business English. All agenda items and action items should be in English.\n\nCRITICAL: You MUST create SPECIFIC, DETAILED agenda items based on the provided attachment content. Do NOT generate generic agenda templates.",
        generatePrompt: "Based on the following meeting information and the provided attachment content, generate a detailed and well-structured agenda. You MUST use the specific information from the attachment:",
        regeneratePrompt: "Please regenerate the agenda items with a different approach or perspective, making DEEP USE of the attachment content:",
        regenerateItemPrompt: "Please regenerate this agenda item with a different perspective or more detailed content, making DIRECT REFERENCE to the attachment content:",
        jsonInstruction: "Generate a JSON response with the following structure (return ONLY valid JSON, no markdown, no explanations). Agenda items MUST reflect the specific content from the attachment:",
        attachmentContext: "ATTACHMENT CONTENT (YOU MUST USE THIS TO CREATE SPECIFIC AGENDA ITEMS):",
        attachmentInstruction: "CRITICAL: You MUST use the specific information from the above attachment content to create agenda items. Agenda items should directly reflect the project goals, deliverables, timelines, resource allocations, and risks mentioned in the attachment. Do NOT create generic agenda templates."
      },
      ms: {
        systemPrompt: "Anda adalah pembantu penjanaan agenda mesyuarat profesional. Sila gunakan Bahasa Melayu formal dan profesional. Semua item agenda dan item tindakan hendaklah dalam Bahasa Melayu.\n\nPENTING: Anda MESTI mencipta item agenda YANG SPESIFIK dan TERPERINCI berdasarkan kandungan lampiran yang disediakan. JANGAN hasilkan templat agenda generik.",
        generatePrompt: "Berdasarkan maklumat mesyuarat berikut dan kandungan lampiran yang disediakan, hasilkan agenda yang terperinci dan tersusun baik. Anda MESTI menggunakan maklumat spesifik dari lampiran:",
        regeneratePrompt: "Sila hasilkan semula item agenda dengan pendekatan atau perspektif yang berbeza, dengan menggunakan SECARA MENDALAM kandungan lampiran:",
        regenerateItemPrompt: "Sila hasilkan semula item agenda ini dengan perspektif yang berbeza atau kandungan yang lebih terperinci, dengan membuat RUJUKAN LANGSUNG kepada kandungan lampiran:",
        jsonInstruction: "Hasilkan respons JSON dengan struktur berikut (kembalikan HANYA JSON yang sah, tiada markdown, tiada penjelasan). Item agenda MESTI mencerminkan kandungan spesifik dari lampiran:",
        attachmentContext: "KANDUNGAN LAMPIRAN (ANDA MESTI GUNAKAN INI UNTUK MENCIPTA ITEM AGENDA SPESIFIK):",
        attachmentInstruction: "PENTING: Anda MESTI menggunakan maklumat spesifik dari kandungan lampiran di atas untuk mencipta item agenda. Item agenda harus mencerminkan secara langsung matlamat projek, penghantaran, garis masa, peruntukan sumber, dan risiko yang disebut dalam lampiran. JANGAN cipta templat agenda generik."
      },
      ta: {
        systemPrompt: "நீங்கள் ஒரு தொழில்முறை கூட்ட அட்டவணை உருவாக்கும் உதவியாளர். முறையான, தொழில்முறை வணிக தமிழைப் பயன்படுத்தவும். அனைத்து அட்டவணை உருப்படிகளும் செயல் உருப்படிகளும் தமிழில் இருக்க வேண்டும்.\n\nமுக்கியமானது: வழங்கப்பட்ட இணைப்பு உள்ளடக்கத்தின் அடிப்படையில் நீங்கள் குறிப்பிட்ட, விரிவான அட்டவணை உருப்படிகளை உருவாக்க வேண்டும். பொதுவான அட்டவணை வார்ப்புருக்களை உருவாக்க வேண்டாம்.",
        generatePrompt: "பின்வரும் கூட்டத் தகவல்கள் மற்றும் வழங்கப்பட்ட இணைப்பு உள்ளடக்கத்தின் அடிப்படையில், விரிவான மற்றும் நன்கு கட்டமைக்கப்பட்ட அட்டவணையை உருவாக்கவும். இணைப்பிலிருந்து குறிப்பிட்ட தகவல்களை நீங்கள் பயன்படுத்த வேண்டும்:",
        regeneratePrompt: "இணைப்பு உள்ளடக்கத்தை ஆழமாகப் பயன்படுத்தி, வேறுபட்ட அணுகுமுறை அல்லது கோணத்துடன் அட்டவணை உருப்படிகளை மீண்டும் உருவாக்கவும்:",
        regenerateItemPrompt: "இந்த அட்டவணை உருப்படியை வேறுபட்ட கோணம் அல்லது மேலும் விரிவான உள்ளடக்கத்துடன் மீண்டும் உருவாக்கவும், இணைப்பு உள்ளடக்கத்தை நேரடியாகக் குறிப்பிடவும்:",
        jsonInstruction: "பின்வரும் கட்டமைப்புடன் JSON பதிலை உருவாக்கவும் (செல்லுபடியாகும் JSON மட்டுமே திருப்பி விடுங்கள், markdown அல்லது விளக்கங்கள் இல்லை). அட்டவணை உருப்படிகள் இணைப்பிலிருந்து குறிப்பிட்ட உள்ளடக்கத்தை பிரதிபலிக்க வேண்டும்:",
        attachmentContext: "இணைப்பு உள்ளடக்கம் (குறிப்பிட்ட அட்டவணை உருப்படிகளை உருவாக்க நீங்கள் இதைப் பயன்படுத்த வேண்டும்):",
        attachmentInstruction: "முக்கியமானது: அட்டவணை உருப்படிகளை உருவாக்க மேலே உள்ள இணைப்பு உள்ளடக்கத்திலிருந்து குறிப்பிட்ட தகவல்களை நீங்கள் பயன்படுத்த வேண்டும். அட்டவணை உருப்படிகள் இணைப்பில் குறிப்பிடப்பட்டுள்ள திட்ட இலக்குகள், வழங்கப்படும் பொருட்கள், காலவரிசைகள், வள ஒதுக்கீடுகள் மற்றும் அபாயங்களை நேரடியாக பிரதிபலிக்க வேண்டும். பொதுவான அட்டவணை வார்ப்புருக்களை உருவாக்க வேண்டாம்."
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

${config.attachmentInstruction}

${config.attachmentContext}
${attachmentContext}

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

${config.jsonInstruction}
{
  "agendaItems": [
    {
      "topic": "string (MUST be specific and reference attachment content)",
      "owner": "string (person responsible for this topic)",
      "timeAllocation": number (in minutes),
      "description": "string (what will be discussed - MUST reference attachment details)",
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

${config.attachmentInstruction}

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
      "topic": "string (MUST reference attachment content)",
      "owner": "string",
      "timeAllocation": number,
      "description": "string (MUST use attachment details)",
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

${config.attachmentInstruction}

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
  "topic": "string (MUST reference attachment content)",
  "owner": "string",
  "timeAllocation": number,
  "description": "string (MUST use attachment details)",
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