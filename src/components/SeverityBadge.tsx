import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function SeverityBadge({ severity }: { severity?: 'Low' | 'Medium' | 'High' }) {
  const colors = {
    High: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]',
    Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]',
  };

  const dots = {
    High: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]',
    Medium: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
    Low: 'bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]',
  };

  const current = severity || 'Low';

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest border",
      colors[current]
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", dots[current])} />
      {current}
    </span>
  );
}
