import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  highlight?: boolean;
  colorClass?: string;
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  highlight = false,
  colorClass = 'text-cyber-accent',
}: StatCardProps) {
  return (
    <div
      className={cn(
        'cyber-panel hud-corner p-3 relative overflow-hidden',
        highlight && 'border-cyber-danger/60 shadow-glow-danger'
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-10 h-10 flex items-center justify-center rounded-lg bg-cyber-bg2/80',
            highlight ? 'text-cyber-danger' : colorClass
          )}
          style={{
            boxShadow: highlight
              ? '0 0 15px rgba(255, 61, 87, 0.5)'
              : `0 0 12px ${colorClass.includes('cyber-accent') ? 'rgba(0, 229, 255, 0.4)' : 'rgba(123, 97, 255, 0.4)'}`,
          }}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-cyber-muted mb-0.5 truncate">{label}</div>
          <div className="flex items-baseline gap-1">
            <span
              className={cn(
                'font-orbitron text-lg font-bold glow-text',
                highlight ? 'text-cyber-danger' : 'text-cyber-text'
              )}
            >
              {value}
            </span>
            {unit && (
              <span className="text-xs text-cyber-muted">{unit}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
