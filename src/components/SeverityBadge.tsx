import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function SeverityBadge({ severity }: { severity?: 'Low' | 'Medium' | 'High' }) {
  const colors = {
    High: 'bg-[var(--severity-high)]/10 text-[var(--severity-high)] border-[var(--severity-high)]/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]',
    Medium: 'bg-[var(--severity-medium)]/10 text-[var(--severity-medium)] border-[var(--severity-medium)]/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]',
    Low: 'bg-[var(--severity-low)]/10 text-[var(--severity-low)] border-[var(--severity-low)]/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]',
  };

  const dots = {
    High: 'bg-[var(--severity-high)] shadow-[0_0_8px_var(--severity-high)]',
    Medium: 'bg-[var(--severity-medium)] shadow-[0_0_8px_var(--severity-medium)]',
    Low: 'bg-[var(--severity-low)] shadow-[0_0_8px_var(--severity-low)]',
  };

  const current = severity || 'Low';

  return (
    <span className={cn(
      "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border backdrop-blur-md transition-all duration-300",
      colors[current]
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", dots[current])} />
      {current}
    </span>
  );
}
