// src/services/agendaAIService.js (Supabase version)
import { supabase } from '../supabaseClient.js'

export const generateAgendaWithAI = async (formData) => {
  try {
    console.log('Calling Supabase Edge Function with:', formData);
    
    const { data, error } = await supabase.functions.invoke('agenda-generator', {
      body: {
        action: 'generate',
        formData: formData
      }
    })

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Edge Function response:', data);
    return data;
    
  } catch (error) {
    console.error('Error in generateAgendaWithAI:', error);
    throw new Error('Failed to generate agenda: ' + error.message);
  }
}

export const regenerateAgendaWithAI = async (agendaData) => {
  try {
    const { data, error } = await supabase.functions.invoke('agenda-generator', {
      body: {
        action: 'regenerate', 
        agendaData: agendaData
      }
    })

    if (error) throw error;
    return data;
    
  } catch (error) {
    console.error('Error in regenerateAgendaWithAI:', error);
    throw new Error('Failed to regenerate agenda: ' + error.message);
  }
}