import { supabase } from '../supabaseClient.js'

export const generateAgendaWithAI = async (formData) => {
  try {
    const { data, error } = await supabase.functions.invoke('agenda-generator', {
      body: {
        action: 'generate',
        formData: formData
      }
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error generating agenda with AI:', error)
    throw new Error('Failed to generate agenda: ' + error.message)
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

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error regenerating agenda with AI:', error)
    throw new Error('Failed to regenerate agenda: ' + error.message)
  }
}