import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Radio,
  ClipboardList,
  MapPin,
  Plane,
  BarChart3,
  Settings,
  Zap,
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

interface MenuItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

const menuItems: MenuItem[] = [
  { path: '/dashboard', label: '监控中心', icon: Radio },
  { path: '/workorders', label: '工单管理', icon: ClipboardList },
  { path: '/planning', label: '选址规划', icon: MapPin },
  { path: '/drone', label: '无人机巡检', icon: Plane },
  { path: '/reports', label: '报表中心', icon: BarChart3 },
  { path: '/settings', label: '系统设置', icon: Settings },
];

export default function Sidebar() {
  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative h-full w-20 flex flex-col items-center py-4 cyber-panel border-r border-cyber-border"
    >
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center">
        <div className="w-12 h-12 rounded-xl bg-cyber-accent/15 border border-cyber-accent/50 flex items-center justify-center shadow-glow-sm">
          <Zap className="w-7 h-7 text-cyber-accent" strokeWidth={1.5} />
        </div>
        <div className="mt-2 font-orbitron text-[10px] text-cyber-accent tracking-widest">
          OMS
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 flex flex-col items-center gap-2 w-full">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group relative flex items-center justify-center w-14 h-14 rounded-xl transition-all duration-300
                  ${isActive
                    ? 'bg-cyber-accent/20 border border-cyber-accent shadow-glow-sm'
                    : 'border border-transparent hover:bg-cyber-accent/10 hover:border-cyber-accent/40'
                  }`
              }
            >
              {({ isActive }) => (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <Icon
                      className={`w-6 h-6 transition-colors duration-300 ${
                        isActive ? 'text-cyber-accent' : 'text-cyber-muted group-hover:text-cyber-accent'
                      }`}
                      strokeWidth={isActive ? 2 : 1.5}
                    />
                  </motion.div>

                  {/* Tooltip on hover */}
                  <div
                    className="absolute left-full ml-3 px-3 py-1.5 rounded-md bg-cyber-bg2 border border-cyber-border
                      text-cyber-text text-sm font-medium whitespace-nowrap pointer-events-none
                      opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0
                      transition-all duration-200 z-50 shadow-glow-sm"
                  >
                    {item.label}
                    <div
                      className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2
                        bg-cyber-bg2 border-l border-b border-cyber-border rotate-45"
                    />
                  </div>

                  {/* Active indicator dot */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-dot"
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyber-accent shadow-glow"
                    />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Decoration */}
      <div className="mt-4 flex flex-col items-center gap-2 text-cyber-muted/50">
        <div className="w-8 h-px bg-cyber-border" />
        <div className="font-mono text-[9px] tracking-wider">V1.0.0</div>
      </div>
    </motion.aside>
  );
}
