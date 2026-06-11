import { motion } from 'framer-motion';
import { Radio, Wifi, AlertTriangle, ClipboardList, User, LogOut } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAppStore } from '@/store';
import { useNavigate } from 'react-router-dom';

interface StatusBarProps {
  title: string;
  stationCount: number;
  onlineRate: number;
  alarmCount: number;
  activeWorkOrders: number;
}

interface StatItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconClass: string;
  textClass: string;
  glow: string;
}

const roleLabels: Record<string, string> = {
  engineer: '运维工程师',
  director: '运维主任',
  admin: '系统管理员',
};

export default function StatusBar({
  title,
  stationCount,
  onlineRate,
  alarmCount,
  activeWorkOrders,
}: StatusBarProps) {
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const navigate = useNavigate();

  const stats: StatItem[] = [
    { label: '基站总数', value: stationCount, icon: Radio, iconClass: 'text-cyber-accent', textClass: 'text-cyber-accent', glow: 'shadow-glow-sm' },
    { label: '在线率', value: `${onlineRate}%`, icon: Wifi, iconClass: 'text-cyber-success', textClass: 'text-cyber-success', glow: 'shadow-glow-success' },
    { label: '当前告警', value: alarmCount, icon: AlertTriangle, iconClass: 'text-cyber-danger', textClass: 'text-cyber-danger', glow: 'shadow-glow-danger' },
    { label: '活跃工单', value: activeWorkOrders, icon: ClipboardList, iconClass: 'text-cyber-warning', textClass: 'text-cyber-warning', glow: 'shadow-glow-warning' },
  ];

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative flex items-center justify-between h-16 px-6 cyber-panel border-b border-cyber-border"
    >
      {/* Left: Page Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-cyber-accent rounded-full shadow-glow-sm" />
          <h1 className="font-orbitron text-xl font-semibold text-cyber-text tracking-wider">
            {title}
          </h1>
        </div>
      </div>

      {/* Middle: Global Stats */}
      <div className="flex items-center gap-3">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.08 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-cyber-border bg-cyber-bg2/50 ${stat.glow}`}
            >
              <Icon className={`w-4 h-4 ${stat.iconClass}`} strokeWidth={2} />
              <div className="flex flex-col">
                <span className="text-[10px] text-cyber-muted tracking-wider uppercase">
                  {stat.label}
                </span>
                <span
                  className={`font-orbitron text-base font-bold ${stat.textClass} glow-text leading-tight`}
                >
                  {stat.value}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Right: User Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg border border-cyber-border bg-cyber-bg2/50">
          <div className="w-8 h-8 rounded-full bg-cyber-accent/20 border border-cyber-accent/50 flex items-center justify-center">
            <User className="w-4 h-4 text-cyber-accent" strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-cyber-text leading-tight">
              {user?.name || '未登录'}
            </span>
            <span className="text-[10px] text-cyber-accent tracking-wider">
              {user ? roleLabels[user.role] : ''}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-md cyber-btn-danger text-sm"
        >
          <LogOut className="w-4 h-4" strokeWidth={2} />
          <span>退出</span>
        </button>
      </div>

      {/* Bottom Glow Line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-accent/50 to-transparent"
        style={{ boxShadow: '0 0 8px rgba(0, 229, 255, 0.5)' }}
      />
    </motion.header>
  );
}
