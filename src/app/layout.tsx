import type { Metadata } from "next";
import "./globals.css";
import RefreshButton from "@/components/RefreshButton";
import { Shield } from "lucide-react";

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
      <body className="bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased">
        <div className="min-h-screen flex flex-col bg-grid-pattern">
          <header className="sticky top-0 z-50 bg-[var(--bg-secondary)]/90 backdrop-blur-xl border-b border-[var(--border-primary)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] rounded-xl flex items-center justify-center overflow-hidden">
                  <Shield className="w-5 h-5 text-white relative z-10" />
                  <div className="absolute inset-0 cyber-scan" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold tracking-tight text-[var(--text-primary)]">CyberPulse</span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent-cyan)]">Intelligence Platform</span>
                </div>
              </div>
              <nav className="flex items-center gap-4">
                <a 
                  href="/" 
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-card)]/50 hover:bg-[var(--bg-card)] border border-transparent hover:border-[var(--border-primary)] rounded-lg transition-all duration-200"
                >
                  Dashboard
                </a>
                <RefreshButton />
              </nav>
            </div>
          </header>
          <main className="flex-grow">
            {children}
          </main>
          <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-primary)] py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] rounded-md flex items-center justify-center">
                    <Shield className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-[var(--text-secondary)]">CyberPulse</span>
                </div>
                <p className="text-xs font-mono text-[var(--text-muted)]">© 2026 · Production-ready Cyber Intelligence</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-[var(--severity-low)] rounded-full animate-pulse" />
                  <span className="text-xs font-mono text-[var(--text-muted)]">All Systems Operational</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
