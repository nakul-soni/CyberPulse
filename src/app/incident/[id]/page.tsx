import { SeverityBadge } from '@/components/SeverityBadge';
import { 
  ShieldCheck, 
  AlertTriangle, 
  ArrowLeft, 
  ExternalLink, 
  Activity, 
  Target, 
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getIncidentById } from '@/lib/db';
import ReanalyzeButton from '@/components/ReanalyzeButton';

export const revalidate = 0;

export default async function IncidentDetailPage({ params }: { params: { id: string } }) {
  const incident = await getIncidentById(params.id);

  if (!incident) {
    notFound();
  }

  const analysis = typeof incident.analysis === 'string' 
    ? JSON.parse(incident.analysis) 
    : incident.analysis;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-8 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <SeverityBadge severity={incident.severity} />
          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-md">
            {incident.attack_type || 'Unclassified'}
          </span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
          {incident.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span className="font-semibold text-slate-900">{incident.source}</span>
          <span>•</span>
          <span>{new Date(incident.published_at).toLocaleDateString()}</span>
          <span>•</span>
          <a href={incident.url} target="_blank" className="flex items-center gap-1 text-blue-600 hover:underline">
            View Source <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="space-y-12">
        {/* Summary Section */}
        <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900">Incident Overview</h2>
              {!analysis?.summary && (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">Analysis missing?</span>
                  <ReanalyzeButton incidentId={incident.id} />
                </div>
              )}
            </div>
          </div>
          <p className="text-slate-600 leading-relaxed text-lg">
            {analysis?.summary || 'AI analysis is currently being generated for this incident.'}
          </p>
        </section>

        {/* Root Cause & Mistakes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-amber-50/50 rounded-2xl border border-amber-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Root Cause</h2>
            </div>
            <p className="text-slate-700 leading-relaxed">
              {analysis?.root_cause || 'Analyzing root cause...'}
            </p>
          </section>

          <section className="bg-red-50/50 rounded-2xl border border-red-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Key Mistakes</h2>
            </div>
            <ul className="space-y-3">
              {(analysis?.mistakes || []).map((mistake: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-slate-700">
                  <span className="text-red-400 font-bold">•</span>
                  {mistake}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Mitigation Strategy */}
        <section className="bg-emerald-50/50 rounded-2xl border border-emerald-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Mitigation Strategy</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Recommended Steps
              </h3>
              <ul className="space-y-4">
                {(analysis?.mitigation || []).map((step: string, i: number) => (
                  <li key={i} className="bg-white/80 border border-emerald-100 p-4 rounded-xl text-slate-700 shadow-sm">
                    <span className="font-bold text-emerald-600 mr-2">0{i+1}.</span> {step}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" /> Personal Action Guide
              </h3>
              <div className="bg-white/80 border border-emerald-100 p-5 rounded-xl text-slate-700 shadow-sm leading-relaxed italic">
                {analysis?.what_to_do_guide}
              </div>
            </div>
          </div>
        </section>

        {/* Case Study - Hide behind details/summary as requested */}
        {analysis?.case_study && (
          <details className="group bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <summary className="flex items-center justify-between p-8 cursor-pointer list-none select-none">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Full Case Study</h2>
                  <p className="text-slate-400 text-sm">In-depth breakdown of the incident flow</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center group-open:rotate-180 transition-transform">
                <ArrowLeft className="w-4 h-4 text-slate-500 -rotate-90" />
              </div>
            </summary>
            <div className="px-8 pb-8 pt-4 border-t border-white/5 space-y-8">
              <div>
                <h3 className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-3">The Narrative</h3>
                <h4 className="text-2xl font-bold text-white mb-4">{analysis.case_study?.title || 'Case Study'}</h4>
                <p className="text-slate-300 leading-relaxed">{analysis.case_study?.background || 'Background information pending'}</p>
              </div>
              
              <div>
                <h3 className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-4">Incident Flow</h3>
                <div className="space-y-4">
                  {(analysis.case_study?.incident_flow || []).map((event: string, i: number) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                        {i !== (analysis.case_study?.incident_flow?.length || 0) - 1 && <div className="w-0.5 grow bg-slate-800" />}
                      </div>
                      <p className="text-slate-400 pb-4">{event}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-4">Final Outcome</h3>
                  <p className="text-slate-300">{analysis.case_study?.outcome || 'Outcome analysis pending'}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-amber-400 font-bold uppercase tracking-widest text-xs mb-4">Lessons Learned</h3>
                  <ul className="space-y-2">
                    {(analysis.case_study?.lessons_learned || []).map((lesson: string, i: number) => (
                      <li key={i} className="text-slate-300 flex items-start gap-2">
                        <span className="text-amber-500">•</span>
                        {lesson}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
