// src/services/agendaAIService.js
import { supabase } from '../supabaseClient'

export const generateAgendaWithAI = async (formData, language = 'zh', attachmentContent = null, attachmentType = null) => {
  try {
    console.log('📡 Calling Edge Function via Supabase client...', { language, hasAttachment: !!attachmentContent });
    
    const { data, error } = await supabase.functions.invoke('agenda-generator', {
      body: {
        action: 'generate',
        formData: formData,
        language: language,
        attachmentContent: attachmentContent,
        attachmentType: attachmentType
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

export const regenerateAgendaWithAI = async (agendaData, language = 'zh', attachmentContent = null, attachmentType = null) => {
  try {
    console.log('📡 Calling Edge Function for regeneration...', { language, hasAttachment: !!attachmentContent });
    
    const { data, error } = await supabase.functions.invoke('agenda-generator', {
      body: {
        action: 'regenerate',
        agendaData: agendaData,
        language: language,
        attachmentContent: attachmentContent,
        attachmentType: attachmentType
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

// 单个议程项重新生成 - 更新以支持附件
export const regenerateAgendaItemWithAI = async (itemData, context, language = 'zh', attachmentContent = null, attachmentType = null) => {
  try {
    console.log('📡 Regenerating single agenda item...', { language, hasAttachment: !!attachmentContent });
    
    const { data, error } = await supabase.functions.invoke('agenda-generator', {
      body: {
        action: 'regenerate_item',
        itemData: itemData,
        context: context,
        language: language,
        attachmentContent: attachmentContent,
        attachmentType: attachmentType
      }
    });

    if (error) throw error;
    return data;
    
  } catch (error) {
    console.error('❌ Error in regenerateAgendaItemWithAI:', error);
    throw error;
  }
}