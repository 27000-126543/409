import { useEffect, useMemo } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import StatusBar from './StatusBar';
import AlarmPanel from '@/components/ui/AlarmPanel';
import { useAppStore } from '@/store';

const pageTitles: Record<string, string> = {
  '/dashboard': '监控中心',
  '/workorders': '工单管理',
  '/planning': '选址规划',
  '/drone': '无人机巡检',
  '/reports': '报表中心',
  '/settings': '系统设置',
};

export default function MainLayout() {
  const location = useLocation();
  const user = useAppStore((s) => s.user);
  const stations = useAppStore((s) => s.stations);
  const alarms = useAppStore((s) => s.alarms);
  const workOrders = useAppStore((s) => s.workOrders);

  const title = pageTitles[location.pathname] || '监控中心';

  useEffect(() => {
    const store = useAppStore.getState();
    store.loadAll();
    const stopPolling = store.startPolling();
    return () => stopPolling();
  }, []);

  const stats = useMemo(() => {
    const total = stations.length;
    const onlineCount = stations.filter((s) => s.alarmStatus !== 'offline').length;
    const onlineRate = total > 0 ? Math.round((onlineCount / total) * 100) : 0;
    const unhandledAlarms = alarms.filter((a) => !a.handled).length;
    const active = workOrders.filter((w) =>
      ['pending', 'assigned', 'processing'].includes(w.status)
    ).length;
    return {
      stationCount: total,
      onlineRate,
      alarmCount: unhandledAlarms,
      activeWorkOrders: active,
    };
  }, [stations, alarms, workOrders]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="relative w-full h-full flex bg-cyber-bg overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      <Sidebar />

      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <StatusBar
          title={title}
          stationCount={stats.stationCount}
          onlineRate={stats.onlineRate}
          alarmCount={stats.alarmCount}
          activeWorkOrders={stats.activeWorkOrders}
        />

        <main className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AlarmPanel />
    </div>
  );
}
