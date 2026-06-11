import { cn } from '@/lib/utils';

interface ProgressRingProps {
  value: number;
  size?: number;
  color?: string;
  label?: string;
}

export default function ProgressRing({
  value,
  size = 48,
  color = '#00E5FF',
  label,
}: ProgressRingProps) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedValue = Math.max(0, Math.min(100, value));
  const offset = circumference - (clampedValue / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(0, 229, 255, 0.1)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              'font-orbitron font-bold glow-text',
              size >= 48 ? 'text-sm' : 'text-xs'
            )}
            style={{ color }}
          >
            {Math.round(clampedValue)}%
          </span>
        </div>
      </div>
      {label && (
        <div className="text-xs text-cyber-muted mt-1 truncate max-w-full">
          {label}
        </div>
      )}
    </div>
  );
}
