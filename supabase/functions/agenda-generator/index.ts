// supabase/functions/agenda-generator/index.ts
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }

  try {
    console.log('📥 Incoming request method:', req.method);
    console.log('📥 Incoming request headers:', Object.fromEntries(req.headers));
    
    let body;
    try {
      body = await req.json();
      console.log('📥 Request body received:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError.message);
      throw new Error(`Invalid JSON in request body: ${parseError.message}`);
    }

    const { action, formData, agendaData, itemData, context, language = "zh" } = body;

    // Get OpenAI API Key from environment
    const openaiApiKey = Deno.env.get('Agenda_generator');
    if (!openaiApiKey) {
      throw new Error('OpenAI API Key not configured');
    }

    // Validate action
    if (!['generate', 'regenerate', 'regenerate_item'].includes(action)) {
      throw new Error(`Invalid action: ${action}`);
    }

    // Language configuration
    const languageConfig: Record<string, any> = {
      zh: {
        systemPrompt: "你是一个专业的会议议程生成助手，请用正式、专业的商务中文回复。所有议程项和行动项都使用中文。",
        generatePrompt: "基于以下会议信息，生成详细且结构良好的议程：",
        regeneratePrompt: "请以不同的方法或角度重新生成议程项：",
        regenerateItemPrompt: "请重新生成这个议程项，提供不同的角度或更详细的内容：",
        jsonInstruction: "请生成以下结构的JSON响应（仅返回有效的JSON，不要markdown或解释）："
      },
      en: {
        systemPrompt: "You are a professional meeting agenda generator. Please use formal, professional business English. All agenda items and action items should be in English.",
        generatePrompt: "Based on the following meeting information, generate a detailed and well-structured agenda:",
        regeneratePrompt: "Please regenerate the agenda items with a different approach or perspective:",
        regenerateItemPrompt: "Please regenerate this agenda item with a different perspective or more detailed content:",
        jsonInstruction: "Generate a JSON response with the following structure (return ONLY valid JSON, no markdown, no explanations):"
      },
      ms: {
        systemPrompt: "Anda adalah pembantu penjanaan agenda mesyuarat profesional. Sila gunakan Bahasa Melayu formal dan profesional. Semua item agenda dan item tindakan hendaklah dalam Bahasa Melayu.",
        generatePrompt: "Berdasarkan maklumat mesyuarat berikut, hasilkan agenda yang terperinci dan tersusun baik:",
        regeneratePrompt: "Sila hasilkan semula item agenda dengan pendekatan atau perspektif yang berbeza:",
        regenerateItemPrompt: "Sila hasilkan semula item agenda ini dengan perspektif yang berbeza atau kandungan yang lebih terperinci:",
        jsonInstruction: "Hasilkan respons JSON dengan struktur berikut (kembalikan HANYA JSON yang sah, tiada markdown, tiada penjelasan):"
      },
      ta: {
        systemPrompt: "நீங்கள் ஒரு தொழில்முறை கூட்ட அட்டவணை உருவாக்கும் உதவியாளர். முறையான, தொழில்முறை வணிக தமிழைப் பயன்படுத்தவும். அனைத்து அட்டவணை உருப்படிகளும் செயல் உருப்படிகளும் தமிழில் இருக்க வேண்டும்.",
        generatePrompt: "பின்வரும் கூட்டத் தகவல்களின் அடிப்படையில், விரிவான மற்றும் நன்கு கட்டமைக்கப்பட்ட அட்டவணையை உருவாக்கவும்:",
        regeneratePrompt: "வேறுபட்ட அணுகுமுறை அல்லது கோணத்துடன் அட்டவணை உருப்படிகளை மீண்டும் உருவாக்கவும்:",
        regenerateItemPrompt: "இந்த அட்டவணை உருப்படியை வேறுபட்ட கோணம் அல்லது மேலும் விரிவான உள்ளடக்கத்துடன் மீண்டும் உருவாக்கவும்:",
        jsonInstruction: "பின்வரும் கட்டமைப்புடன் JSON பதிலை உருவாக்கவும் (செல்லுபடியாகும் JSON மட்டுமே திருப்பி விடுங்கள், markdown அல்லது விளக்கங்கள் இல்லை):"
      }
    };

    const config = languageConfig[language] || languageConfig['zh'];
    let prompt = "";

    if (action === "generate") {
      // Validate required formData fields
      if (!formData.meetingTitle || !formData.duration) {
        throw new Error('Missing required fields: meetingTitle, duration');
      }

      // Build attachments info
      let attachmentsInfo = "";
      if (formData.attachments && Array.isArray(formData.attachments) && formData.attachments.length > 0) {
        attachmentsInfo = "\n\nAttached Documents:\n";
        formData.attachments.forEach((attachment: any, index: number) => {
          attachmentsInfo += `${index + 1}. ${attachment.name || 'Unknown'} (${attachment.type || 'file'})\n`;
        });
        attachmentsInfo += "\nNote: Consider these documents when generating the agenda.";
      }

      // Build additional details info
      let additionalDetailsInfo = "";
      if (formData.needAISupplement && formData.additionalInfo?.trim()) {
        additionalDetailsInfo = `\n\nAdditional Details & Context:\n${formData.additionalInfo}\n\nIMPORTANT: Reflect these details in the generated agenda items.`;
      }

      prompt = `${config.systemPrompt}

${config.generatePrompt}

Meeting Information:
- Title: ${formData.meetingTitle || 'Not specified'}
- Date: ${formData.meetingDate || 'Not specified'}
- Time: ${formData.meetingTime || 'Not specified'}
- Duration: ${formData.duration} minutes
- Location: ${formData.location || 'Not specified'}
- Meeting Type: ${formData.meetingType || 'Not specified'}
- Facilitator: ${formData.facilitator || 'Not specified'}
- Note Taker: ${formData.noteTaker || 'Not specified'}
- Attendees: ${formData.attendees || 'Not specified'}
- Objective: ${formData.meetingObjective || 'Not specified'}${attachmentsInfo}${additionalDetailsInfo}

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

Generate between 4-8 agenda items based on the meeting duration of ${formData.duration} minutes. Distribute time proportionally.`;
    } else if (action === "regenerate") {
      // Validate required agendaData
      if (!agendaData.agendaItems || !Array.isArray(agendaData.agendaItems)) {
        throw new Error('Missing or invalid agendaItems in agendaData');
      }

      prompt = `${config.systemPrompt}

${config.regeneratePrompt}

Current agenda items:
${agendaData.agendaItems.map((item: any) => `- ${item.topic} (${item.timeAllocation}min) - ${item.description}`).join("\n")}

Meeting context:
- Title: ${agendaData.meetingTitle || 'Not specified'}
- Duration: ${agendaData.duration || 'Not specified'} minutes
- Objective: ${agendaData.meetingObjective || 'Not specified'}

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
}`;
    } else if (action === "regenerate_item") {
      // Validate required itemData
      if (!itemData.topic) {
        throw new Error('Missing required field: itemData.topic');
      }

      prompt = `${config.systemPrompt}

${config.regenerateItemPrompt}

Current item:
- Topic: ${itemData.topic}
- Description: ${itemData.description || 'Not specified'}
- Time Allocation: ${itemData.timeAllocation || 5} minutes
${itemData.owner ? `- Owner: ${itemData.owner}` : ""}
${itemData.expectedOutput ? `- Expected Output: ${itemData.expectedOutput}` : ""}

Meeting context:
- Title: ${context?.meetingTitle || 'Not specified'}
- Objective: ${context?.meetingObjective || 'Not specified'}

Please regenerate ONLY this single agenda item, returning valid JSON:
{
  "topic": "string",
  "owner": "string",
  "timeAllocation": number,
  "description": "string",
  "expectedOutput": "string"
}`;
    }

    console.log("AI Prompt:", prompt);

    // Call OpenAI API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: config.systemPrompt
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: action === "generate" ? 0.7 : 0.8,
        max_tokens: 2000,
        response_format: {
          type: "json_object"
        }
      })
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json();
      console.error('OpenAI API Error:', error);
      throw new Error(error.error?.message || `OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices[0].message.content;

    console.log("AI Response:", content);

    // Clean possible markdown code blocks
    const cleanedContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsedData = JSON.parse(cleanedContent);

    return new Response(JSON.stringify(parsedData), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : ''
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});