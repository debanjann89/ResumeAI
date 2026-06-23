import mammoth from 'mammoth'
import { getDocumentProxy, extractText as extractPdfText } from 'unpdf'

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    const pdf = await getDocumentProxy(new Uint8Array(buffer))
    const { text } = await extractPdfText(pdf, { mergePages: true })
    return text || ''
  } catch (error) {
    console.error('Error parsing PDF:', error)
    throw new Error('Failed to extract text from PDF resume. Please ensure the file is not corrupted.')
  }
}

export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer })
    return result.value || ''
  } catch (error) {
    console.error('Error parsing DOCX:', error)
    throw new Error('Failed to extract text from DOCX resume. Please ensure the file is not corrupted.')
  }
}

export async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    return extractTextFromPdf(buffer)
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    return extractTextFromDocx(buffer)
  } else {
    throw new Error('Unsupported file format. Please upload a PDF or DOCX file.')
  }
}
