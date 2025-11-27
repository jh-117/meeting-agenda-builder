// src/services/agendaAIService.js
import { supabase } from '../supabaseClient'

export const generateAgendaWithAI = async (formData, language = 'zh') => {
  try {
    console.log('📋 Form Data being sent:', JSON.stringify(formData, null, 2))
    console.log('🌐 Language:', language)
    
    // Validate formData has required fields
    const requiredFields = ['meetingTitle', 'duration']
    const missingFields = requiredFields.filter(field => !formData[field])
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
    }

    // Ensure duration is a number
    if (typeof formData.duration !== 'number') {
      formData.duration = parseInt(formData.duration, 10)
    }

    const payload = {
      action: 'generate',
      formData: formData,
      language: language
    }

    console.log('📡 Sending payload to Edge Function:', JSON.stringify(payload, null, 2))

    const { data, error } = await supabase.functions.invoke('agenda-generator', {
      body: payload
    })

    if (error) {
      console.error('❌ Edge Function error response:', error)
      
      // Try to extract error details from response body
      let errorDetails = error.message
      if (error.context?.response) {
        try {
          const responseBody = await error.context.response.json()
          console.error('Response body:', responseBody)
          errorDetails = responseBody.error || error.message
        } catch (e) {
          // Response is not JSON, use original message
        }
      }
      
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        details: errorDetails
      })
      throw new Error(`AI生成失败: ${errorDetails}`)
    }

    console.log('✅ Edge Function response:', data)
    return data
  } catch (error) {
    console.error('❌ Error in generateAgendaWithAI:', error)
    throw new Error(`生成议程失败: ${error.message}`)
  }
}

export const regenerateAgendaWithAI = async (agendaData, language = 'zh') => {
  try {
    console.log('📋 Agenda Data being sent:', JSON.stringify(agendaData, null, 2))
    console.log('🌐 Language:', language)

    // Validate agendaData
    if (!agendaData.agendaItems || !Array.isArray(agendaData.agendaItems)) {
      throw new Error('Invalid agendaData: agendaItems must be an array')
    }

    const payload = {
      action: 'regenerate',
      agendaData: agendaData,
      language: language
    }

    console.log('📡 Sending payload to Edge Function:', JSON.stringify(payload, null, 2))

    const { data, error } = await supabase.functions.invoke('agenda-generator', {
      body: payload
    })

    if (error) {
      console.error('❌ Edge Function error response:', error)
      throw new Error(`AI重新生成失败: ${error.message}`)
    }

    console.log('✅ Edge Function regeneration response:', data)
    return data
  } catch (error) {
    console.error('❌ Error in regenerateAgendaWithAI:', error)
    throw new Error(`重新生成议程失败: ${error.message}`)
  }
}

export const regenerateAgendaItemWithAI = async (itemData, context, language = 'zh') => {
  try {
    console.log('📋 Item Data being sent:', JSON.stringify(itemData, null, 2))
    console.log('📋 Context being sent:', JSON.stringify(context, null, 2))
    console.log('🌐 Language:', language)

    // Validate itemData
    if (!itemData.topic) {
      throw new Error('Missing required field: itemData.topic')
    }

    const payload = {
      action: 'regenerate_item',
      itemData: itemData,
      context: context,
      language: language
    }

    console.log('📡 Sending payload to Edge Function:', JSON.stringify(payload, null, 2))

    const { data, error } = await supabase.functions.invoke('agenda-generator', {
      body: payload
    })

    if (error) {
      console.error('❌ Edge Function error response:', error)
      throw new Error(`AI项目重新生成失败: ${error.message}`)
    }

    console.log('✅ Edge Function item regeneration response:', data)
    return data
  } catch (error) {
    console.error('❌ Error in regenerateAgendaItemWithAI:', error)
    throw error
  }
}