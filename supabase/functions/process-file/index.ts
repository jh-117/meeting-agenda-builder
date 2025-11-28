import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fileUrl, fileName, fileType } = await req.json()

    console.log('Processing file:', { fileName, fileType, fileUrl })

    // Download the file
    const response = await fetch(fileUrl)
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    let extractedText = ''

    // Process different file types
    if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      // Text files
      extractedText = new TextDecoder().decode(uint8Array)
    } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      // PDF files
      const pdf2text = await import('https://esm.sh/pdf2text@0.1.1')
      const pdfText = await pdf2text.extract(arrayBuffer)
      extractedText = pdfText.text
    } else if (fileType.includes('word') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
      // Word documents
      const mammoth = await import('https://esm.sh/mammoth@1.6.0')
      const result = await mammoth.extractRawText({ arrayBuffer })
      extractedText = result.value
    } else if (fileType.includes('image') || 
               fileName.endsWith('.jpg') || 
               fileName.endsWith('.jpeg') || 
               fileName.endsWith('.png')) {
      // Images - use OCR
      const tesseract = await import('https://esm.sh/tesseract.js@4.1.1')
      const { createWorker } = tesseract
      
      const worker = await createWorker('eng') // You can add more languages
      const { data: { text } } = await worker.recognize(uint8Array)
      await worker.terminate()
      extractedText = text
    } else {
      extractedText = `[File: ${fileName}] - Content type: ${fileType}`
    }

    console.log('Extracted text length:', extractedText.length)

    return new Response(
      JSON.stringify({
        success: true,
        extractedText: extractedText.substring(0, 10000), // Limit to 10k chars
        fileName,
        fileType
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )

  } catch (error) {
    console.error('Error processing file:', error)

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        extractedText: `[Error processing file: ${error.message}]`
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})