// services/agendaAIService.js
// 使用 Supabase Edge Function 来访问 secret

/**
 * 调用 Supabase Edge Function 生成议程
 * Edge Function 会从 Secret 中获取 OpenAI API Key
 */
async function generateAgendaWithAI(formData) {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    if (!supabaseUrl) {
      throw new Error('Supabase URL 未配置');
    }

    // 调用你的 Edge Function
    const response = await fetch(
      `${supabaseUrl}/functions/v1/agenda-generator`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate',
          formData,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Edge Function error');
    }

    const data = await response.json();

    // 为议程项添加 ID
    const agendaItemsWithId = data.agendaItems.map((item, index) => ({
      ...item,
      id: `agenda-${Date.now()}-${index}`,
    }));

    return {
      ...data,
      agendaItems: agendaItemsWithId,
    };
  } catch (error) {
    console.error('Error generating agenda with AI:', error);
    throw error;
  }
}

/**
 * 重新生成议程
 */
async function regenerateAgendaWithAI(agendaData) {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    if (!supabaseUrl) {
      throw new Error('Supabase URL 未配置');
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/agenda-generator`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'regenerate',
          agendaData,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Edge Function error');
    }

    const data = await response.json();

    const agendaItemsWithId = data.agendaItems.map((item, index) => ({
      ...item,
      id: `agenda-${Date.now()}-${index}`,
    }));

    return {
      ...data,
      agendaItems: agendaItemsWithId,
    };
  } catch (error) {
    console.error('Error regenerating agenda:', error);
    throw error;
  }
}

export { generateAgendaWithAI, regenerateAgendaWithAI };