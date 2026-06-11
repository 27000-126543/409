import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, ChevronLeft, ChevronRight, Clock, MapPin, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store';
import type { Alarm, WorkOrderStatus } from '../../../shared/types';
import { api } from '@/lib/api';

const workOrderStatusLabels: Record<WorkOrderStatus, string> = {
  pending: '待处理',
  assigned: '已分配',
  processing: '处理中',
  completed: '已完成',
  escalated: '已升级',
};

export default function AlarmPanel() {
  const [expanded, setExpanded] = useState(true);
  const [handlingAlarmId, setHandlingAlarmId] = useState<string | null>(null);
  const alarms = useAppStore((s) => s.alarms);
  const setSelectedStationId = useAppStore((s) => s.setSelectedStationId);
  const setHighlightWorkOrderId = useAppStore((s) => s.setHighlightWorkOrderId);
  const loadAlarms = useAppStore((s) => s.loadAlarms);

  const unhandledAlarms = useMemo(() => {
    return alarms
      .filter((a) => !a.handled)
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [alarms]);

  const handleHandleAlarm = async (alarmId: string) => {
    try {
      setHandlingAlarmId(alarmId);
      await api.handleAlarm(alarmId);
      await loadAlarms();
    } catch (e) {
      console.error(e);
    } finally {
      setHandlingAlarmId(null);
    }
  };

  const handleLocate = (alarm: Alarm) => {
    setSelectedStationId(alarm.stationId);
    if (alarm.relatedWorkOrderId) {
      setHighlightWorkOrderId(alarm.relatedWorkOrderId);
    }
  };

  const formatTime = (timeStr: string) => {
    const d = new Date(timeStr);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / 1000;
    if (diff < 60) return `${Math.round(diff)}秒前`;
    if (diff < 3600) return `${Math.round(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.round(diff / 3600)}小时前`;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const isNewAlarm = (timeStr: string) => {
    const diff = (new Date().getTime() - new Date(timeStr).getTime()) / 1000;
    return diff < 60;
  };

  const getLevelStyles = (level: Alarm['level']) => {
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

  return (
    <motion.div
      initial={false}
      animate={{ x: expanded ? 0 : 320 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      className="absolute right-0 top-20 bottom-4 z-30 flex"
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-7 h-20 self-center -ml-1 cyber-panel border-r-0 flex items-center justify-center
          rounded-l-lg border border-cyber-border hover:border-cyber-accent hover:bg-cyber-accent/10
          transition-all duration-200 group"
      >
        {expanded ? (
          <ChevronRight className="w-4 h-4 text-cyber-muted group-hover:text-cyber-accent" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-cyber-muted group-hover:text-cyber-accent" />
        )}
      </button>

      {/* Panel Body */}
      <div className={`w-80 h-full cyber-panel hud-corner overflow-hidden flex flex-col ${expanded ? '' : 'pointer-events-none'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-cyber-border">
          <div className="flex items-center gap-2">
            <div className="relative">
              <AlertTriangle className="w-5 h-5 text-cyber-danger" strokeWidth={2} />
              {unhandledAlarms.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-cyber-danger
                    text-cyber-bg text-[10px] font-bold font-orbitron flex items-center justify-center shadow-glow-danger"
                >
                  {unhandledAlarms.length}
                </motion.span>
              )}
            </div>
            <h3 className="font-orbitron font-semibold text-cyber-text text-sm tracking-wider">
              实时告警
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyber-danger animate-pulse" />
            <span className="text-[10px] text-cyber-muted tracking-wider">LIVE</span>
          </div>
        </div>

        {/* Alarm List */}
        <div className="flex-1 overflow-y-auto scrollbar-cyber p-3 space-y-2" style={{ maxHeight: '60vh' }}>
          {unhandledAlarms.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-10">
              <div className="w-16 h-16 rounded-full bg-cyber-success/10 border border-cyber-success/30 flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-cyber-success/50" strokeWidth={1} />
              </div>
              <p className="text-sm text-cyber-muted">暂无告警</p>
              <p className="text-xs text-cyber-muted/60 mt-1">系统运行正常</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {unhandledAlarms.map((alarm) => {
                const styles = getLevelStyles(alarm.level);
                const Icon = styles.icon;
                const isNew = isNewAlarm(alarm.time);
                const isHandling = handlingAlarmId === alarm.id;
                const isClosed = alarm.closedByWorkOrder;
                const isEscalated = alarm.relatedWorkOrderStatus === 'escalated';
                return (
                  <motion.div
                    key={alarm.id}
                    layout
                    initial={{ opacity: 0, x: 50, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 50, height: 0, marginBottom: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className={`relative p-3 rounded-lg border ${styles.border} ${styles.bg} ${isNew ? styles.glow : ''} ${isClosed ? 'opacity-50' : ''}`}
                  >
                    {isNew && (
                      <motion.span
                        initial={{ opacity: 1 }}
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className={`absolute top-2 right-2 w-2 h-2 rounded-full ${styles.badge}`}
                      />
                    )}
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg ${styles.bg} border ${styles.border} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${styles.iconColor}`} strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`font-medium text-sm truncate ${isClosed ? 'text-cyber-muted line-through' : 'text-cyber-text'}`}>
                            {alarm.stationName}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-orbitron tracking-wider ${styles.bg} ${styles.iconColor} border ${styles.border}`}
                          >
                            {alarm.level === 'critical' ? '严重' : '警告'}
                          </span>
                        </div>
                        <p className={`text-xs leading-relaxed line-clamp-2 ${isClosed ? 'text-cyber-muted/60 line-through' : 'text-cyber-muted'}`}>
                          {alarm.message}
                        </p>

                        <div className="mt-2 pt-2 border-t border-cyber-border/30">
                          {alarm.relatedWorkOrderId ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] tracking-wider inline-flex items-center gap-1
                                  ${isEscalated
                                    ? 'bg-cyber-danger/15 text-cyber-danger border border-cyber-danger/50'
                                    : 'bg-cyber-accent/15 text-cyber-accent border border-cyber-accent/40'
                                  }`}
                              >
                                已派单→{alarm.relatedMaintainerName || '已分配'}
                              </span>
                              <span className={`text-[9px] ${isEscalated ? 'text-cyber-danger' : 'text-cyber-muted/70'}`}>
                                {workOrderStatusLabels[alarm.relatedWorkOrderStatus!]}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-cyber-muted/50">
                              未派单
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 text-[10px] text-cyber-muted/80">
                            <Clock className="w-3 h-3" strokeWidth={1.5} />
                            <span>{formatTime(alarm.time)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleLocate(alarm)}
                              className="px-2 py-1 rounded text-[10px] font-medium tracking-wider
                                border border-cyber-accent/40 text-cyber-accent bg-cyber-accent/10
                                hover:brightness-125 transition-all duration-200
                                flex items-center gap-1"
                            >
                              <MapPin className="w-2.5 h-2.5" />
                              定位
                            </button>
                            <button
                              onClick={() => handleHandleAlarm(alarm.id)}
                              disabled={isHandling}
                              className={`px-2.5 py-1 rounded text-[10px] font-medium tracking-wider
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
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-cyber-border flex items-center justify-between">
          <span className="text-[10px] text-cyber-muted font-mono">
            共 {unhandledAlarms.length} 条未处理
          </span>
          <span className="text-[10px] text-cyber-accent/60 tracking-wider">
            AUTO-SYNC
          </span>
        </div>
      </div>
    </motion.div>
  );
}
