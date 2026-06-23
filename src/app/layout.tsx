import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ResumeIQ AI - Beat the ATS, Land More Interviews",
  description: "Upload your resume, match it against any job description, and receive recruiter-grade ATS insights powered by AI.",
  keywords: ["ATS resume checker", "ATS optimization", "AI resume builder", "resume scorer", "skills gap analysis"],
  openGraph: {
    title: "ResumeIQ AI - Beat the ATS, Land More Interviews",
    description: "Get recruiter-grade ATS insights and score evaluations powered by Gemini AI.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeIQ AI - Beat the ATS, Land More Interviews",
    description: "Match your resume against any job description with instant AI feedback.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans min-h-full flex flex-col antialiased bg-slate-50 text-slate-900`}
      >
        <div className="relative w-full overflow-hidden min-h-screen flex flex-col">
          {/* Global Ambient Background Glows */}
          <div className="glow-bg glow-purple top-[-10%] left-[-15%] no-print" />
          <div className="glow-bg glow-blue top-[25%] right-[-15%] no-print" />
          <div className="glow-bg glow-blue bottom-[-10%] left-[15%] no-print" />
          
          <main className="relative z-10 flex-grow flex flex-col">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
