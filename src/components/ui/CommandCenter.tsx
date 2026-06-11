import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AlertOctagon,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Users,
  Clock,
  CheckSquare,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { Alarm, WorkOrder } from '../../../shared/types';

type TimelineEventType = 'alarm' | 'dispatch' | 'escalate' | 'complete';

interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  time: number;
  timeStr: string;
  stationId?: string;
  stationName?: string;
  workOrderId?: string;
  maintainerName?: string;
  message?: string;
  durationMinutes?: number;
  expectedArrivalMinutes?: number;
  escalateReason?: string;
}

const parseTime = (timeStr: string): number => {
  return new Date(timeStr.replace(' ', 'T')).getTime();
};

const formatTime = (timestamp: number): string => {
  const d = new Date(timestamp);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const isToday = (timeStr: string): boolean => {
  const d = new Date(timeStr.replace(' ', 'T'));
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
};

const eventTypeConfig: Record<
  TimelineEventType,
  {
    label: string;
    dotColor: string;
    glowColor: string;
    textColor: string;
    badgeBg: string;
    badgeBorder: string;
    icon: typeof AlertOctagon;
  }
> = {
  alarm: {
    label: '严重告警',
    dotColor: 'bg-cyber-danger',
    glowColor: 'shadow-glow-danger',
    textColor: 'text-cyber-danger',
    badgeBg: 'bg-cyber-danger/15',
    badgeBorder: 'border-cyber-danger/40',
    icon: AlertOctagon,
  },
  dispatch: {
    label: '派单出发',
    dotColor: 'bg-cyber-accent',
    glowColor: 'shadow-glow',
    textColor: 'text-cyber-accent',
    badgeBg: 'bg-cyber-accent/15',
    badgeBorder: 'border-cyber-accent/40',
    icon: Truck,
  },
  escalate: {
    label: '超时升级',
    dotColor: 'bg-cyber-warning',
    glowColor: 'shadow-glow-warning',
    textColor: 'text-cyber-warning',
    badgeBg: 'bg-cyber-warning/15',
    badgeBorder: 'border-cyber-warning/40',
    icon: AlertTriangle,
  },
  complete: {
    label: '闭环完成',
    dotColor: 'bg-cyber-success',
    glowColor: 'shadow-glow-success',
    textColor: 'text-cyber-success',
    badgeBg: 'bg-cyber-success/15',
    badgeBorder: 'border-cyber-success/40',
    icon: CheckCircle2,
  },
};

interface StatCardProps {
  icon: typeof Activity;
  label: string;
  value: number;
  color: 'danger' | 'accent' | 'warning' | 'success';
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colorMap = {
    danger: {
      text: 'text-cyber-danger',
      bg: 'bg-cyber-danger/10',
      border: 'border-cyber-danger/30',
      glow: 'shadow-glow-danger',
    },
    accent: {
      text: 'text-cyber-accent',
      bg: 'bg-cyber-accent/10',
      border: 'border-cyber-accent/30',
      glow: 'shadow-glow-sm',
    },
    warning: {
      text: 'text-cyber-warning',
      bg: 'bg-cyber-warning/10',
      border: 'border-cyber-warning/30',
      glow: 'shadow-glow-warning',
    },
    success: {
      text: 'text-cyber-success',
      bg: 'bg-cyber-success/10',
      border: 'border-cyber-success/30',
      glow: 'shadow-glow-success',
    },
  };

  const c = colorMap[color];

  return (
    <div
      className={`cyber-panel hud-corner p-3 relative overflow-hidden ${c.border} border`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 flex items-center justify-center rounded-lg ${c.bg} ${c.text}`}
          style={{
            boxShadow:
              color === 'danger'
                ? '0 0 12px rgba(255, 61, 87, 0.4)'
                : color === 'warning'
                ? '0 0 12px rgba(255, 176, 32, 0.4)'
                : color === 'success'
                ? '0 0 12px rgba(0, 230, 118, 0.4)'
                : '0 0 12px rgba(0, 229, 255, 0.4)',
          }}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-cyber-muted mb-0.5 truncate">{label}</div>
          <div className={`font-orbitron text-2xl font-bold glow-text ${c.text}`}>
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

interface TimelineNodeProps {
  event: TimelineEvent;
  index: number;
  onClick: () => void;
}

function TimelineNode({ event, index, onClick }: TimelineNodeProps) {
  const config = eventTypeConfig[event.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, type: 'spring', stiffness: 200, damping: 20 }}
      className="relative flex gap-3 pb-4 cursor-pointer group last:pb-0"
      onClick={onClick}
    >
      <div className="flex flex-col items-center">
        <motion.div
          whileHover={{ scale: 1.3 }}
          className={`relative z-10 w-4 h-4 rounded-full ${config.dotColor} ${config.glowColor}
            flex items-center justify-center transition-all duration-200
            group-hover:scale-125`}
        >
          <div className={`absolute inset-0 rounded-full ${config.dotColor} blur-sm opacity-60`} />
        </motion.div>
        <div className="flex-1 w-px bg-cyber-border/50 mt-1" />
      </div>

      <div className="flex-1 min-w-0 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] font-orbitron tracking-wider
              ${config.badgeBg} ${config.textColor} border ${config.badgeBorder}
              inline-flex items-center gap-1`}
          >
            <Icon className="w-2.5 h-2.5" />
            {config.label}
          </span>
          <span className="text-[10px] text-cyber-muted font-mono">
            {event.timeStr}
          </span>
        </div>

        {event.type === 'alarm' && (
          <div>
            <div className="text-sm text-cyber-text font-medium mb-0.5">
              {event.stationName}
            </div>
            <div className="text-xs text-cyber-muted line-clamp-1">
              {event.message}
            </div>
          </div>
        )}

        {event.type === 'dispatch' && (
          <div>
            <div className="text-sm text-cyber-text font-medium mb-0.5">
              {event.maintainerName} → {event.stationName}
            </div>
            <div className="text-xs text-cyber-accent/80 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              预计 {event.expectedArrivalMinutes || '?'} 分钟到达
            </div>
          </div>
        )}

        {event.type === 'escalate' && (
          <div>
            <div className="text-sm text-cyber-text font-medium mb-0.5">
              工单 #{event.workOrderId}
            </div>
            <div className="text-xs text-cyber-muted line-clamp-1">
              {event.escalateReason || '超时未处理'}
            </div>
          </div>
        )}

        {event.type === 'complete' && (
          <div>
            <div className="text-sm text-cyber-text font-medium mb-0.5">
              {event.stationName}
            </div>
            <div className="text-xs text-cyber-success/80 flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" />
              用时 {event.durationMinutes || '?'} 分钟
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function CommandCenter() {
  const alarms = useAppStore((s) => s.alarms);
  const workOrders = useAppStore((s) => s.workOrders);
  const setSelectedStationId = useAppStore((s) => s.setSelectedStationId);
  const setHighlightWorkOrderId = useAppStore((s) => s.setHighlightWorkOrderId);

  const stats = useMemo(() => {
    const criticalAlarms = alarms.filter(
      (a) => a.level === 'critical' && !a.handled
    ).length;

    const onRoadMaintainers = workOrders.filter(
      (w) =>
        (w.status === 'assigned' || w.status === 'processing') &&
        !!w.maintainerId
    ).length;

    const escalatedOrders = workOrders.filter(
      (w) => w.status === 'escalated'
    ).length;

    const todayCompleted = workOrders.filter(
      (w) => w.status === 'completed' && isToday(w.createTime)
    ).length;

    return {
      criticalAlarms,
      onRoadMaintainers,
      escalatedOrders,
      todayCompleted,
    };
  }, [alarms, workOrders]);

  const timelineEvents = useMemo((): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    alarms
      .filter((a) => a.level === 'critical')
      .forEach((alarm: Alarm) => {
        events.push({
          id: `alarm-${alarm.id}`,
          type: 'alarm',
          time: parseTime(alarm.time),
          timeStr: formatTime(parseTime(alarm.time)),
          stationId: alarm.stationId,
          stationName: alarm.stationName,
          message: alarm.message,
        });
      });

    workOrders
      .filter((w) => w.status === 'assigned' || w.status === 'processing')
      .forEach((wo: WorkOrder) => {
        const timeStr = wo.assignTime || wo.createTime;
        events.push({
          id: `dispatch-${wo.id}`,
          type: 'dispatch',
          time: parseTime(timeStr),
          timeStr: formatTime(parseTime(timeStr)),
          stationId: wo.stationId,
          stationName: wo.stationName,
          workOrderId: wo.id,
          maintainerName: wo.maintainerName || '未知',
          expectedArrivalMinutes: wo.expectedArrivalMinutes,
        });
      });

    workOrders
      .filter((w) => w.status === 'escalated' && w.escalateTime)
      .forEach((wo: WorkOrder) => {
        events.push({
          id: `escalate-${wo.id}`,
          type: 'escalate',
          time: parseTime(wo.escalateTime!),
          timeStr: formatTime(parseTime(wo.escalateTime!)),
          stationId: wo.stationId,
          stationName: wo.stationName,
          workOrderId: wo.id,
          escalateReason: wo.escalateReason,
        });
      });

    workOrders
      .filter((w) => w.status === 'completed')
      .forEach((wo: WorkOrder) => {
        const createTime = parseTime(wo.createTime);
        const durationMinutes = wo.responseTime
          ? wo.responseTime
          : Math.round((Date.now() - createTime) / 60000);
        events.push({
          id: `complete-${wo.id}`,
          type: 'complete',
          time: createTime + (wo.responseTime || 0) * 60000,
          timeStr: formatTime(createTime + (wo.responseTime || 0) * 60000),
          stationId: wo.stationId,
          stationName: wo.stationName,
          workOrderId: wo.id,
          durationMinutes,
        });
      });

    return events
      .sort((a, b) => b.time - a.time)
      .slice(0, 20);
  }, [alarms, workOrders]);

  const handleEventClick = (event: TimelineEvent) => {
    if (event.stationId) {
      setSelectedStationId(event.stationId);
    }
    if (event.workOrderId) {
      setHighlightWorkOrderId(event.workOrderId);
    }
  };

  return (
    <div className="cyber-panel hud-corner p-4 flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-5 h-5 text-cyber-accent" />
        <h2 className="font-orbitron text-base font-bold text-cyber-accent glow-text">
          运维指挥中心
        </h2>
        <div className="ml-auto flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyber-accent animate-pulse" />
          <span className="text-[10px] text-cyber-muted tracking-wider">LIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        <StatCard
          icon={AlertOctagon}
          label="严重告警"
          value={stats.criticalAlarms}
          color="danger"
        />
        <StatCard
          icon={Users}
          label="路上人员"
          value={stats.onRoadMaintainers}
          color="accent"
        />
        <StatCard
          icon={AlertTriangle}
          label="超时升级"
          value={stats.escalatedOrders}
          color="warning"
        />
        <StatCard
          icon={CheckSquare}
          label="今日闭环"
          value={stats.todayCompleted}
          color="success"
        />
      </div>

      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-cyber-border/50">
        <Clock className="w-3.5 h-3.5 text-cyber-muted" />
        <span className="text-xs text-cyber-muted">实时事件时间线</span>
        <span className="text-[10px] text-cyber-muted/60 font-mono ml-auto">
          {timelineEvents.length} 条记录
        </span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-cyber pr-2 -mr-2">
        {timelineEvents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-8">
            <div className="w-14 h-14 rounded-full bg-cyber-success/10 border border-cyber-success/30 flex items-center justify-center mb-3">
              <CheckCircle2
                className="w-7 h-7 text-cyber-success/50"
                strokeWidth={1}
              />
            </div>
            <p className="text-sm text-cyber-muted">暂无事件</p>
            <p className="text-xs text-cyber-muted/60 mt-1">系统运行平稳</p>
          </div>
        ) : (
          <div className="relative pl-1">
            <div className="absolute left-1.5 top-0 bottom-0 w-px bg-gradient-to-b from-cyber-danger/60 via-cyber-accent/40 to-cyber-success/30" />
            {timelineEvents.map((event, index) => (
              <TimelineNode
                key={event.id}
                event={event}
                index={index}
                onClick={() => handleEventClick(event)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
