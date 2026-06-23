import { GoogleGenerativeAI } from '@google/generative-ai'

export interface AnalysisReportJSON {
  keyword_match: number;       // 0-100
  skills_match: number;        // 0-100
  experience_score: number;    // 0-100
  formatting_score: number;    // 0-100
  project_impact: number;      // 0-100
  readability_score: number;   // 0-100
  resume_summary: string;
  ats_score_explanation: string;
  strengths: string[];
  weaknesses: string[];
  missing_keywords: string[];
  suggestions: string[];
  recruiter_feedback: string;
  bullet_point_rewrites: { original: string; rewritten: string; reason: string }[];
  interview_readiness: string;
}

export interface FullAnalysisResult extends AnalysisReportJSON {
  ats_score: number;
}

export async function analyzeResume(
  resumeText: string,
  jobDescription: string
): Promise<FullAnalysisResult> {
  const rawApiKey = process.env.GEMINI_API_KEY
  if (!rawApiKey || rawApiKey === 'your_gemini_api_key_here') {
    throw new Error('Gemini API key is not configured. Please add GEMINI_API_KEY in your .env.local file.')
  }

  // Clean leading/trailing quotes from the API Key if present
  const apiKey = rawApiKey.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '')

  const genAI = new GoogleGenerativeAI(apiKey)
  // Use gemini-2.5-flash (active and supported for this key)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  })

  const prompt = `
You are a senior technical recruiter and ATS (Applicant Tracking System) algorithm.
Your task is to analyze the candidate's resume text and compare it with the provided job description.
Perform a deep semantic analysis and return a structured JSON object containing evaluation scores, strengths, weaknesses, gaps, recruiter feedback, and improvement rewrites.

Resume Text:
"""
${resumeText}
"""

Job Description:
"""
${jobDescription}
"""

You must return a JSON object that strictly adheres to the following TypeScript interface schema:
interface Response {
  keyword_match: number;       // 0-100, representing keyword match percentage based on the job description
  skills_match: number;        // 0-100, representing alignment of hard and soft skills
  experience_score: number;    // 0-100, representing the relevance and quality of work history
  formatting_score: number;    // 0-100, assessing standard ATS-friendly structure (sections, layout issues, missing info)
  project_impact: number;      // 0-100, assessing quantitative impact and metrics in projects/experience
  readability_score: number;   // 0-100, assessing tone, word choice, clarity, and grammatical issues
  resume_summary: string;      // A concise (2-3 sentences) professional summary of the candidate based on the resume
  ats_score_explanation: string; // A 2-3 sentence overview explaining how the candidate scores and major blockers
  strengths: string[];         // 3-4 bullet points highlighting where the candidate matches perfectly
  weaknesses: string[];        // 3-4 bullet points highlighting gaps or concerns in the resume
  missing_keywords: string[];   // A list of 5-10 key terms/skills from the Job Description that are missing/underrepresented
  suggestions: string[];       // 3-5 concrete suggestions to improve the overall match
  recruiter_feedback: string;  // Detailed simulated review written from the perspective of a hiring manager (150-250 words)
  bullet_point_rewrites: {     // 3 examples of weak bullet points from the resume, rewritten to show action + quantitative impact
    original: string;
    rewritten: string;
    reason: string;
  }[];
  interview_readiness: string; // Evaluation of how ready the candidate is for an interview based on the match, plus 1-2 prep tips
}

Ensure the numeric scores are realistic and NOT random.
If the resume is a poor match, scores should reflect that (e.g. 40-60). If it is a great match, scores should be high (e.g. 80-95).
Provide a fully filled out JSON object. Do not include markdown code block backticks (e.g., \`\`\`json) in the response. Return raw JSON text only.
`

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    
    if (!text) {
      throw new Error('Empty response received from Gemini API.')
    }

    const data = JSON.parse(text) as AnalysisReportJSON

    // Compute realistic weighted ATS Score out of 100
    // Keyword Match = 30%
    // Skills Match = 20%
    // Experience Relevance = 20%
    // ATS Formatting = 15%
    // Project Impact = 10%
    // Readability = 5%
    const ats_score = Math.round(
      (data.keyword_match ?? 0) * 0.30 +
      (data.skills_match ?? 0) * 0.20 +
      (data.experience_score ?? 0) * 0.20 +
      (data.formatting_score ?? 0) * 0.15 +
      (data.project_impact ?? 0) * 0.10 +
      (data.readability_score ?? 0) * 0.05
    )

    return {
      ...data,
      ats_score,
    }
  } catch (error) {
    console.error('Error in Gemini analysis:', error)
    throw new Error('Gemini API analysis failed. Ensure your API key is valid and the text contents are readable.')
  }
}
