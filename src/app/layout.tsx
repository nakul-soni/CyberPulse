import type { Metadata } from "next";
import "./globals.css";
import RefreshButton from "@/components/RefreshButton";
import { Shield, Radio, Activity, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "CyberPulse | AI-Powered Cyber Intelligence",
  description: "Actionable cybersecurity intelligence for daily use.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased selection:bg-[var(--accent-blue)] selection:text-white">
        <div className="fixed inset-0 bg-noise pointer-events-none z-[9999]" />
        <div className="fixed inset-0 bg-grid-pattern pointer-events-none opacity-40" />
        
        <div className="relative min-h-screen flex flex-col">
          <header className="sticky top-0 z-50 border-b border-white/[0.05] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="group relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                  <div className="relative w-10 h-10 bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-secondary)] border border-white/10 rounded-xl flex items-center justify-center overflow-hidden">
                    <Shield className="w-5 h-5 text-[var(--accent-blue)] relative z-10" />
                    <div className="absolute inset-0 cyber-scan opacity-30" />
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-lg font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40">
                    CYBER<span className="text-[var(--accent-blue)]">PULSE</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--text-muted)] leading-none">
                      Intelligence Ops
                    </span>
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[var(--severity-low)]/10 border border-[var(--severity-low)]/20">
                      <div className="w-1 h-1 bg-[var(--severity-low)] rounded-full animate-pulse" />
                      <span className="text-[8px] font-bold text-[var(--severity-low)] uppercase tracking-tighter">Live</span>
                    </div>
                  </div>
                </div>
              </div>

              <nav className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-6 mr-6 border-r border-white/10 pr-6">
                  <a href="/" className="text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors">Dashboard</a>
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] cursor-not-allowed opacity-50">Global Map</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] cursor-not-allowed opacity-50">Reports</span>
                </div>
                <RefreshButton />
              </nav>
            </div>
          </header>

          <main className="flex-grow relative z-10">
            {children}
          </main>

          <footer className="relative z-10 bg-[var(--bg-secondary)] border-t border-white/[0.05] pt-12 pb-8 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-[var(--accent-blue)]/20 to-transparent" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-[var(--accent-blue)]" />
                    <span className="text-sm font-bold tracking-tighter">CYBERPULSE</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-sm">
                    Empowering organizations with real-time, AI-driven cybersecurity intelligence. 
                    Converting raw threat data into actionable defensive strategies.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-4">Platform</h4>
                  <ul className="space-y-2">
                    <li><a href="#" className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-blue)] transition-colors">API Documentation</a></li>
                    <li><a href="#" className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-blue)] transition-colors">Integration Guide</a></li>
                    <li><a href="#" className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-blue)] transition-colors">Network Status</a></li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-4">Resources</h4>
                  <ul className="space-y-2">
                    <li><a href="#" className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-blue)] transition-colors">Threat Reports</a></li>
                    <li><a href="#" className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-blue)] transition-colors">Security Blog</a></li>
                    <li><a href="#" className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-blue)] transition-colors">Research Paper</a></li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-white/[0.05]">
                <div className="flex items-center gap-4">
                  <p className="text-[10px] font-mono text-[var(--text-muted)]">© 2026 CYBERPULSE INTEL OPS</p>
                  <span className="text-white/10 text-xs">•</span>
                  <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">v2.4.0-PROD</p>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[var(--severity-low)] rounded-full animate-pulse shadow-[0_0_8px_var(--severity-low)]" />
                    <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase">System Nominal</span>
                  </div>
                  <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                    <Globe className="w-3.5 h-3.5 text-[var(--text-muted)] hover:text-white cursor-pointer transition-colors" />
                    <Radio className="w-3.5 h-3.5 text-[var(--text-muted)] hover:text-white cursor-pointer transition-colors" />
                    <Activity className="w-3.5 h-3.5 text-[var(--text-muted)] hover:text-white cursor-pointer transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
