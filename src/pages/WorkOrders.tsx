import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, X, MapPin, User, Clock, AlertTriangle,
  CheckCircle2, Navigation, AlertOctagon, AlertCircle,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import type { WorkOrder, WorkOrderStatus } from '../../shared/types';

type TabKey = 'pending' | 'processing' | 'escalated' | 'completed';

const tabConfig: { key: TabKey; label: string; match: (s: WorkOrderStatus) => boolean }[] = [
  { key: 'pending', label: '待派单', match: (s) => s === 'pending' },
  { key: 'processing', label: '处理中', match: (s) => s === 'assigned' || s === 'processing' },
  { key: 'escalated', label: '已升级', match: (s) => s === 'escalated' },
  { key: 'completed', label: '已完成', match: (s) => s === 'completed' },
];

const priorityColors = { normal: '#00E5FF', high: '#FFB020', urgent: '#FF3D57' } as const;
const priorityLabels = { normal: '普通', high: '高', urgent: '紧急' } as const;
const statusLabels: Record<WorkOrderStatus, string> = {
  pending: '待派单', assigned: '已派单', processing: '处理中',
  completed: '已完成', escalated: '已升级',
};
const statusColors: Record<WorkOrderStatus, string> = {
  pending: '#FFB020', assigned: '#00E5FF', processing: '#7B61FF',
  completed: '#00E676', escalated: '#FF3D57',
};

function PriorityBadge({ p }: { p: 'normal' | 'high' | 'urgent' }) {
  return (
    <span
      className="px-2 py-0.5 rounded text-[10px] font-bold font-orbitron"
      style={{ color: priorityColors[p], backgroundColor: `${priorityColors[p]}20`, border: `1px solid ${priorityColors[p]}50` }}
    >
      {priorityLabels[p]}
    </span>
  );
}

function StatusBadge({ status }: { status: WorkOrderStatus }) {
  const isEscalated = status === 'escalated';
  return (
    <span
      className={cn(
        'px-2 py-0.5 rounded text-[10px] font-medium',
        isEscalated && 'animate-pulse'
      )}
      style={{
        color: isEscalated ? '#fff' : statusColors[status],
        backgroundColor: isEscalated ? statusColors[status] : `${statusColors[status]}20`,
        border: `1px solid ${statusColors[status]}60`,
        boxShadow: isEscalated ? `0 0 10px ${statusColors[status]}80` : undefined,
      }}
    >
      {statusLabels[status]}
    </span>
  );
}

function formatShortPos(pos?: { x: number; y: number; z: number }) {
  if (!pos) return '-';
  return `(${pos.x.toFixed(0)}, ${pos.y.toFixed(0)}, ${pos.z.toFixed(0)})`;
}

interface WorkOrderCardProps {
  wo: WorkOrder;
  onClick: () => void;
}

function WorkOrderCard({ wo, onClick }: WorkOrderCardProps) {
  const isEscalated = wo.status === 'escalated';

  return (
    <motion.div
      whileHover={{ scale: 1.008, boxShadow: '0 0 20px rgba(0, 229, 255, 0.15)' }}
      whileTap={{ scale: 0.995 }}
      onClick={onClick}
      className={cn(
        'cyber-panel hud-corner p-3 cursor-pointer relative overflow-hidden transition-all'
      )}
    >
      {isEscalated && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l"
          style={{ backgroundColor: '#FF3D57', boxShadow: '0 0 12px #FF3D57' }}
        />
      )}

      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="flex items-center gap-2">
          <PriorityBadge p={wo.priority} />
          <StatusBadge status={wo.status} />
        </div>
        <span className="text-[10px] font-orbitron text-cyber-muted">
          #{wo.id}
        </span>
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="text-sm font-bold text-cyber-text truncate">{wo.stationName}</div>
        <div className="text-xs text-cyber-accent">{wo.faultType}</div>
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1 text-cyber-muted">
            <Clock className="w-3 h-3" />
            <span className="font-orbitron">{wo.createTime}</span>
          </div>
          <div className="flex items-center gap-1 text-cyber-text">
            <User className="w-3 h-3 text-cyber-accent" />
            <span>{wo.maintainerName || '未指派'}</span>
          </div>
        </div>
      </div>

      {isEscalated && wo.escalateReason && (
        <div className="mb-2 p-2 rounded text-[11px]" style={{ backgroundColor: '#FF3D5715', border: '1px solid #FF3D5740' }}>
          <div className="flex items-center gap-1 mb-0.5">
          <AlertOctagon className="w-3 h-3" style={{ color: '#FF3D57' }} />
            <span style={{ color: '#FF3D57' }}>升级原因：{wo.escalateReason}</span>
          </div>
          {wo.escalateTime && (
            <div className="text-[10px] font-orbitron text-cyber-muted ml-4">
              {wo.escalateTime}
            </div>
          )}
        </div>
      )}

      <div className="space-y-1 pt-2 border-t border-cyber-border/50 text-[10px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-cyber-muted">
            <Navigation className="w-3 h-3 text-cyber-accent" />
            <span>预计到达：</span>
          </div>
          <span className="font-orbitron text-cyber-text">
            {wo.expectedArrivalMinutes !== undefined ? `${wo.expectedArrivalMinutes} 分钟` : '-'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-cyber-muted">
            <MapPin className="w-3 h-3 text-cyber-warning" />
            <span>路线：</span>
          </div>
          <div className="flex items-center gap-1 font-orbitron text-cyber-text">
            <span>{formatShortPos(wo.maintainerPosition)}</span>
            <span className="text-cyber-muted">→</span>
            <span>{formatShortPos(wo.stationPosition)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface DrawerProps {
  wo: WorkOrder;
  onClose: () => void;
}

function DetailDrawer({ wo, onClose }: DrawerProps) {
  const alarms = useAppStore((s) => s.alarms);
  const setSelectedStationId = useAppStore((s) => s.setSelectedStationId);
  const loadWorkOrders = useAppStore((s) => s.loadWorkOrders);
  const loadAlarms = useAppStore((s) => s.loadAlarms);

  const relatedAlarms = useMemo(() => {
    if (!wo.relatedAlarmIds?.length) return [];
    return wo.relatedAlarmIds
      .map((id) => alarms.find((a) => a.id === id))
      .filter(Boolean) as typeof alarms;
  }, [wo.relatedAlarmIds, alarms]);

  const [completing, setCompleting] = useState(false);

  const handleComplete = async () => {
    try {
      setCompleting(true);
      await api.completeWorkOrder(wo.id);
      await Promise.all([loadWorkOrders(), loadAlarms()]);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: 460, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 460, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 bottom-0 w-[420px] z-50"
      >
        <div className="cyber-panel hud-corner h-full flex flex-col overflow-hidden m-4">
          <div className="flex items-center justify-between px-4 py-3 border-b border-cyber-border">
            <div>
              <h2 className="font-orbitron text-lg font-bold text-cyber-accent glow-text">
                工单详情
              </h2>
              <div className="text-xs text-cyber-muted mt-0.5 font-orbitron">
                #{wo.id}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-cyber-accent/10 text-cyber-muted hover:text-cyber-accent transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-cyber p-4 space-y-4">
            <div className="flex items-center gap-2">
              <PriorityBadge p={wo.priority} />
              <StatusBadge status={wo.status} />
            </div>

            <div className="cyber-panel hud-corner p-3 space-y-2">
              <div className="text-xs text-cyber-accent font-medium mb-1">基本信息</div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-cyber-muted">基站</span>
                  <span className="text-cyber-text">{wo.stationName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyber-muted">故障类型</span>
                  <span className="text-cyber-text">{wo.faultType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyber-muted">创建时间</span>
                  <span className="font-orbitron text-cyber-text">{wo.createTime}</span>
                </div>
              </div>
            </div>

            <div className="cyber-panel hud-corner p-3">
              <div className="text-xs text-cyber-accent font-medium mb-2 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              关联告警
            </div>
            {relatedAlarms.length === 0 ? (
              <div className="text-center text-cyber-muted text-sm py-3">无关联告警</div>
            ) : (
              <div className="space-y-2">
                {relatedAlarms.map((alarm) => (
                  <div
                    key={alarm.id}
                    className="p-2 rounded text-xs"
                    style={{
                      backgroundColor: alarm.level === 'critical' ? '#FF3D5715' : '#FFB02015',
                      border: `1px solid ${alarm.level === 'critical' ? '#FF3D5740' : '#FFB02040'}`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span
                        className="font-medium"
                        style={{ color: alarm.level === 'critical' ? '#FF3D57' : '#FFB020' }}
                      >
                        {alarm.level === 'critical' ? '严重' : '警告'}
                      </span>
                      <span className="font-orbitron text-cyber-muted text-[10px]">
                        {alarm.time}
                      </span>
                    </div>
                    <div className="text-cyber-text">{alarm.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

            <div className="cyber-panel hud-corner p-3 space-y-2">
              <div className="text-xs text-cyber-accent font-medium mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
                维护人员
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-cyber-muted">姓名</span>
                  <span className="text-cyber-text">{wo.maintainerName || '未指派'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyber-muted">当前坐标</span>
                  <span className="font-orbitron text-cyber-text">
                    {formatShortPos(wo.maintainerPosition)}
                  </span>
                </div>
              </div>
            </div>

            {wo.stationPosition && (
              <div className="cyber-panel hud-corner p-3 space-y-2">
                <div className="text-xs text-cyber-accent font-medium mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  基站位置
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cyber-muted">坐标</span>
                  <span className="font-orbitron text-cyber-text">
                    {formatShortPos(wo.stationPosition)}
                  </span>
                </div>
              </div>
            )}

            {wo.expectedArrivalMinutes !== undefined && (
              <div className="cyber-panel hud-corner p-3">
                <div className="text-xs text-cyber-accent font-medium mb-1 flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5" />
                  预计到达
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cyber-muted">时间</span>
                  <span className="font-orbitron text-cyber-warning font-bold">
                    {wo.expectedArrivalMinutes} 分钟
                  </span>
                </div>
              </div>
            )}

            {wo.status === 'escalated' && wo.escalateReason && (
              <div
                className="cyber-panel hud-corner p-3"
                style={{ borderColor: '#FF3D5760' }}
              >
                <div className="text-xs font-medium mb-1 flex items-center gap-1" style={{ color: '#FF3D57' }}>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  升级信息
                </div>
                <div className="text-sm text-cyber-text mb-1">{wo.escalateReason}</div>
                {wo.escalateTime && (
                  <div className="text-[10px] font-orbitron text-cyber-muted">
                    升级时间：{wo.escalateTime}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-cyber-border space-y-2">
            <button
              onClick={() => setSelectedStationId(wo.stationId)}
              className="w-full cyber-btn text-sm py-2 flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              定位基站
            </button>
            {wo.status !== 'completed' && (
              <button
                onClick={handleComplete}
                disabled={completing}
                className="w-full cyber-btn-success text-sm py-2 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                {completing ? '处理中...' : '完成工单'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function WorkOrders() {
  const workOrders = useAppStore((s) => s.workOrders);
  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const tabCounts = useMemo(() => {
    const counts: Record<TabKey, number> = {
      pending: 0, processing: 0, escalated: 0, completed: 0,
    };
    workOrders.forEach((wo) => {
      const tab = tabConfig.find((t) => t.match(wo.status));
      if (tab) counts[tab.key]++;
    });
    return counts;
  }, [workOrders]);

  const filtered = useMemo(() => {
    const tab = tabConfig.find((t) => t.key === activeTab);
    if (!tab) return [];
    return workOrders
      .filter((wo) => tab.match(wo.status))
      .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
  }, [workOrders, activeTab]);

  const selected = workOrders.find((w) => w.id === selectedId) || null;

  return (
    <div className="w-full h-full flex flex-col gap-3 p-4">
      <div className="cyber-panel hud-corner p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-5 h-5 text-cyber-accent" />
          <span className="font-orbitron text-base font-bold text-cyber-accent glow-text">
            维修进度
          </span>
          <span className="text-xs text-cyber-muted">
            共 {workOrders.length} 条工单
          </span>
        </div>
      </div>

      <div className="cyber-panel hud-corner p-2 flex gap-2">
        {tabConfig.map((tab) => {
          const active = activeTab === tab.key;
          const count = tabCounts[tab.key];
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all relative flex items-center justify-center gap-2',
                active
                  ? 'text-cyber-accent border border-cyber-accent/60 bg-cyber-accent/10 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                  : 'text-cyber-muted border border-transparent hover:text-cyber-text hover:border-cyber-border'
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  'text-[10px] font-orbitron px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                  active
                    ? 'bg-cyber-accent text-cyber-bg'
                    : 'bg-cyber-border/30 text-cyber-muted'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-cyber">
        {filtered.length === 0 ? (
          <div className="h-full flex items-center justify-center text-cyber-muted text-sm">
            暂无{tabConfig.find(t => t.key === activeTab)?.label}工单
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((wo) => (
              <WorkOrderCard
                key={wo.id}
                wo={wo}
                onClick={() => setSelectedId(wo.id)}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <DetailDrawer wo={selected} onClose={() => setSelectedId(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
