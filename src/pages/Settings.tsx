import { useEffect, useState } from 'react';
import {
  Settings,
  Users,
  FileText,
  Info,
  Server,
  Clock,
  Shield,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { User, OperationLog } from '../../shared/types';

const roleLabels: Record<string, string> = {
  engineer: '运维工程师',
  director: '主管',
  admin: '系统管理员',
};

const roleColors: Record<string, string> = {
  engineer: 'text-cyber-accent border-cyber-accent/40 bg-cyber-accent/10',
  director: 'text-[#7B61FF] border-[#7B61FF]/40 bg-[#7B61FF]/10',
  admin: 'text-cyber-danger border-cyber-danger/40 bg-cyber-danger/10',
};

export default function SettingsPage() {
  const [tab, setTab] = useState<'users' | 'logs'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [now, setNow] = useState(new Date());
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (tab === 'users') {
      api.getUsers().then(setUsers).catch(console.error);
    } else {
      api.getLogs().then((data) => {
        const sorted = [...data].sort((a, b) => (a.time < b.time ? 1 : -1));
        setLogs(sorted);
      }).catch(() => setConnected(false));
    }
  }, [tab]);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4 overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyber-accent" />
          <span className="font-orbitron text-base font-bold text-cyber-accent glow-text">
            系统设置
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="cyber-panel px-3 py-1.5 flex items-center gap-2">
            <Server className="w-4 h-4 text-cyber-muted" />
            <span className="text-xs text-cyber-muted">版本</span>
            <span className="text-xs text-cyber-accent font-mono">v1.0.0</span>
          </div>
          <div className="cyber-panel px-3 py-1.5 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyber-muted" />
            <span className="text-xs text-cyber-muted">服务器时间</span>
            <span className="text-xs text-cyber-accent font-mono">
              {now.toLocaleString('zh-CN', { hour12: false })}
            </span>
          </div>
          <div className="cyber-panel px-3 py-1.5 flex items-center gap-2">
            {connected ? (
              <Wifi className="w-4 h-4 text-cyber-success" />
            ) : (
              <WifiOff className="w-4 h-4 text-cyber-danger" />
            )}
            <span className={cn('text-xs font-medium', connected ? 'text-cyber-success' : 'text-cyber-danger')}>
              {connected ? '已连接' : '连接异常'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0">
        <button
          onClick={() => setTab('users')}
          className={cn(
            'px-5 py-2 rounded-t-lg flex items-center gap-2 text-sm font-medium transition-all border-b-2',
            tab === 'users'
              ? 'text-cyber-accent border-cyber-accent bg-cyber-accent/10'
              : 'text-cyber-muted border-transparent hover:text-cyber-text hover:bg-cyber-bg2/40'
          )}
        >
          <Users className="w-4 h-4" />
          用户管理
        </button>
        <button
          onClick={() => setTab('logs')}
          className={cn(
            'px-5 py-2 rounded-t-lg flex items-center gap-2 text-sm font-medium transition-all border-b-2',
            tab === 'logs'
              ? 'text-cyber-accent border-cyber-accent bg-cyber-accent/10'
              : 'text-cyber-muted border-transparent hover:text-cyber-text hover:bg-cyber-bg2/40'
          )}
        >
          <FileText className="w-4 h-4" />
          操作日志
        </button>
      </div>

      <div className="cyber-panel hud-corner p-4 flex-1 flex flex-col min-h-0 overflow-hidden">
        {tab === 'users' ? (
          <>
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyber-accent" />
                <span className="font-orbitron text-sm font-bold text-cyber-accent glow-text">
                  用户列表
                </span>
                <span className="text-xs text-cyber-muted">({users.length})</span>
              </div>
            </div>
            <div className="flex-1 overflow-auto scrollbar-cyber" style={{ maxHeight: '60vh' }}>
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-cyber-bg2/90 backdrop-blur z-10">
                  <tr className="text-left text-cyber-muted text-xs">
                    <th className="px-4 py-2.5 font-medium">用户ID</th>
                    <th className="px-4 py-2.5 font-medium">姓名</th>
                    <th className="px-4 py-2.5 font-medium">角色</th>
                    <th className="px-4 py-2.5 font-medium">人脸ID</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-cyber-muted py-8">
                        暂无用户数据
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr
                        key={u.id}
                        className="border-t border-cyber-border/40 hover:bg-cyber-accent/5 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-cyber-accent">{u.id}</td>
                        <td className="px-4 py-3 text-cyber-text font-medium">{u.name}</td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'text-xs px-2.5 py-1 rounded border',
                              roleColors[u.role] || 'text-cyber-muted border-cyber-muted/40 bg-cyber-muted/10'
                            )}
                          >
                            {roleLabels[u.role] || u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-cyber-muted font-mono text-xs">{u.faceId}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-cyber-accent" />
                <span className="font-orbitron text-sm font-bold text-cyber-accent glow-text">
                  操作日志
                </span>
                <span className="text-xs text-cyber-muted">({logs.length})</span>
              </div>
            </div>
            <div className="flex-1 overflow-auto scrollbar-cyber" style={{ maxHeight: '60vh' }}>
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-cyber-bg2/90 backdrop-blur z-10">
                  <tr className="text-left text-cyber-muted text-xs">
                    <th className="px-4 py-2.5 font-medium whitespace-nowrap">操作时间</th>
                    <th className="px-4 py-2.5 font-medium">操作人</th>
                    <th className="px-4 py-2.5 font-medium">角色</th>
                    <th className="px-4 py-2.5 font-medium">操作类型</th>
                    <th className="px-4 py-2.5 font-medium">操作详情</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-cyber-muted py-8">
                        暂无日志数据
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-t border-cyber-border/40 hover:bg-cyber-accent/5 transition-colors"
                      >
                        <td className="px-4 py-3 text-cyber-muted text-xs font-mono whitespace-nowrap">
                          {log.time}
                        </td>
                        <td className="px-4 py-3 text-cyber-text">{log.userName}</td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'text-xs px-2 py-0.5 rounded border',
                              roleColors[log.userRole] || 'text-cyber-muted border-cyber-muted/40 bg-cyber-muted/10'
                            )}
                          >
                            {roleLabels[log.userRole] || log.userRole}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-cyber-accent">{log.action}</td>
                        <td className="px-4 py-3 text-cyber-muted text-xs">{log.detail}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
