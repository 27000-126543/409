import { useState } from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  ClipboardList,
  MapPin,
  Plane,
  FileText,
  Settings,
  Radio,
  Filter,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { Scene } from '@/components/three/Scene';
import AlarmPanel from '@/components/ui/AlarmPanel';
import StationDetail from '@/components/ui/StationDetail';
import StationMiniCard from '@/components/ui/StationMiniCard';
import CommandCenter from '@/components/ui/CommandCenter';
import type { StationType } from '../../shared/types';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: '监控中心', active: true },
  { icon: AlertTriangle, label: '告警管理' },
  { icon: ClipboardList, label: '工单管理' },
  { icon: MapPin, label: '站点选址' },
  { icon: Plane, label: '无人机巡检' },
  { icon: FileText, label: '报表中心' },
  { icon: Settings, label: '系统设置' },
];

const typeFilters: { key: StationType | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'macro', label: '宏基站' },
  { key: 'micro', label: '微基站' },
  { key: 'indoor', label: '室内分布' },
  { key: 'core', label: '核心机房' },
];

export default function Dashboard() {
  const stations = useAppStore((s) => s.stations);
  const selectedStationId = useAppStore((s) => s.selectedStationId);
  const [filterType, setFilterType] = useState<StationType | 'all'>('all');

  const filteredStations =
    filterType === 'all'
      ? stations
      : stations.filter((s) => s.type === filterType);

  return (
    <div className="w-full h-full flex bg-cyber-bg overflow-hidden">
      <div className="w-16 bg-cyber-bg2/80 border-r border-cyber-border flex flex-col items-center py-4 gap-2">
        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-cyber-accent/10 border border-cyber-accent/40 mb-4">
          <Radio className="w-5 h-5 text-cyber-accent" />
        </div>
        {navItems.map((item) => (
          <button
            key={item.label}
            className={cn(
              'w-12 h-12 flex flex-col items-center justify-center rounded-lg transition-all duration-200',
              item.active
                ? 'bg-cyber-accent/15 text-cyber-accent border border-cyber-accent/40 shadow-glow-sm'
                : 'text-cyber-muted hover:text-cyber-accent hover:bg-cyber-accent/5'
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[9px] mt-0.5">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <Scene />
        </div>

        {selectedStationId && <AlarmPanel />}

        <StationDetail />

        <div className="absolute bottom-4 right-4 z-10 w-[420px] h-[560px]">
          <CommandCenter />
        </div>

        <div className="absolute bottom-4 left-4 z-10 w-[380px]">
          <div className="cyber-panel hud-corner p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyber-accent" />
                <span className="font-orbitron text-sm font-bold text-cyber-accent glow-text">
                  基站列表
                </span>
                <span className="text-xs text-cyber-muted">
                  ({filteredStations.length}/{stations.length})
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Filter className="w-3 h-3 text-cyber-muted" />
              </div>
            </div>

            <div className="flex gap-1 mb-3 flex-wrap">
              {typeFilters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilterType(f.key)}
                  className={cn(
                    'px-2 py-1 rounded text-xs transition-all duration-200',
                    filterType === f.key
                      ? 'bg-cyber-accent/20 text-cyber-accent border border-cyber-accent/40'
                      : 'text-cyber-muted hover:text-cyber-accent hover:bg-cyber-accent/5 border border-transparent'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-[260px] overflow-y-auto scrollbar-cyber pr-1">
              {filteredStations.map((station) => (
                <StationMiniCard key={station.id} station={station} />
              ))}
              {filteredStations.length === 0 && (
                <div className="col-span-2 text-center text-cyber-muted text-sm py-6">
                  暂无基站
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="absolute top-4 left-4 z-10">
          <div className="cyber-panel hud-corner px-4 py-2">
            <h1 className="font-orbitron text-lg font-bold text-cyber-accent glow-text">
              城市通信基站运维管控平台
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}
