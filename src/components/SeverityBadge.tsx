import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function SeverityBadge({ severity }: { severity?: 'Low' | 'Medium' | 'High' }) {
  const colors = {
    High: 'bg-[var(--severity-high)]/15 text-[var(--severity-high)] border-[var(--severity-high)]/30',
    Medium: 'bg-[var(--severity-medium)]/15 text-[var(--severity-medium)] border-[var(--severity-medium)]/30',
    Low: 'bg-[var(--severity-low)]/15 text-[var(--severity-low)] border-[var(--severity-low)]/30',
  };

  const dots = {
    High: 'bg-[var(--severity-high)]',
    Medium: 'bg-[var(--severity-medium)]',
    Low: 'bg-[var(--severity-low)]',
  };

  const current = severity || 'Low';

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
      colors[current]
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full", dots[current])} />
      {current}
    </span>
  );
}
