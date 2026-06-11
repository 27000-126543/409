import { Users, ArrowUp, ArrowDown } from 'lucide-react';
import type { BaseStation, StationType, AlarmStatus } from '../../../shared/types';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';

const stationTypeLabels: Record<StationType, string> = {
  macro: '宏基站',
  micro: '微基站',
  indoor: '室内分布',
  core: '核心机房',
};

const alarmColorMap: Record<AlarmStatus, string> = {
  normal: 'bg-cyber-success shadow-[0_0_8px_#00E676]',
  warning: 'bg-cyber-warning shadow-[0_0_8px_#FFB020]',
  critical: 'bg-cyber-danger shadow-[0_0_8px_#FF3D57]',
  offline: 'bg-cyber-muted shadow-[0_0_8px_#7A8BA3]',
};

interface StationMiniCardProps {
  station: BaseStation;
}

export default function StationMiniCard({ station }: StationMiniCardProps) {
  const selectedStationId = useAppStore((s) => s.selectedStationId);
  const setSelectedStationId = useAppStore((s) => s.setSelectedStationId);
  const isSelected = selectedStationId === station.id;

  return (
    <div
      onClick={() => setSelectedStationId(station.id)}
      className={cn(
        'cyber-panel hud-corner p-3 cursor-pointer transition-all duration-200',
        isSelected
          ? 'border-cyber-accent shadow-glow-sm scale-[1.02]'
          : 'hover:border-cyber-accent/50 hover:shadow-glow-sm'
      )}
    >
      <div className="flex items-start gap-2 mb-2">
        <div
          className={cn(
            'w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 animate-pulse-slow',
            alarmColorMap[station.alarmStatus]
          )}
        />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-cyber-text truncate">
            {station.name}
          </div>
          <div className="text-xs text-cyber-muted">
            {stationTypeLabels[station.type]}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1 text-xs">
        <div className="flex items-center gap-1 text-cyber-muted">
          <Users className="w-3 h-3 text-cyber-accent" />
          <span className="font-orbitron text-cyber-text">{station.onlineUsers}</span>
        </div>
        <div className="flex items-center gap-1 text-cyber-muted">
          <ArrowUp className="w-3 h-3 text-[#00E5FF]" />
          <span className="font-orbitron text-cyber-text">{station.uplinkTraffic}</span>
        </div>
        <div className="flex items-center gap-1 text-cyber-muted">
          <ArrowDown className="w-3 h-3 text-[#7B61FF]" />
          <span className="font-orbitron text-cyber-text">{station.downlinkTraffic}</span>
        </div>
      </div>
    </div>
  );
}
