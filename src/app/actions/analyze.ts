'use server'

import { extractText } from '@/utils/parser'
import { analyzeResume } from '@/utils/gemini'

export async function analyzeResumeAction(formData: FormData) {
  try {
    const file = formData.get('file') as File | null
    const jobDescription = formData.get('jobDescription') as string | null

    if (!file) {
      return { success: false, error: 'Please upload a resume file.' }
    }

    if (!jobDescription || jobDescription.trim().length === 0) {
      return { success: false, error: 'Please enter a job description to match against.' }
    }

    // Enforce file size limit (5MB)
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return { success: false, error: 'Resume file size must be less than 5MB.' }
    }

    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ]
    if (!allowedMimeTypes.includes(file.type)) {
      return { success: false, error: 'Invalid file format. Only PDF and DOCX files are allowed.' }
    }

    // 1. Extract text from the uploaded file
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    let resumeText = ''
    try {
      resumeText = await extractText(fileBuffer, file.type)
    } catch (parseErr: any) {
      return { success: false, error: parseErr.message || 'Failed to extract text from resume.' }
    }

    if (!resumeText || resumeText.trim().length < 50) {
      return {
        success: false,
        error: 'The uploaded file does not contain enough extractable text. Please ensure it is not a scanned image.',
      }
    }

    // 2. Perform Gemini semantic analysis
    let analysisResult
    try {
      analysisResult = await analyzeResume(resumeText, jobDescription)
    } catch (aiErr: any) {
      console.error('Gemini Analysis Error:', aiErr)
      return {
        success: false,
        error: aiErr.message || 'The AI engine encountered an error. Please try again in a few moments.',
      }
    }

    // Return the report JSON directly
    return { success: true, report: analysisResult }
  } catch (err: any) {
    console.error('Unhandled action error:', err)
    return { success: false, error: err.message || 'An unexpected error occurred during analysis.' }
  }
}
