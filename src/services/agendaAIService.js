// src/services/agendaAIService.js (temporary direct fetch version)

const SUPABASE_URL = 'https://ygblsastopstzgamuzht.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnYmxzYXN0b3BzdHpnYW11emh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4ODI3NTcsImV4cCI6MjA3OTQ1ODc1N30.rwHV_otkBu80G3t1jkDWKmPxZrpV6aD-PK3XprofUKc'

export const generateAgendaWithAI = async (formData) => {
  try {
    console.log('📡 Calling Edge Function directly...');
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/agenda-generator`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'generate',
        formData: formData
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Edge Function response:', data);
    return data;
    
  } catch (error) {
    console.error('❌ Error in generateAgendaWithAI:', error);
    throw new Error(`Failed to generate agenda: ${error.message}`);
  }
}

export const regenerateAgendaWithAI = async (agendaData) => {
  try {
    console.log('📡 Calling Edge Function for regeneration...');
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/agenda-generator`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'regenerate',
        agendaData: agendaData
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Edge Function regeneration response:', data);
    return data;
    
  } catch (error) {
    console.error('❌ Error in regenerateAgendaWithAI:', error);
    throw new Error(`Failed to regenerate agenda: ${error.message}`);
  }
}