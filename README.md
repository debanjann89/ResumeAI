# ResumeIQ AI — Next-Gen ATS Resume Optimizer

<div align="center">
  <img src="public/logo.png" alt="ResumeIQ AI Logo" width="120" height="120" style="border-radius: 24px; margin-bottom: 20px; box-shadow: 0 8px 30px rgba(37,99,235,0.15);" />
  <h3>Optimize Your Resume for MNC Screening Systems — 100% Free, Private, and Instant</h3>
  
  [![Next.js Version](https://img.shields.io/badge/next.js-v16.2.7-blue.svg?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/tailwind_css-v4.0-38bdf8.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
  [![Gemini 2.5 Flash](https://img.shields.io/badge/AI_Engine-Gemini_2.5_Flash-9333ea.svg?logo=google&logoColor=white)](https://ai.google.dev/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
</div>

---

**ResumeIQ AI** is a premium, lightweight single-page SaaS utility designed to bridge the gap between job seekers and Applicant Tracking Systems (ATS). By replacing legacy, rigid keyword-counting check filters with context-aware semantic parsing powered by Google's state-of-the-art **Gemini 2.5 Flash** model, ResumeIQ provides candidates with objective, multi-dimensional alignment evaluations.

It operates on a strict **zero-retention, database-less architecture**, extracting resume text in-memory on the server and clearing all data immediately upon report generation.

---

## ⚡ Core Features

- 🎯 **Semantic Keyword Match:** Uses LLM semantic understanding to detect concept-level alignments, synonyms, and engineering credentials rather than word-for-word string match.
- 📊 **Dynamic Radar Visualizations:** Maps resume competencies across six primary hiring dimensions using Recharts.
- ✍️ **Google X-Y-Z Bullet Point Rewriter:** Evaluates resume achievements and rewrites bullet points into high-impact, metric-driven statements (*Accomplished [X], as measured by [Y], by doing [Z]*).
- 💬 **Recruiter Simulation Screen:** Generates simulated hiring manager feedback and interview readiness preparation tips.
- 🔒 **Zero Data Retention:** No databases, no storage buckets, no user accounts. Your data exists purely in volatile server memory for the duration of the analysis.
- 🖨️ **Print-to-PDF Friendly:** High-contrast `@media print` styling formats the complete match report beautifully into standard A4 vectors for offline review.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 & custom light-mode glassmorphic utility rules
- **AI Core:** Google Generative AI (`gemini-2.5-flash` with JSON Schemas)
- **Document Parsers:** `unpdf` (serverless PDF extraction) & `mammoth` (DOCX extraction)
- **Charts:** Recharts (Interactive Radar charts)
- **Animations:** Framer Motion (Transitions) & Canvas Confetti

---

## 📐 Scoring Architecture

The overall ATS Match Score is a weighted index calculated from six distinct evaluative dimensions:

| Dimension | Weight | Focus Area |
| :--- | :--- | :--- |
| **Keyword Match** | 30% | Semantic alignment of core tools, concepts, and requirements |
| **Skills Alignment** | 20% | Density of technical hard skills and soft competencies |
| **Experience Relevance** | 20% | Seniority mapping, past roles, and scope of responsibilities |
| **ATS Formatting** | 15% | Identifying layout blockers (text boxes, columns, tables, images) |
| **Project Impact** | 10% | Percentage of bullet points containing quantitative metrics |
| **Readability Score** | 5% | Sentence flows, spacing, grammar, and tone |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v20+ recommended).

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/debanjann89/ResumeAI.git
   cd ResumeAI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add your Gemini API Key:
   ```env
   GEMINI_API_KEY="your_google_gemini_api_key_here"
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

5. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 📖 Manifesto & Whitepaper

A comprehensive manifesto detailing modern ATS challenges, parsing constraints, and developer data privacy is available in the repository at **[ResumeIQ_Documentation.pdf](ResumeIQ_Documentation.pdf)**.

## 📄 License

This project is licensed under the MIT License.
