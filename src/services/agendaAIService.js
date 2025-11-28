// src/services/agendaAIService.js
import { supabase } from '../supabaseClient'

// Process file and extract text
export const processFileWithAI = async (fileUrl, fileName, fileType) => {
  try {
    console.log('📡 Processing file with AI...', { fileName, fileType });
    const { data, error } = await supabase.functions.invoke('process-file', {
      body: {
        fileUrl,
        fileName,
        fileType
      }
    });
    if (error) {
      console.error('❌ File processing error:', error);
      throw new Error(`File processing failed: ${error.message}`);
    }
    console.log('✅ File processing response:', data);
    return data;
    
  } catch (error) {
    console.error('❌ Error in processFileWithAI:', error);
    throw new Error(`Failed to process file: ${error.message}`);
  }
}

export const generateAgendaWithAI = async (formData, language = 'zh', attachmentContent = null, attachmentType = null) => {
  try {
    console.log('📡 Calling Edge Function via Supabase client...', { 
      language, 
      hasAttachment: !!attachmentContent,
      attachmentType 
    });
    
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
    console.log('📡 Calling Edge Function for regeneration...', { 
      language, 
      hasAttachment: !!attachmentContent,
      attachmentType 
    });
    
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

// 单个议程项重新生成
export const regenerateAgendaItemWithAI = async (itemData, context, language = 'zh', attachmentContent = null, attachmentType = null) => {
  try {
    console.log('📡 Regenerating single agenda item...', { 
      language, 
      hasAttachment: !!attachmentContent,
      attachmentType 
    });
    
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