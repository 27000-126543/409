import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Radio,
  Thermometer,
  Droplets,
  Battery,
  Zap,
  Antenna,
  AlertCircle,
} from 'lucide-react';
import { useAppStore } from '@/store';
import StatCard from './StatCard';
import TrafficChart from './TrafficChart';
import ProgressRing from './ProgressRing';
import type { StationType } from '../../../shared/types';

const stationTypeLabels: Record<StationType, string> = {
  macro: '宏基站',
  micro: '微基站',
  indoor: '室内分布',
  core: '核心机房',
};

export default function StationDetail() {
  const selectedStationId = useAppStore((s) => s.selectedStationId);
  const stations = useAppStore((s) => s.stations);
  const selectedStationTraffic = useAppStore((s) => s.selectedStationTraffic);
  const selectedStationFaults = useAppStore((s) => s.selectedStationFaults);
  const setSelectedStationId = useAppStore((s) => s.setSelectedStationId);
  const loadStationDetail = useAppStore((s) => s.loadStationDetail);

  const station = stations.find((s) => s.id === selectedStationId);

  useEffect(() => {
    if (selectedStationId) {
      loadStationDetail(selectedStationId);
    }
  }, [selectedStationId, loadStationDetail]);

  return (
    <AnimatePresence>
      {selectedStationId && (
        <motion.div
          initial={{ x: 460, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 460, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute top-4 right-4 bottom-4 w-[420px] z-20"
        >
          <div className="cyber-panel hud-corner h-full flex flex-col overflow-hidden">
            {station ? (
              <>
                <div className="flex items-center justify-between px-4 py-3 border-b border-cyber-border">
                  <div>
                    <h2 className="font-orbitron text-lg font-bold text-cyber-accent glow-text">
                      {station.name}
                    </h2>
                    <div className="text-xs text-cyber-muted mt-0.5">
                      {stationTypeLabels[station.type]}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedStationId(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-cyber-accent/10 text-cyber-muted hover:text-cyber-accent transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-cyber p-4 space-y-4">
                  <div className="cyber-panel hud-corner p-3">
                    <div className="text-xs text-cyber-accent font-medium mb-2">
                      基本信息
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-cyber-accent" />
                        <span className="text-cyber-muted">坐标：</span>
                        <span className="font-orbitron text-cyber-text">
                          ({station.position.x.toFixed(1)}, {station.position.y.toFixed(1)}, {station.position.z.toFixed(1)})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="cyber-panel hud-corner p-3">
                    <div className="text-xs text-cyber-accent font-medium mb-3">
                      实时状态
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <StatCard
                        icon={Antenna}
                        label="天线倾角"
                        value={`${station.antennaTilt}°`}
                        unit={`目标 ${station.targetAntennaTilt}° (${station.antennaTilt - station.targetAntennaTilt > 0 ? '+' : ''}${station.antennaTilt - station.targetAntennaTilt}°)`}
                        colorClass="text-cyber-accent"
                      />
                      <StatCard
                        icon={Radio}
                        label="当前频段"
                        value={station.currentFrequency}
                        colorClass="text-cyber-accent2"
                      />
                      <StatCard
                        icon={Thermometer}
                        label="温度"
                        value={`${station.temperature}℃`}
                        highlight={station.temperature > 45}
                        colorClass="text-cyber-warning"
                      />
                      <StatCard
                        icon={Droplets}
                        label="湿度"
                        value={`${station.humidity}%`}
                        highlight={station.humidity > 90}
                        colorClass="text-cyber-accent"
                      />
                      <div className="cyber-panel hud-corner p-3 relative overflow-hidden">
                        <div className="flex items-center gap-3">
                          <ProgressRing
                            value={station.batteryLevel}
                            size={40}
                            color={station.batteryLevel < 20 ? '#FF3D57' : station.batteryLevel < 50 ? '#FFB020' : '#00E676'}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-cyber-muted mb-0.5 truncate">
                              电池电量
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="font-orbitron text-lg font-bold glow-text text-cyber-text">
                                {station.batteryLevel}%
                              </span>
                            </div>
                            {station.batteryLevel < 70 && (
                              <div className="text-xs text-cyber-warning mt-0.5 flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                充电中
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <StatCard
                        icon={Zap}
                        label="供电状态"
                        value={station.powerSource === 'grid' ? '市电' : '电池'}
                        colorClass={station.powerSource === 'grid' ? 'text-cyber-success' : 'text-cyber-warning'}
                      />
                    </div>
                  </div>

                  <div className="cyber-panel hud-corner p-3">
                    <div className="text-xs text-cyber-accent font-medium mb-3">
                      流量监控
                    </div>
                    <TrafficChart data={selectedStationTraffic} />
                  </div>

                  <div className="cyber-panel hud-corner p-3">
                    <div className="text-xs text-cyber-accent font-medium mb-3 flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5" />
                      故障记录
                    </div>
                    {selectedStationFaults.length === 0 ? (
                      <div className="text-center text-cyber-muted text-sm py-4">
                        暂无故障记录
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedStationFaults.map((fault) => (
                          <div
                            key={fault.id}
                            className="p-2 rounded-md bg-cyber-bg2/50 border border-cyber-border/50 text-xs"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-cyber-muted">{fault.time}</span>
                              <span className="text-cyber-accent">{fault.type}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-cyber-text">{fault.result}</span>
                              <span className="text-cyber-muted">
                                处理时长 {fault.duration}分钟
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-cyber-muted">
                加载中...
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
