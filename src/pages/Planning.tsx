import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Plus, Check, X, CircleDot, User, Clock,
  Radio, Shield, Building2, Settings, AlertTriangle,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import type { ApprovalStatus, UserRole, SiteSelection } from '../../shared/types';

const approvalColors: Record<ApprovalStatus, string> = {
  pending: '#FFB020', approved: '#00E676', rejected: '#FF3D57',
};
const approvalLabels: Record<ApprovalStatus, string> = {
  pending: '待审批', approved: '已通过', rejected: '已驳回',
};

function ApprovalTag({ status }: { status: ApprovalStatus }) {
  return (
    <span className="px-2 py-0.5 rounded text-xs font-medium"
      style={{ color: approvalColors[status], backgroundColor: `${approvalColors[status]}15` }}>
      {approvalLabels[status]}
    </span>
  );
}

const stages = [
  { key: 'planning' as const, label: '规划审批', icon: MapPin, minRole: 'director' as UserRole },
  { key: 'construction' as const, label: '建设审批', icon: Building2, minRole: 'director' as UserRole },
  { key: 'operation' as const, label: '运维审批', icon: Settings, minRole: 'admin' as UserRole },
];

const roleLevel: Record<UserRole, number> = { engineer: 0, director: 1, admin: 2 };
function canApprove(userRole: UserRole, minRole: UserRole) {
  return roleLevel[userRole] >= roleLevel[minRole];
}

function getStageData(sel: SiteSelection, key: string) {
  if (key === 'planning') return { status: sel.planningApproval, approver: sel.planningApprover, comment: sel.planningComment };
  if (key === 'construction') return { status: sel.constructionApproval, approver: sel.constructionApprover, comment: sel.constructionComment };
  return { status: sel.operationApproval, approver: sel.operationApprover, comment: sel.operationComment };
}

export default function Planning() {
  const siteSelections = useAppStore((s) => s.siteSelections);
  const user = useAppStore((s) => s.user);
  const planningMode = useAppStore((s) => s.planningMode);
  const candidatePosition = useAppStore((s) => s.candidatePosition);
  const setPlanningMode = useAppStore((s) => s.setPlanningMode);
  const setCandidatePosition = useAppStore((s) => s.setCandidatePosition);
  const createSiteSelection = useAppStore((s) => s.createSiteSelection);
  const approveSiteSelection = useAppStore((s) => s.approveSiteSelection);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [radius, setRadius] = useState(100);
  const [comments, setComments] = useState<Record<string, string>>({});

  useEffect(() => { if (candidatePosition) setShowConfirm(true); }, [candidatePosition]);
  const selected = siteSelections.find((s) => s.id === selectedId);

  const handleCreate = async () => {
    if (!candidatePosition || !user) return;
    await createSiteSelection({
      position: candidatePosition, applicant: user.name,
      applyTime: new Date().toLocaleString(), planningApproval: 'pending',
      constructionApproval: 'pending', operationApproval: 'pending', coverageRadius: radius,
    });
    setShowConfirm(false); setCandidatePosition(null); setPlanningMode(false);
  };

  const handleApprove = async (stageKey: string, approved: boolean) => {
    if (!selected || !user) return;
    await approveSiteSelection(selected.id, stageKey, approved ? 'approved' : 'rejected', user.name, comments[stageKey] || '');
    setComments((p) => ({ ...p, [stageKey]: '' }));
  };

  const closeConfirm = () => { setShowConfirm(false); setCandidatePosition(null); };

  return (
    <div className="w-full h-full flex flex-col gap-3 p-4">
      <div className="cyber-panel hud-corner p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-cyber-accent" />
          <span className="font-orbitron text-base font-bold text-cyber-accent glow-text">选址规划</span>
          <span className="text-xs text-cyber-muted">共 {siteSelections.length} 条申请</span>
        </div>
        <div className="flex items-center gap-2">
          {planningMode && (
            <span className="text-xs text-cyber-warning flex items-center gap-1">
              <CircleDot className="w-3 h-3 animate-pulse" /> 选址模式已开启，请在3D场景点击选点
            </span>
          )}
          <button onClick={() => { setPlanningMode(!planningMode); setCandidatePosition(null); }}
            className={cn('cyber-btn text-xs py-1.5 flex items-center gap-1',
              planningMode && 'bg-cyber-warning/15 border-cyber-warning/60 text-cyber-warning hover:bg-cyber-warning/25')}>
            {planningMode ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {planningMode ? '关闭选址模式' : '开启选址模式'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-3 min-h-0">
        <div className="cyber-panel hud-corner flex flex-col overflow-hidden" style={{ width: '50%' }}>
          <div className="px-4 py-2.5 border-b border-cyber-border flex items-center text-xs text-cyber-muted font-medium">
            <div className="w-24">申请编号</div>
            <div className="w-20">申请人</div>
            <div className="w-36">申请时间</div>
            <div className="w-20">规划</div>
            <div className="w-20">建设</div>
            <div className="w-20">运维</div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-cyber">
            {siteSelections.map((s) => {
              const active = selectedId === s.id;
              return (
                <div key={s.id} onClick={() => setSelectedId(s.id)}
                  className={cn('px-4 py-3 border-b border-cyber-border/50 cursor-pointer transition-all',
                    active ? 'bg-cyber-accent/10' : 'hover:bg-cyber-accent/5')}>
                  <div className="flex items-center">
                    <div className="w-24 font-orbitron text-cyber-accent text-sm">{s.id}</div>
                    <div className="w-20 text-sm text-cyber-text truncate">{s.applicant}</div>
                    <div className="w-36 text-xs text-cyber-muted font-orbitron">{s.applyTime}</div>
                    <div className="w-20"><ApprovalTag status={s.planningApproval} /></div>
                    <div className="w-20"><ApprovalTag status={s.constructionApproval} /></div>
                    <div className="w-20"><ApprovalTag status={s.operationApproval} /></div>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-cyber-muted">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />
                      ({s.position.x.toFixed(1)}, {s.position.y.toFixed(1)}, {s.position.z.toFixed(1)})
                    </span>
                    <span className="flex items-center gap-1"><Radio className="w-3 h-3" />覆盖 {s.coverageRadius}m</span>
                  </div>
                </div>
              );
            })}
            {siteSelections.length === 0 && <div className="text-center text-cyber-muted py-12 text-sm">暂无选址申请</div>}
          </div>
        </div>

        <div className="cyber-panel hud-corner flex flex-col overflow-hidden" style={{ width: '50%' }}>
          <div className="px-4 py-2.5 border-b border-cyber-border flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyber-accent" />
            <span className="font-orbitron text-sm font-bold text-cyber-accent glow-text">审批详情</span>
          </div>
          {selected ? (
            <div className="flex-1 overflow-y-auto scrollbar-cyber p-4 space-y-4">
              <div className="cyber-panel p-3 border border-cyber-border/60">
                <div className="text-xs text-cyber-muted mb-1.5 flex items-center gap-1"><MapPin className="w-3 h-3" /> 选址位置</div>
                <div className="flex items-center justify-between">
                  <div className="font-orbitron text-cyber-text text-sm">
                    X: {selected.position.x.toFixed(2)} Y: {selected.position.y.toFixed(2)} Z: {selected.position.z.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-cyber-accent"><Radio className="w-3 h-3" />覆盖 {selected.coverageRadius}m</div>
                </div>
                <div className="mt-2 h-20 rounded bg-cyber-bg2/50 border border-cyber-border/50 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 grid-bg opacity-40" />
                  <div className="w-14 h-14 rounded-full border-2 border-cyber-accent/40 flex items-center justify-center"
                    style={{ boxShadow: '0 0 30px rgba(0, 229, 255, 0.25) inset' }}>
                    <div className="w-7 h-7 rounded-full bg-cyber-accent/30 flex items-center justify-center">
                      <MapPin className="w-3.5 h-3.5 text-cyber-accent" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><div className="text-xs text-cyber-muted mb-1 flex items-center gap-1"><User className="w-3 h-3" /> 申请人</div>
                  <div className="text-sm text-cyber-text">{selected.applicant}</div></div>
                <div><div className="text-xs text-cyber-muted mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> 申请时间</div>
                  <div className="text-sm text-cyber-text font-orbitron">{selected.applyTime}</div></div>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-cyber-muted flex items-center gap-1"><Shield className="w-3 h-3" /> 三级审批流程</div>
                {stages.map((stage, idx) => {
                  const sd = getStageData(selected, stage.key);
                  const approve = user ? canApprove(user.role, stage.minRole) : false;
                  const isEngineer = user?.role === 'engineer';
                  return (
                    <div key={stage.key} className="cyber-panel p-3 border border-cyber-border/60">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-cyber-accent/10 flex items-center justify-center">
                            <stage.icon className="w-3.5 h-3.5 text-cyber-accent" />
                          </div>
                          <span className="text-sm text-cyber-text font-medium">{idx + 1}. {stage.label}</span>
                          {isEngineer && <span className="text-[10px] text-cyber-muted">（无审批权限）</span>}
                        </div>
                        <ApprovalTag status={sd.status} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-cyber-muted mb-2">审批人: {sd.approver || '-'}</div>
                      {sd.comment && (
                        <div className="text-xs text-cyber-muted mb-2 p-2 rounded bg-cyber-bg2/50 border border-cyber-border/40">审批意见: {sd.comment}</div>
                      )}
                      {approve && sd.status === 'pending' && (
                        <div className="space-y-2">
                          <input value={comments[stage.key] || ''}
                            onChange={(e) => setComments((p) => ({ ...p, [stage.key]: e.target.value }))}
                            placeholder="输入审批意见（可选）" className="cyber-input text-xs py-1.5" />
                          <div className="flex gap-2">
                            <button onClick={() => handleApprove(stage.key, true)}
                              className="flex-1 cyber-btn-success text-xs py-1.5 flex items-center justify-center gap-1">
                              <Check className="w-3 h-3" /> 通过
                            </button>
                            <button onClick={() => handleApprove(stage.key, false)}
                              className="flex-1 cyber-btn-danger text-xs py-1.5 flex items-center justify-center gap-1">
                              <X className="w-3 h-3" /> 驳回
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : <div className="flex-1 flex items-center justify-center text-cyber-muted text-sm">请选择选址申请查看详情</div>}
        </div>
      </div>

      <AnimatePresence>
        {showConfirm && candidatePosition && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 flex items-center justify-center z-50" onClick={closeConfirm}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }} onClick={(e) => e.stopPropagation()}
              className="cyber-panel hud-corner p-5 w-[420px]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-cyber-accent" />
                  <span className="font-orbitron text-base font-bold text-cyber-accent glow-text">确认选址</span>
                </div>
                <button onClick={closeConfirm} className="text-cyber-muted hover:text-cyber-text"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                <div className="cyber-panel p-3 border border-cyber-border/60">
                  <div className="text-xs text-cyber-muted mb-1">选中位置坐标</div>
                  <div className="font-orbitron text-cyber-accent text-sm">
                    X: {candidatePosition.x.toFixed(2)} &nbsp; Y: {candidatePosition.y.toFixed(2)} &nbsp; Z: {candidatePosition.z.toFixed(2)}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-cyber-muted block mb-1 flex items-center gap-1"><Radio className="w-3 h-3" /> 覆盖半径（米）</label>
                  <input type="number" value={radius} min={20} max={500} step={10}
                    onChange={(e) => setRadius(Number(e.target.value))} className="cyber-input text-sm" />
                </div>
                <div className="flex items-start gap-2 p-2 rounded bg-cyber-warning/10 border border-cyber-warning/30">
                  <AlertTriangle className="w-4 h-4 text-cyber-warning mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-cyber-warning leading-relaxed">申请提交后将进入三级审批流程：规划 → 建设 → 运维</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={closeConfirm} className="flex-1 px-4 py-2 rounded border border-cyber-border text-cyber-muted hover:text-cyber-text text-sm">取消</button>
                <button onClick={handleCreate} className="flex-1 cyber-btn text-sm">确认提交申请</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
