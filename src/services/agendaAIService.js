// src/services/agendaAIService.js
import { supabase } from '../supabaseClient.js'

export const generateAgendaWithAI = async (formData) => {
  try {
    console.log('Calling Supabase Edge Function with:', formData);
    
    const { data, error } = await supabase.functions.invoke('agenda-generator', {
      body: {
        action: 'generate',
        formData: formData
      }
    });

    console.log('Supabase response:', { data, error });

    if (error) {
      console.error('Supabase Edge Function error:', error);
      throw new Error(`Failed to generate agenda: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data received from Edge Function');
    }

    // If the Edge Function returns an error property
    if (data.error) {
      throw new Error(data.error);
    }

    return data;
    
  } catch (error) {
    console.error('Error in generateAgendaWithAI:', error);
    throw new Error(`Failed to generate agenda: ${error.message}`);
  }
}

export const regenerateAgendaWithAI = async (agendaData) => {
  try {
    console.log('Calling Supabase Edge Function for regeneration:', agendaData);
    
    const { data, error } = await supabase.functions.invoke('agenda-generator', {
      body: {
        action: 'regenerate',
        agendaData: agendaData
      }
    });

    console.log('Supabase regeneration response:', { data, error });

    if (error) {
      console.error('Supabase Edge Function error:', error);
      throw new Error(`Failed to regenerate agenda: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data received from Edge Function');
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
    
  } catch (error) {
    console.error('Error in regenerateAgendaWithAI:', error);
    throw new Error(`Failed to regenerate agenda: ${error.message}`);
  }
}