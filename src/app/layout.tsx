import type { Metadata } from "next";
import "./globals.css";
import RefreshButton from "@/components/RefreshButton";
import { Shield, LayoutDashboard, Activity } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CyberPulse | AI-Powered Cyber Intelligence",
  description: "Advanced real-time cybersecurity intelligence and threat analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased overflow-x-hidden">
        {/* Global Background Layer */}
        <div className="fixed inset-0 bg-noise opacity-[0.03] pointer-events-none z-[-1]" />
        
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-[100] w-full border-b border-white/5 bg-[var(--bg-primary)]/70 backdrop-blur-2xl px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative w-10 h-10 bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-blue-500/10">
                  <Shield className="w-5 h-5 text-white relative z-10 group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 cyber-scan opacity-30" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black tracking-tighter text-[var(--text-primary)] leading-none mb-1">CYBERPULSE</span>
                  <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-[var(--accent-cyan)] leading-none">v2.0 Neural Intel</span>
                </div>
              </Link>

              <div className="flex items-center gap-6">
                <nav className="hidden md:flex items-center gap-6">
                  <Link 
                    href="/" 
                    className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[var(--accent-blue)]" />
                    Feed
                  </Link>
                  <div className="h-4 w-px bg-white/10" />
                </nav>
                <RefreshButton />
              </div>
            </div>
          </header>

          <main className="flex-grow relative">
            {children}
          </main>

          <footer className="relative z-10 py-12 px-6 border-t border-white/5 bg-[#050508]">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                    <Shield className="w-4 h-4 text-[var(--text-muted)]" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-[var(--text-primary)] tracking-tight">CyberPulse Intelligence</p>
                    <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Global Defense Network</p>
                  </div>
                </div>

                <div className="flex flex-col items-center md:items-end gap-2">
                  <div className="flex items-center gap-3 px-4 py-2 glass-dark rounded-full border border-white/5">
                    <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-widest">Network Operational</span>
                  </div>
                  <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">© 2026 Secured Transmission</p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

