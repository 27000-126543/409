import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Filter, Plus, Clock, CheckCircle2,
  PlayCircle, ArrowUpCircle, UserCheck, X, AlertTriangle,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import type { WorkOrderStatus } from '../../shared/types';

const statusColors: Record<WorkOrderStatus, string> = {
  pending: '#FFB020', assigned: '#00E5FF', processing: '#7B61FF',
  completed: '#00E676', escalated: '#FF3D57',
};
const statusLabels: Record<WorkOrderStatus, string> = {
  pending: '待派单', assigned: '已派单', processing: '处理中',
  completed: '已完成', escalated: '已升级',
};
const priorityColors = { normal: '#7A8BA3', high: '#FFB020', urgent: '#FF3D57' };
const priorityLabels = { normal: '普通', high: '高', urgent: '紧急' };
const faultTypes = ['信号中断', '电源故障', '传输故障', '温度异常', '湿度异常', '电池故障', '天线故障', '带宽不足'];

function isOverdue(wo: { createTime: string; status: WorkOrderStatus }) {
  if (wo.status === 'completed') return false;
  return Date.now() - new Date(wo.createTime).getTime() > 30 * 60 * 1000;
}

function StatusTag({ status }: { status: WorkOrderStatus }) {
  return (
    <span className="px-2 py-0.5 rounded text-xs font-medium"
      style={{ color: statusColors[status], backgroundColor: `${statusColors[status]}15` }}>
      {statusLabels[status]}
    </span>
  );
}

function PriorityTag({ p }: { p: 'normal' | 'high' | 'urgent' }) {
  return (
    <span className="px-2 py-0.5 rounded text-xs font-medium"
      style={{ color: priorityColors[p], backgroundColor: `${priorityColors[p]}15` }}>
      {priorityLabels[p]}
    </span>
  );
}

export default function WorkOrders() {
  const workOrders = useAppStore((s) => s.workOrders);
  const stations = useAppStore((s) => s.stations);
  const user = useAppStore((s) => s.user);
  const createWorkOrder = useAppStore((s) => s.createWorkOrder);
  const updateWorkOrderStatus = useAppStore((s) => s.updateWorkOrderStatus);

  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newStationId, setNewStationId] = useState('');
  const [newFaultType, setNewFaultType] = useState(faultTypes[0]);
  const [newPriority, setNewPriority] = useState<'normal' | 'high' | 'urgent'>('normal');

  const filtered = useMemo(() => workOrders.filter((w) =>
    (statusFilter === 'all' || w.status === statusFilter) &&
    (priorityFilter === 'all' || w.priority === priorityFilter)
  ), [workOrders, statusFilter, priorityFilter]);

  const selected = workOrders.find((w) => w.id === selectedId);

  const handleCreate = async () => {
    if (!newStationId || !user) return;
    await createWorkOrder({
      stationId: newStationId,
      stationName: stations.find((s) => s.id === newStationId)?.name || '',
      faultType: newFaultType, priority: newPriority, status: 'pending',
    });
    setShowCreate(false); setNewStationId('');
  };

  const handleStatus = async (status: WorkOrderStatus) => {
    if (!selected || !user) return;
    await updateWorkOrderStatus(selected.id, status, status === 'assigned' ? user.id : undefined);
  };

  const timeline = (wo: typeof selected) => {
    if (!wo) return null;
    const steps = [
      { label: '创建工单', time: wo.createTime, done: true },
      { label: '派单', time: wo.assignTime, done: !!wo.assignTime },
      { label: '开始处理', done: wo.status === 'processing' || wo.status === 'completed' },
      { label: '完成', done: wo.status === 'completed' },
    ];
    return (
      <div className="space-y-1">
        {steps.map((s, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={cn('w-3 h-3 rounded-full border-2',
                s.done ? 'bg-cyber-accent border-cyber-accent shadow-glow-sm' : 'bg-transparent border-cyber-muted')} />
              {i < steps.length - 1 && <div className={cn('w-px flex-1 mt-1', s.done ? 'bg-cyber-accent/50' : 'bg-cyber-border')} />}
            </div>
            <div className="pb-3">
              <div className={cn('text-sm', s.done ? 'text-cyber-text' : 'text-cyber-muted')}>{s.label}</div>
              {s.time && <div className="text-xs text-cyber-muted font-orbitron">{s.time}</div>}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col gap-3 p-4">
      <div className="cyber-panel hud-corner p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-5 h-5 text-cyber-accent" />
          <span className="font-orbitron text-base font-bold text-cyber-accent glow-text">工单管理</span>
          <span className="text-xs text-cyber-muted">共 {filtered.length} 条</span>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-cyber-muted" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="cyber-input text-xs py-1.5 px-2 w-28">
            <option value="all">全部状态</option>
            {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
            className="cyber-input text-xs py-1.5 px-2 w-28">
            <option value="all">全部优先级</option>
            {Object.entries(priorityLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button onClick={() => setShowCreate(true)} className="cyber-btn text-xs py-1.5 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> 创建工单
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-3 min-h-0">
        <div className="cyber-panel hud-corner flex flex-col overflow-hidden" style={{ width: '70%' }}>
          <div className="px-4 py-2.5 border-b border-cyber-border flex items-center text-xs text-cyber-muted font-medium">
            <div className="w-24">工单号</div>
            <div className="flex-1">基站名称</div>
            <div className="w-24">故障类型</div>
            <div className="w-20">优先级</div>
            <div className="w-36">派单时间</div>
            <div className="w-20">状态</div>
            <div className="w-20">维护人员</div>
            <div className="w-20 text-right">操作</div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-cyber">
            {filtered.map((wo) => {
              const overdue = isOverdue(wo);
              const active = selectedId === wo.id;
              return (
                <div key={wo.id} onClick={() => setSelectedId(wo.id)}
                  className={cn('px-4 py-2.5 border-b border-cyber-border/50 flex items-center text-sm cursor-pointer transition-all',
                    active ? 'bg-cyber-accent/10' : 'hover:bg-cyber-accent/5', overdue && 'border-l-2')}
                  style={overdue ? { borderLeftColor: '#FF3D57' } : undefined}>
                  <div className="w-24 font-orbitron text-cyber-accent">{wo.id}</div>
                  <div className="flex-1 text-cyber-text truncate">{wo.stationName}</div>
                  <div className="w-24 text-cyber-muted truncate">{wo.faultType}</div>
                  <div className="w-20"><PriorityTag p={wo.priority} /></div>
                  <div className="w-36 text-cyber-muted text-xs font-orbitron">{wo.createTime || '-'}</div>
                  <div className="w-20"><StatusTag status={wo.status} /></div>
                  <div className="w-20 text-cyber-muted text-xs truncate">{wo.maintainerName || '-'}</div>
                  <div className="w-20 text-right text-xs text-cyber-accent">{active ? '详情 →' : '查看'}</div>
                </div>
              );
            })}
            {filtered.length === 0 && <div className="text-center text-cyber-muted py-12 text-sm">暂无工单数据</div>}
          </div>
        </div>

        <div className="cyber-panel hud-corner flex flex-col overflow-hidden" style={{ width: '30%' }}>
          <div className="px-4 py-2.5 border-b border-cyber-border flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-cyber-accent" />
            <span className="font-orbitron text-sm font-bold text-cyber-accent glow-text">工单详情</span>
          </div>
          {selected ? (
            <div className="flex-1 overflow-y-auto scrollbar-cyber p-4 space-y-4">
              <div>
                <div className="text-xs text-cyber-muted mb-1">工单号</div>
                <div className="font-orbitron text-cyber-accent text-lg glow-text">{selected.id}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><div className="text-xs text-cyber-muted mb-1">基站</div><div className="text-sm text-cyber-text">{selected.stationName}</div></div>
                <div><div className="text-xs text-cyber-muted mb-1">故障类型</div><div className="text-sm text-cyber-text">{selected.faultType}</div></div>
                <div><div className="text-xs text-cyber-muted mb-1">优先级</div><PriorityTag p={selected.priority} /></div>
                <div><div className="text-xs text-cyber-muted mb-1">状态</div><StatusTag status={selected.status} /></div>
                <div><div className="text-xs text-cyber-muted mb-1">维护人员</div><div className="text-sm text-cyber-text">{selected.maintainerName || '-'}</div></div>
                <div><div className="text-xs text-cyber-muted mb-1">响应时间</div>
                  <div className="text-sm text-cyber-text font-orbitron">{selected.responseTime ? `${selected.responseTime}分钟` : '-'}</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-cyber-muted mb-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 处理进度
                </div>
                {timeline(selected)}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cyber-border">
                {selected.status === 'pending' && (
                  <button onClick={() => handleStatus('assigned')} className="cyber-btn text-xs py-2 flex items-center justify-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" /> 接单
                  </button>
                )}
                {(selected.status === 'pending' || selected.status === 'assigned') && (
                  <button onClick={() => handleStatus('processing')} className="cyber-btn text-xs py-2 flex items-center justify-center gap-1">
                    <PlayCircle className="w-3.5 h-3.5" /> 开始处理
                  </button>
                )}
                {selected.status === 'processing' && (
                  <button onClick={() => handleStatus('completed')} className="cyber-btn-success text-xs py-2 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 完成
                  </button>
                )}
                {selected.status !== 'completed' && selected.status !== 'escalated' && (
                  <button onClick={() => handleStatus('escalated')} className="cyber-btn-danger text-xs py-2 flex items-center justify-center gap-1">
                    <ArrowUpCircle className="w-3.5 h-3.5" /> 升级
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-cyber-muted text-sm">请选择工单查看详情</div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 flex items-center justify-center z-50"
            onClick={() => setShowCreate(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }} onClick={(e) => e.stopPropagation()}
              className="cyber-panel hud-corner p-5 w-[420px]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-cyber-accent" />
                  <span className="font-orbitron text-base font-bold text-cyber-accent glow-text">创建工单</span>
                </div>
                <button onClick={() => setShowCreate(false)} className="text-cyber-muted hover:text-cyber-text">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-cyber-muted block mb-1">选择基站</label>
                  <select value={newStationId} onChange={(e) => setNewStationId(e.target.value)} className="cyber-input text-sm">
                    <option value="">请选择基站</option>
                    {stations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-cyber-muted block mb-1">故障类型</label>
                  <select value={newFaultType} onChange={(e) => setNewFaultType(e.target.value)} className="cyber-input text-sm">
                    {faultTypes.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-cyber-muted block mb-1">优先级</label>
                  <div className="flex gap-2">
                    {(['normal', 'high', 'urgent'] as const).map((p) => (
                      <button key={p} onClick={() => setNewPriority(p)}
                        className={cn('flex-1 px-3 py-2 rounded text-sm transition-all border',
                          newPriority === p ? '' : 'text-cyber-muted border-cyber-border hover:border-cyber-accent/40')}
                        style={newPriority === p ? { color: priorityColors[p], borderColor: `${priorityColors[p]}60`, backgroundColor: `${priorityColors[p]}15` } : undefined}>
                        {priorityLabels[p]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2 rounded border border-cyber-border text-cyber-muted hover:text-cyber-text text-sm">取消</button>
                <button onClick={handleCreate} disabled={!newStationId} className="flex-1 cyber-btn text-sm disabled:opacity-40 disabled:cursor-not-allowed">确认创建</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
