import { useEffect, useMemo, useState } from 'react';
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
  AlertTriangle,
  Clock,
  Loader2,
} from 'lucide-react';
import { useAppStore } from '@/store';
import StatCard from './StatCard';
import TrafficChart from './TrafficChart';
import ProgressRing from './ProgressRing';
import type { StationType, Alarm } from '../../../shared/types';
import { api } from '@/lib/api';

const stationTypeLabels: Record<StationType, string> = {
  macro: '宏基站',
  micro: '微基站',
  indoor: '室内分布',
  core: '核心机房',
};

const alarmTypeLabels: Record<Alarm['type'], string> = {
  bandwidth: '带宽告警',
  power: '供电告警',
  transmission: '传输告警',
  temperature: '温度告警',
  humidity: '湿度告警',
  battery: '电池告警',
  antenna: '天线告警',
};

const getAlarmLevelStyles = (level: Alarm['level']) => {
  if (level === 'critical') {
    return {
      icon: AlertCircle,
      bg: 'bg-cyber-danger/15',
      border: 'border-cyber-danger/40',
      iconColor: 'text-cyber-danger',
      badge: 'bg-cyber-danger',
      glow: 'shadow-glow-danger',
    };
  }
  return {
    icon: AlertTriangle,
    bg: 'bg-cyber-warning/15',
    border: 'border-cyber-warning/40',
    iconColor: 'text-cyber-warning',
    badge: 'bg-cyber-warning',
    glow: 'shadow-glow-warning',
  };
};

const formatAlarmTime = (timeStr: string) => {
  const d = new Date(timeStr);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export default function StationDetail() {
  const selectedStationId = useAppStore((s) => s.selectedStationId);
  const stations = useAppStore((s) => s.stations);
  const alarms = useAppStore((s) => s.alarms);
  const selectedStationTraffic = useAppStore((s) => s.selectedStationTraffic);
  const selectedStationFaults = useAppStore((s) => s.selectedStationFaults);
  const setSelectedStationId = useAppStore((s) => s.setSelectedStationId);
  const loadStationDetail = useAppStore((s) => s.loadStationDetail);
  const loadStations = useAppStore((s) => s.loadStations);
  const loadAlarms = useAppStore((s) => s.loadAlarms);
  const loadWorkOrders = useAppStore((s) => s.loadWorkOrders);
  const [handlingAlarmId, setHandlingAlarmId] = useState<string | null>(null);

  const station = stations.find((s) => s.id === selectedStationId);

  const stationAlarms = useMemo(() => {
    if (!selectedStationId) return [];
    return alarms
      .filter((a) => a.stationId === selectedStationId && !a.handled)
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [alarms, selectedStationId]);

  const handleHandleAlarm = async (alarm: Alarm) => {
    try {
      setHandlingAlarmId(alarm.id);
      await api.handleAlarm(alarm.id);
      await Promise.all([
        loadStations(),
        loadAlarms(),
        loadWorkOrders(),
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setHandlingAlarmId(null);
    }
  };

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
                      <AlertTriangle className="w-3.5 h-3.5 text-cyber-warning" />
                      实时告警
                      {stationAlarms.length > 0 && (
                        <span className="ml-auto px-1.5 py-0.5 rounded-full bg-cyber-danger/20 text-cyber-danger text-[10px] font-orbitron">
                          {stationAlarms.length}
                        </span>
                      )}
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-cyber-border to-transparent mb-3 scrolling-line" />
                    {stationAlarms.length === 0 ? (
                      <div className="text-center text-cyber-muted text-sm py-4 flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-cyber-success/10 border border-cyber-success/30 flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-cyber-success/50" strokeWidth={1} />
                        </div>
                        <span>暂无未处理告警</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {stationAlarms.map((alarm) => {
                          const styles = getAlarmLevelStyles(alarm.level);
                          const Icon = styles.icon;
                          const isHandling = handlingAlarmId === alarm.id;
                          return (
                            <div
                              key={alarm.id}
                              className={`relative p-2.5 rounded-md ${styles.bg} border ${styles.border}`}
                            >
                              <div className="flex items-start gap-2">
                                <div className={`w-7 h-7 rounded ${styles.bg} border ${styles.border} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                  <Icon className={`w-3.5 h-3.5 ${styles.iconColor}`} strokeWidth={2} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <span className={`px-1 py-0.5 rounded text-[9px] font-orbitron ${styles.badge} text-white`}>
                                      {alarm.level === 'critical' ? '严重' : '警告'}
                                    </span>
                                    <span className="text-[11px] text-cyber-text font-medium">
                                      {alarmTypeLabels[alarm.type]}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-cyber-muted leading-snug mb-1.5">
                                    {alarm.message}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-[10px] text-cyber-muted/80">
                                      <Clock className="w-2.5 h-2.5" strokeWidth={1.5} />
                                      <span className="font-orbitron">{formatAlarmTime(alarm.time)}</span>
                                    </div>
                                    <button
                                      onClick={() => handleHandleAlarm(alarm)}
                                      disabled={isHandling}
                                      className={`px-2 py-0.5 rounded text-[10px] font-medium tracking-wider
                                        border ${styles.border} ${styles.iconColor} ${styles.bg}
                                        hover:brightness-125 transition-all duration-200
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        flex items-center gap-1`}
                                    >
                                      {isHandling && (
                                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                      )}
                                      {isHandling ? '处理中' : '处理'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
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
