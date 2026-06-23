'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Sparkles, 
  Target, 
  Layers, 
  CheckCircle, 
  ArrowRight, 
  UploadCloud, 
  Cpu, 
  TrendingUp, 
  Check, 
  HelpCircle,
  Menu,
  X,
  FileCode,
  Trash2,
  AlertCircle,
  Clock,
  ChevronRight,
  Download,
  XCircle,
  AlertTriangle,
  BookOpen,
  UserCheck,
  Lightbulb,
  Copy,
  ArrowLeft,
  ChevronDown
} from 'lucide-react'
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar
} from 'recharts'
import confetti from 'canvas-confetti'
import { analyzeResumeAction } from './actions/analyze'
import { FullAnalysisResult } from '@/utils/gemini'

export default function AppMain() {
  const [mounted, setMounted] = useState(false)
  const [showPreloader, setShowPreloader] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [isDragActive, setIsDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Loading states
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Report state
  const [report, setReport] = useState<FullAnalysisResult | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  const loadingSteps = [
    "Extracting text from resume file...",
    "Matching keywords against job description...",
    "Running skills gap analysis...",
    "Simulating recruiter evaluation...",
    "Finalizing score calculation..."
  ]

  // Cycle through loading steps during analysis
  useEffect(() => {
    let interval: any
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev))
      }, 2500)
    } else {
      setLoadingStep(0)
    }
    return () => clearInterval(interval)
  }, [loading])

  useEffect(() => {
    setMounted(true)
    const timer = setTimeout(() => {
      setShowPreloader(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  // Trigger celebration on report update if match is strong
  useEffect(() => {
    if (report && report.ats_score >= 75) {
      const duration = 2 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 }

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
      }, 250)
    }
  }, [report])

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  // Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true)
    } else if (e.type === "dragleave") {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    setError(null)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      validateAndSetFile(droppedFile)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const validateAndSetFile = (selectedFile: File) => {
    const allowedExtensions = ['pdf', 'docx']
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase()
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      setError('Invalid file format. Only PDF and DOCX resumes are supported.')
      return
    }
    
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    if (selectedFile.size > MAX_SIZE) {
      setError('File size exceeds 5MB limit. Please upload a smaller resume.')
      return
    }

    setFile(selectedFile)
  }

  const removeFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!file) {
      setError('Please upload your resume file.')
      return
    }

    if (!jobDescription.trim()) {
      setError('Please paste the job description.')
      return
    }

    setLoading(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('jobDescription', jobDescription)

    try {
      const res = await analyzeResumeAction(formData)
      if (res.success && res.report) {
        setReport(res.report)
        // Scroll to report top after animation completes
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 100)
      } else {
        setError(res.error || 'An error occurred during analysis.')
      }
    } catch (err) {
      setError('A network error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 75) return '#10b981' // emerald
    if (score >= 50) return '#f59e0b' // amber
    return '#ef4444' // red
  }

  const getScoreBgClass = (score: number) => {
    if (score >= 75) return 'bg-emerald-50 border-emerald-200 text-emerald-600'
    if (score >= 50) return 'bg-amber-50 border-amber-200 text-amber-600'
    return 'bg-red-50 border-red-200 text-red-600'
  }

  const radarData = report ? [
    { subject: 'Keywords', score: report.keyword_match },
    { subject: 'Skills', score: report.skills_match },
    { subject: 'Experience', score: report.experience_score },
    { subject: 'Formatting', score: report.formatting_score },
    { subject: 'Project Impact', score: report.project_impact },
    { subject: 'Readability', score: report.readability_score },
  ] : []

  const barData = report ? [
    { name: 'Keyword Match', value: report.keyword_match, weight: '30%', fill: '#2563eb' },
    { name: 'Skills Alignment', value: report.skills_match, weight: '20%', fill: '#0ea5e9' },
    { name: 'Experience Relevance', value: report.experience_score, weight: '20%', fill: '#4f46e5' },
    { name: 'ATS Formatting', value: report.formatting_score, weight: '15%', fill: '#10b981' },
    { name: 'Project Impact', value: report.project_impact, weight: '10%', fill: '#db2777' },
    { name: 'Readability Score', value: report.readability_score, weight: '5%', fill: '#06b6d4' },
  ] : []

  const handlePrint = () => {
    window.print()
  }

  const resetScanner = () => {
    setReport(null)
    setFile(null)
    setJobDescription('')
    setError(null)
  }

  const features = [
    {
      icon: <Target className="w-6 h-6 text-blue-600" />,
      title: "Semantic Keyword Match",
      description: "Our AI maps your resume against the job description to find missing terms, synonyms, and skills standard ATS filters look for."
    },
    {
      icon: <Layers className="w-6 h-6 text-sky-600" />,
      title: "Skills Gap Analysis",
      description: "Get a clear breakdown of required credentials vs. your documented experience, pointing out exactly what tech stack is missing."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-indigo-600" />,
      title: "AI Bullet Point Rewriter",
      description: "Instantly rewrite achievements using the Google X-Y-Z formula (Accomplished [X], as measured by [Y], by doing [Z])."
    },
    {
      icon: <Cpu className="w-6 h-6 text-cyan-600" />,
      title: "Recruiter Simulation",
      description: "See your profile through a simulated hiring manager's eyes with detailed screen notes assessing your interview readiness."
    },
    {
      icon: <FileText className="w-6 h-6 text-emerald-600" />,
      title: "Formatting & Structure",
      description: "Check if your layout is parser-safe. Flag multi-columns, complex graphics, tables, or text blocks that trip up scanners."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-pink-600" />,
      title: "Metric Density Check",
      description: "Measure the percentage of quantifiable impact statements in your experience. Learn where to insert numbers to stand out."
    }
  ]

  const faqs = [
    {
      q: "What is an ATS and how does ResumeIQ help?",
      a: "An Applicant Tracking System (ATS) is database software used by MNCs to collect, parse, index, and query resumes. ResumeIQ uses Gemini AI to simulate these parsing algorithms and recruiter search behaviors. It scores your match percentage and highlights missing skills to ensure your resume rises to the top."
    },
    {
      q: "Is my personal data stored or saved?",
      a: "No. ResumeIQ operates on a database-less model. All uploads are processed instantly in-memory on the server to run the AI analysis. Your files are not stored, saved, or shared, keeping your personal career data completely private."
    },
    {
      q: "Does it support both PDF and DOCX files?",
      a: "Yes. You can upload standard PDF (.pdf) and Microsoft Word (.docx) files. The text extraction engine extracts raw text dynamically, checking formatting compliance and structural compatibility."
    },
    {
      q: "How is the ATS Score calculated?",
      a: "The score is computed using weighted career criteria: Keyword Match (30%), Skills alignment (20%), Experience relevance (20%), Formatting compliance (15%), Project metrics (10%), and Readability (5%)."
    }
  ]

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Dynamic Preloader */}
      <AnimatePresence>
        {showPreloader && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 bg-slate-50 flex flex-col items-center justify-center no-print"
          >
            <div className="text-center space-y-6 max-w-xs w-full px-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [0.8, 1.05, 1], opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="relative w-24 h-24 mx-auto"
              >
                <div className="absolute inset-0 rounded-2xl bg-blue-500/10 blur-xl animate-pulse" />
                <img src="/logo.png" alt="ResumeIQ Logo" className="w-24 h-24 rounded-2xl object-contain shadow-xl shadow-blue-500/10 border border-blue-500/10 relative z-10" />
              </motion.div>
              
              <div className="space-y-1.5">
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-xl font-black text-slate-800 tracking-tight"
                >
                  ResumeIQ <span className="text-blue-600">AI</span>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="text-[10px] font-bold uppercase tracking-wider text-slate-400"
                >
                  Smart ATS Matching Engine
                </motion.p>
              </div>

              {/* Premium progress bar */}
              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden relative">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.3, ease: 'easeInOut' }}
                  className="h-full bg-gradient-to-r from-blue-600 to-sky-400 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Dynamic Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md border-b border-blue-500/10 bg-white/70 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <img src="/logo.png" alt="ResumeIQ Logo" className="w-8.5 h-8.5 rounded-xl object-contain shadow-md shadow-blue-500/5 border border-blue-500/10" />
            <span className="text-lg font-black tracking-tight text-slate-800">
              ResumeIQ <span className="text-blue-600 font-semibold">AI</span>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {report ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={resetScanner}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-all flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Analyze Another
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF Report
                </button>
              </div>
            ) : (
              <nav className="hidden sm:flex items-center space-x-6 text-xs font-bold uppercase tracking-wider text-slate-500">
                <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
                <a href="#faq" className="hover:text-blue-600 transition-colors">FAQ</a>
              </nav>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow flex flex-col">
        <AnimatePresence mode="wait">
          {!report ? (
            <motion.div
              key="uploader"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="flex-grow flex flex-col justify-center"
            >
              
              {/* Hero Banner */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6 text-center">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-blue-200 bg-blue-50/50 text-blue-700 text-xs font-bold tracking-wide mb-6 uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" /> Free ATS Checker
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">
                  Optimize Your Resume for <br />
                  <span className="text-gradient">MNC Scanning Systems</span>
                </h1>
                <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto mt-4 leading-relaxed">
                  Upload your resume, paste the target job description, and get instant semantic keywords match and design alignment scoring. 100% private, processed instantly.
                </p>
              </div>

              {/* Upload Form and Information Panel */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Form Card */}
                <div className="lg:col-span-8 glass-card p-6 sm:p-8 rounded-3xl relative overflow-hidden">
                  {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 shadow-sm">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* File Upload Zone */}
                    <div>
                      <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                        1. Upload Resume (PDF or DOCX)
                      </label>
                      
                      {!file ? (
                        <div 
                          onDragEnter={handleDrag}
                          onDragOver={handleDrag}
                          onDragLeave={handleDrag}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                            isDragActive 
                              ? 'border-blue-500 bg-blue-50/50' 
                              : 'border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/10'
                          }`}
                        >
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange}
                            accept=".pdf,.docx" 
                            className="hidden" 
                          />
                          <UploadCloud className="w-10 h-10 text-blue-500/50 mx-auto mb-3" />
                          <p className="text-sm font-bold text-slate-700">Drag & drop your file here, or click to browse</p>
                          <p className="text-xs text-slate-400 mt-1.5">Supports PDF and DOCX formats up to 5MB</p>
                        </div>
                      ) : (
                        <div className="border border-slate-200 bg-slate-50/60 rounded-xl p-4 flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-md">{file.name}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removeFile}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Job Description area */}
                    <div>
                      <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                        2. Target Job Description
                      </label>
                      <textarea
                        required
                        placeholder="Paste the target job requirement or posting description here..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        className="w-full h-56 bg-slate-50/50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all resize-none shadow-inner"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-2xl text-sm font-bold bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 disabled:from-blue-800 disabled:to-sky-800 text-white transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Start AI Resume Match
                    </button>
                  </form>
                </div>

                {/* Pricing / Information Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-blue-500" /> Scoring Metrics
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                      Our system grades resumes using weighted variables identical to MNC recruiters' search requirements:
                    </p>
                    <ul className="space-y-2 text-xs font-semibold text-slate-600">
                      <li className="flex justify-between py-1 border-b border-slate-100">
                        <span>Keyword Match</span>
                        <span className="text-blue-600">30%</span>
                      </li>
                      <li className="flex justify-between py-1 border-b border-slate-100">
                        <span>Skills Alignment</span>
                        <span className="text-blue-600">20%</span>
                      </li>
                      <li className="flex justify-between py-1 border-b border-slate-100">
                        <span>Experience Relevance</span>
                        <span className="text-blue-600">20%</span>
                      </li>
                      <li className="flex justify-between py-1 border-b border-slate-100">
                        <span>ATS Formatting</span>
                        <span className="text-blue-600">15%</span>
                      </li>
                      <li className="flex justify-between py-1 border-b border-slate-100">
                        <span>Project Impact</span>
                        <span className="text-blue-600">10%</span>
                      </li>
                      <li className="flex justify-between py-1">
                        <span>Readability</span>
                        <span className="text-blue-600">5%</span>
                      </li>
                    </ul>
                  </div>

                  <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-blue-50/20 to-sky-50/20 border-blue-100">
                    <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1.5">100% Free</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      This tool is completely free, private, and runs in-memory. Get your ATS match report instantly without saving any personal information.
                    </p>
                  </div>
                </div>

              </div>

              {/* Core Features Overview */}
              <section id="features" className="py-16 bg-white border-y border-slate-100 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Full ATS Compatibility Scan</h2>
                    <p className="text-slate-500 text-sm mt-2">Get a comprehensive analysis targeting all potential resume screening blockers.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                      <div key={idx} className="glass-card p-6 rounded-2xl glass-card-hover flex flex-col justify-between">
                        <div>
                          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6">
                            {feature.icon}
                          </div>
                          <h3 className="text-base font-extrabold text-slate-900 mb-2">{feature.title}</h3>
                          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* FAQ Section */}
              <section id="faq" className="py-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-12">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h2>
                  <p className="text-slate-500 text-sm mt-2">Learn how ResumeIQ simulates MNC hiring algorithms.</p>
                </div>
                <div className="space-y-4">
                  {faqs.map((faq, idx) => {
                    const isOpen = activeFaq === idx
                    return (
                      <div key={idx} className="glass-card rounded-xl border border-slate-100 overflow-hidden">
                        <button
                          onClick={() => setActiveFaq(isOpen ? null : idx)}
                          className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none"
                        >
                          <span className="text-xs sm:text-sm font-bold text-slate-700 pr-4">{faq.q}</span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transform transition-transform ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
                        </button>
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="px-5 pb-4 pt-1 text-slate-500 text-xs sm:text-sm leading-relaxed border-t border-slate-100 bg-slate-50/50">
                                {faq.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              </section>

            </motion.div>
          ) : (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow space-y-8 relative z-10 w-full"
            >
              
              {/* Back CTA area */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200/60 no-print">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">ATS Match Assessment</span>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{file?.name || 'Resume Assessment'}</h1>
                  <p className="text-xs text-slate-400">
                    Generated in-memory on {new Date().toLocaleDateString(undefined, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={resetScanner}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 transition-all flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" /> Analyze Another
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-4 h-4" /> Download PDF Report
                  </button>
                </div>
              </div>

              {/* Print Only Header */}
              <div className="hidden print:block border-b border-slate-300 pb-6 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">ResumeIQ AI ATS Match Report</h1>
                    <p className="text-xs text-slate-500 mt-1">File: {file?.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-blue-600">{report.ats_score}%</span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Overall Score</p>
                  </div>
                </div>
              </div>

              {/* Grid 1: Score & Radar & Text Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Match Score circular */}
                <div className="lg:col-span-4 glass-card p-8 rounded-3xl flex flex-col items-center justify-center text-center print-card">
                  <div className="relative w-44 h-44 flex items-center justify-center">
                    <svg className="w-44 h-44 transform -rotate-90">
                      <circle 
                        cx="88" 
                        cy="88" 
                        r="76" 
                        fill="transparent" 
                        stroke="#e2e8f0" 
                        strokeWidth="8" 
                      />
                      <motion.circle 
                        cx="88" 
                        cy="88" 
                        r="76" 
                        fill="transparent" 
                        stroke={getScoreColor(report.ats_score)} 
                        strokeWidth="8" 
                        strokeDasharray={2 * Math.PI * 76}
                        initial={{ strokeDashoffset: 2 * Math.PI * 76 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 76 * (1 - report.ats_score / 100) }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-5xl font-black text-slate-900 tracking-tight">{report.ats_score}</span>
                      <span className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider mt-0.5">Overall Score</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-1">
                    <p className="text-xs text-slate-400 font-medium">ATS parsing alignment is</p>
                    <p className="text-sm font-extrabold text-slate-800" style={{ color: getScoreColor(report.ats_score) }}>
                      {report.ats_score >= 75 ? 'Ready to Submit' : report.ats_score >= 50 ? 'Recommended to Edit' : 'Critical Gaps Found'}
                    </p>
                  </div>
                </div>

                {/* Recharts Radar chart */}
                <div className="lg:col-span-5 glass-card p-6 rounded-3xl flex flex-col justify-between print-card min-h-[300px]">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">ATS Dimension Breakdown</h3>
                  
                  <div className="w-full h-60 relative">
                    {mounted ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis 
                            dataKey="subject" 
                            stroke="#475569" 
                            tick={{ fill: '#475569', fontSize: 9, fontWeight: 600 }}
                          />
                          <PolarRadiusAxis 
                            angle={30} 
                            domain={[0, 100]} 
                            stroke="#cbd5e1"
                            tick={{ fill: '#94a3b8', fontSize: 8 }}
                          />
                          <Radar 
                            name="Resume Match" 
                            dataKey="score" 
                            stroke={getScoreColor(report.ats_score)} 
                            fill={getScoreColor(report.ats_score)} 
                            fillOpacity={0.2} 
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Loading chart...</div>
                    )}
                  </div>
                </div>

                {/* Score analysis details */}
                <div className="lg:col-span-3 glass-card p-6 rounded-3xl flex flex-col justify-between print-card">
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-blue-500" /> AI Executive Analysis
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Resume Summary</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{report.resume_summary}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Match Overview</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{report.ats_score_explanation}</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Grid 2: Bar Dimension & Missing keywords */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Dimension scores table */}
                <div className="lg:col-span-6 glass-card p-6 rounded-3xl print-card">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-6">Dimension Scores & Weights</h3>
                  
                  <div className="space-y-4">
                    {barData.map((d, index) => (
                      <div key={index} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-600">{d.name} <span className="text-[10px] text-slate-400 font-medium">({d.weight})</span></span>
                          <span className="text-slate-800">{d.value}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
                          <div 
                            className="h-full rounded-full transition-all" 
                            style={{ width: `${d.value}%`, backgroundColor: d.fill }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Missing Keywords Box */}
                <div className="lg:col-span-6 glass-card p-6 rounded-3xl print-card flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500" /> Key Required Terms Missing
                    </h3>
                    <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                      The following key terms and technical skills were detected in the Job Description, but were missing or poorly emphasized on your resume.
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {report.missing_keywords.length === 0 ? (
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                          Excellent! No key missing terms detected.
                        </span>
                      ) : (
                        report.missing_keywords.map((kw, idx) => (
                          <span 
                            key={idx}
                            className="px-3 py-1.5 rounded-xl border border-red-100 bg-red-50 text-red-600 text-xs font-bold"
                          >
                            {kw}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                  
                  {report.missing_keywords.length > 0 && (
                    <p className="text-[10px] text-slate-400 italic mt-6">
                      Tip: Weave these missing terms naturally into your job descriptions or skills index.
                    </p>
                  )}
                </div>

              </div>

              {/* Grid 3: Strengths & Weaknesses checklists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Strengths */}
                <div className="glass-card p-6 sm:p-8 rounded-3xl border-emerald-100 bg-emerald-50/10 print-card">
                  <h3 className="text-sm font-black text-emerald-600 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" /> Match Strengths
                  </h3>
                  
                  <ul className="space-y-4 text-xs sm:text-sm text-slate-600">
                    {report.strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                        <Check className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="glass-card p-6 sm:p-8 rounded-3xl border-red-100 bg-red-50/10 print-card">
                  <h3 className="text-sm font-black text-red-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-400" /> Optimization Gaps
                  </h3>
                  
                  <ul className="space-y-4 text-xs sm:text-sm text-slate-600">
                    {report.weaknesses.map((weak, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                        <AlertTriangle className="w-4.5 h-4.5 text-red-400 shrink-0 mt-0.5" />
                        <span>{weak}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Recruiter Simulated feedback letter */}
              <div className="glass-card p-6 sm:p-8 rounded-3xl print-card relative overflow-hidden">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-600" /> Recruiter Simulated Review Notes
                </h3>

                <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl font-mono text-xs leading-relaxed text-slate-600 print-card">
                  <div className="pb-3 border-b border-slate-200 mb-3 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Hiring Manager Panel Notes</span>
                    <span>Screen Summary</span>
                  </div>
                  <p className="whitespace-pre-line text-xs sm:text-sm leading-relaxed">{report.recruiter_feedback}</p>
                </div>

                {report.interview_readiness && (
                  <div className="mt-6 flex items-start gap-3 bg-blue-50/40 border border-blue-100 p-4 rounded-xl">
                    <Sparkles className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-blue-900">Interview Readiness & Prep Tips</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{report.interview_readiness}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Bullet Point Rewriter */}
              <div className="glass-card p-6 sm:p-8 rounded-3xl print-card">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" /> AI Bullet Point Rewrites (Google X-Y-Z Formula)
                </h3>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  The Google X-Y-Z formula states: Accomplished [X], as measured by [Y], by doing [Z]. Here are suggested rewrites for three statements detected on your resume.
                </p>

                <div className="space-y-6">
                  {report.bullet_point_rewrites.map((rw, index) => (
                    <div 
                      key={index}
                      className="border border-slate-100 bg-slate-50/30 rounded-2xl p-4 sm:p-6 space-y-4 print-card"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Original */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Original Bullet</span>
                          <div className="p-3 bg-white rounded-xl text-xs text-slate-400 leading-relaxed italic border border-slate-200/60 shadow-sm">
                            "{rw.original}"
                          </div>
                        </div>

                        {/* Rewritten */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">AI Quantitative Rewrite</span>
                            <button
                              onClick={() => copyToClipboard(rw.rewritten, index)}
                              className="no-print p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
                              title="Copy Rewrite"
                            >
                              {copiedIndex === index ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <div className="p-3 bg-emerald-50/30 rounded-xl text-xs text-emerald-950 leading-relaxed font-bold border border-emerald-200/60 shadow-sm">
                            "{rw.rewritten}"
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-slate-500 border-t border-slate-100 pt-3 flex items-start gap-1.5">
                        <Lightbulb className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <span><strong>Rationale:</strong> {rw.reason}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggestions checklist */}
              <div className="glass-card p-6 sm:p-8 rounded-3xl print-card">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-600" /> AI Suggestions Checklist
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.suggestions.map((sug, idx) => (
                    <div 
                      key={idx}
                      className="p-4 border border-slate-100 bg-slate-50/30 rounded-2xl flex items-start gap-3"
                    >
                      <div className="w-5 h-5 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-xs text-blue-600 font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{sug}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center pt-4 no-print">
                <button
                  onClick={resetScanner}
                  className="px-8 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Reset and Analyze New Resume
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              {/* Spinner */}
              <div className="absolute inset-0 rounded-full border-2 border-blue-100 border-t-blue-600 animate-spin" />
              <div className="absolute w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                <Cpu className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800">Analyzing Your Resume</h3>
              <p className="text-blue-600 font-semibold text-sm animate-pulse">
                {loadingSteps[loadingStep]}
              </p>
            </div>

            {/* Simulated progress bar */}
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-sky-500 transition-all duration-700" 
                style={{ width: `${(loadingStep + 1) * 20}%` }}
              />
            </div>
            
            <p className="text-xs text-slate-400">
              This can take up to 20 seconds. Please do not close this window.
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-100 bg-slate-50 py-10 text-slate-400 text-sm no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="ResumeIQ Logo" className="w-7 h-7 rounded-lg object-contain border border-blue-500/10 shadow-sm" />
            <span className="font-bold tracking-tight text-slate-700">ResumeIQ AI</span>
          </div>

          <p className="text-xs">&copy; {new Date().getFullYear()} ResumeIQ AI. All rights reserved.</p>

          <div className="flex space-x-6 text-xs text-slate-500">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
