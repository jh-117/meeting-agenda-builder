// src/services/agendaAIService.js
import { supabase } from '../supabaseClient'

export const generateAgendaWithAI = async (formData, language = 'zh') => {
  try {
    console.log('📡 Calling Edge Function via Supabase client...', { language });
    
    const { data, error } = await supabase.functions.invoke('agenda-generator', {
      body: {
        action: 'generate',
        formData: formData,
        language: language // 传递语言参数
      }
    });

    if (error) {
      console.error('❌ Edge Function error:', error);
      throw new Error(`AI生成失败: ${error.message}`);
    }

    console.log('✅ Edge Function response:', data);
    return data;
    
  } catch (error) {
    console.error('❌ Error in generateAgendaWithAI:', error);
    throw new Error(`生成议程失败: ${error.message}`);
  }
}

export const regenerateAgendaWithAI = async (agendaData, language = 'zh') => {
  try {
    console.log('📡 Calling Edge Function for regeneration...', { language });
    
    const { data, error } = await supabase.functions.invoke('agenda-generator', {
      body: {
        action: 'regenerate',
        agendaData: agendaData,
        language: language // 传递语言参数
      }
    });

    if (error) {
      console.error('❌ Edge Function error:', error);
      throw new Error(`AI重新生成失败: ${error.message}`);
    }

    console.log('✅ Edge Function regeneration response:', data);
    return data;
    
  } catch (error) {
    console.error('❌ Error in regenerateAgendaWithAI:', error);
    throw new Error(`重新生成议程失败: ${error.message}`);
  }
}

// 单个议程项重新生成
export const regenerateAgendaItemWithAI = async (itemData, context, language = 'zh') => {
  try {
    console.log('📡 Regenerating single agenda item...', { language });
    
    const { data, error } = await supabase.functions.invoke('agenda-generator', {
      body: {
        action: 'regenerate_item',
        itemData: itemData,
        context: context,
        language: language
      }
    });

    if (error) throw error;
    return data;
    
  } catch (error) {
    console.error('❌ Error in regenerateAgendaItemWithAI:', error);
    throw error;
  }
}