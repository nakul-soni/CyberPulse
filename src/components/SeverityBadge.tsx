import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function SeverityBadge({ severity }: { severity?: 'Low' | 'Medium' | 'High' }) {
  const colors = {
    High: 'bg-red-100 text-red-700 border-red-200',
    Medium: 'bg-orange-100 text-orange-700 border-orange-200',
    Low: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  const current = severity || 'Low';

  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-xs font-medium border",
      colors[current]
    )}>
      {current}
    </span>
  );
}
