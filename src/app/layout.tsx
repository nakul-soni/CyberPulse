import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RefreshButton from "@/components/RefreshButton";

const inter = Inter({
  subsets: ["latin"],
});

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
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}>
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin-slow" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">CyberPulse</span>
              </div>
              <nav className="flex items-center gap-6">
                <a href="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Dashboard</a>
                <RefreshButton />
              </nav>
            </div>
          </header>
          <main className="flex-grow">
            {children}
          </main>
          <footer className="bg-white border-t border-slate-200 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <p className="text-sm text-slate-400">© 2026 CyberPulse. Production-ready Cyber Intelligence.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
