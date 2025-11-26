// services/agendaAIService.js
// 这个文件用来调用AI生成议程

import { createClient } from '@supabase/supabase-js';

// 初始化 Supabase 客户端（连接到存放secret的project）
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL, // 别的project的URL
  process.env.REACT_APP_SUPABASE_ANON_KEY // 别的project的anon key
);

/**
 * 从 Supabase 获取 OpenAI API Key
 */
async function getOpenAIApiKey() {
  try {
    const { data, error } = await supabase
      .from('secrets')
      .select('value')
      .eq('name', 'OPENAI_API_KEY')
      .single();

    if (error) throw error;
    return data.value;
  } catch (error) {
    console.error('Failed to fetch OpenAI API key:', error);
    throw new Error('无法获取API密钥');
  }
}

/**
 * 调用 OpenAI 生成议程
 */
async function generateAgendaWithAI(formData) {
  try {
    const apiKey = await getOpenAIApiKey();

    // 构建提示词
    const prompt = `You are a professional meeting agenda generator. Based on the following meeting information, generate a detailed and well-structured agenda.

Meeting Information:
- Title: ${formData.meetingTitle}
- Date: ${formData.meetingDate}
- Time: ${formData.meetingTime}
- Duration: ${formData.duration} minutes
- Location: ${formData.location}
- Meeting Type: ${formData.meetingType}
- Facilitator: ${formData.facilitator}
- Attendees: ${formData.attendees || 'Not specified'}
- Objective: ${formData.meetingObjective}
${formData.additionalInfo ? `- Additional Info: ${formData.additionalInfo}` : ''}

Please generate a JSON response with the following structure (return ONLY valid JSON):
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
  ],
  "suggestedNotes": "string (any important notes or tips for this meeting)"
}

Generate between 4-8 agenda items based on the meeting duration. Distribute time proportionally.`;

    // 调用 OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // 清理可能的 markdown 代码块
    const cleanedContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsedData = JSON.parse(cleanedContent);

    // 为议程项添加 ID
    const agendaItemsWithId = parsedData.agendaItems.map((item, index) => ({
      ...item,
      id: `agenda-${Date.now()}-${index}`,
    }));

    return {
      ...parsedData,
      agendaItems: agendaItemsWithId,
    };
  } catch (error) {
    console.error('Error generating agenda with AI:', error);
    throw error;
  }
}

/**
 * 重新生成议程（用于编辑器中的重新生成功能）
 */
async function regenerateAgendaWithAI(agendaData) {
  try {
    const apiKey = await getOpenAIApiKey();

    const prompt = `You are a professional meeting agenda generator. Please regenerate the agenda items with a different approach or perspective.

Current agenda items:
${agendaData.agendaItems.map(item => `- ${item.topic} (${item.timeAllocation}min) - ${item.description}`).join('\n')}

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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    const cleanedContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsedData = JSON.parse(cleanedContent);

    const agendaItemsWithId = parsedData.agendaItems.map((item, index) => ({
      ...item,
      id: `agenda-${Date.now()}-${index}`,
    }));

    return {
      ...parsedData,
      agendaItems: agendaItemsWithId,
    };
  } catch (error) {
    console.error('Error regenerating agenda:', error);
    throw error;
  }
}

export { generateAgendaWithAI, regenerateAgendaWithAI };