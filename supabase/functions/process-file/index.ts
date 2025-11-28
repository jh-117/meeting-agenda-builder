import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    } 
    else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      // PDF files - using pdfjs-dist
      try {
        const pdfjs = await import('https://esm.sh/pdfjs-dist@3.11.174')
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
        let text = ''
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()
          text += textContent.items.map(item => item.str).join(' ') + '\n'
        }
        extractedText = text
      } catch (pdfError) {
        console.error('PDF processing failed:', pdfError)
        extractedText = `[PDF file: ${fileName} - Unable to extract text]`
      }
    } 
    else if (fileType.includes('word') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
      // Word documents
      try {
        const mammoth = await import('https://esm.sh/mammoth@1.6.0')
        const result = await mammoth.extractRawText({ arrayBuffer })
        extractedText = result.value
      } catch (docError) {
        console.error('Word processing failed:', docError)
        extractedText = `[Word file: ${fileName} - Unable to extract text]`
      }
    } 
    else if (fileType.includes('presentation') || 
             fileName.endsWith('.ppt') || 
             fileName.endsWith('.pptx')) {
      // PowerPoint presentations
      try {
        const pptx = await import('https://esm.sh/pptxjs@0.0.11')
        const presentation = new pptx.default()
        await presentation.load(arrayBuffer)
        let text = ''
        presentation.getShapes().forEach(shape => {
          if (shape.text) {
            text += shape.text + '\n'
          }
        })
        extractedText = text || `[PowerPoint file: ${fileName} - No text found]`
      } catch (pptError) {
        console.error('PowerPoint processing failed:', pptError)
        extractedText = `[PowerPoint file: ${fileName} - Unable to extract text]`
      }
    } 
    else if (fileType.includes('image') || 
             fileName.endsWith('.jpg') || 
             fileName.endsWith('.jpeg') || 
             fileName.endsWith('.png') ||
             fileName.endsWith('.gif')) {
      // Images - use OCR with Tesseract
      try {
        const tesseract = await import('https://esm.sh/tesseract.js@4.1.1')
        const { createWorker } = tesseract.default
        
        const worker = await createWorker('eng')
        const { data: { text } } = await worker.recognize(uint8Array)
        await worker.terminate()
        extractedText = text || `[Image file: ${fileName} - No text detected]`
      } catch (ocrError) {
        console.error('OCR processing failed:', ocrError)
        extractedText = `[Image file: ${fileName} - OCR not available]`
      }
    } 
    else if (fileType.includes('sheet') || 
             fileName.endsWith('.xls') || 
             fileName.endsWith('.xlsx')) {
      // Excel/Sheets
      try {
        const XLSX = await import('https://esm.sh/xlsx@0.18.5')
        const workbook = XLSX.default.read(arrayBuffer, { type: 'array' })
        let text = ''
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName]
          const csvData = XLSX.default.utils.sheet_to_csv(worksheet)
          text += `Sheet: ${sheetName}\n${csvData}\n`
        })
        extractedText = text
      } catch (excelError) {
        console.error('Excel processing failed:', excelError)
        extractedText = `[Excel file: ${fileName} - Unable to extract data]`
      }
    } 
    else {
      extractedText = `[File: ${fileName}] - Content type: ${fileType} - Not supported for AI processing`
    }
    
    console.log('Extracted text length:', extractedText.length)
    
    return new Response(
      JSON.stringify({
        success: true,
        extractedText: extractedText.substring(0, 15000), // Increased limit to 15k chars
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
