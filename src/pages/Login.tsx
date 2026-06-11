import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Shield, User, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/store';
import type { UserRole, User as UserType } from '../../shared/types';

interface UserOption {
  id: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  faceId: string;
}

const mockUsers: UserOption[] = [
  { id: '1', name: '张工程师', role: 'engineer', roleLabel: '运维工程师', faceId: 'face_001' },
  { id: '2', name: '李主任', role: 'director', roleLabel: '运维主任', faceId: 'face_002' },
  { id: '3', name: '王管理员', role: 'admin', roleLabel: '系统管理员', faceId: 'face_003' },
];

const roleStyles: Record<UserRole, { border: string; iconBg: string; iconBorder: string; iconText: string; labelText: string; indicatorBg: string }> = {
  engineer: { border: 'border-cyber-accent', iconBg: 'bg-cyber-accent/20', iconBorder: 'border-cyber-accent/50', iconText: 'text-cyber-accent', labelText: 'text-cyber-accent', indicatorBg: 'bg-cyber-accent' },
  director: { border: 'border-cyber-accent2', iconBg: 'bg-cyber-accent2/20', iconBorder: 'border-cyber-accent2/50', iconText: 'text-cyber-accent2', labelText: 'text-cyber-accent2', indicatorBg: 'bg-cyber-accent2' },
  admin: { border: 'border-cyber-success', iconBg: 'bg-cyber-success/20', iconBorder: 'border-cyber-success/50', iconText: 'text-cyber-success', labelText: 'text-cyber-success', indicatorBg: 'bg-cyber-success' },
};

const cornerMarkers = [
  'top-2 left-2 border-t-2 border-l-2',
  'top-2 right-2 border-t-2 border-r-2',
  'bottom-2 left-2 border-b-2 border-l-2',
  'bottom-2 right-2 border-b-2 border-r-2',
];

export default function Login() {
  const navigate = useNavigate();
  const setUser = useAppStore((s) => s.setUser);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = () => {
    if (!selectedUser || scanning) return;
    setScanning(true);
    setTimeout(() => {
      setScanSuccess(true);
      setTimeout(() => {
        setUser({ id: selectedUser.id, name: selectedUser.name, role: selectedUser.role, faceId: selectedUser.faceId } as UserType);
        navigate('/dashboard');
      }, 800);
    }, 1800);
  };

  const formatDate = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-cyber-bg">
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-cyber-accent/40 animate-pulse-slow"
            style={{ width: `${2 + Math.random() * 3}px`, height: `${2 + Math.random() * 3}px`, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s`, animationDuration: `${2 + Math.random() * 2}s`, boxShadow: '0 0 6px rgba(0, 229, 255, 0.6)' }}
          />
        ))}
      </div>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(0, 229, 255, 0.08) 0%, transparent 60%)' }} />
      <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-cyber-accent/60" />
      <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-cyber-accent/60" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-cyber-accent/60" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-cyber-accent/60" />

      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex items-center gap-3 mb-8">
          <Shield className="w-10 h-10 text-cyber-accent" strokeWidth={1.5} />
          <h1 className="font-orbitron text-3xl md:text-4xl font-bold text-cyber-accent glow-text tracking-wider">FACE ID AUTHENTICATION</h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative mb-10">
          <div className={`w-56 h-56 md:w-64 md:h-64 rounded-full border-4 overflow-hidden relative ${scanSuccess ? 'border-cyber-success shadow-glow-success' : 'border-cyber-accent shadow-glow'}`} style={{ background: 'radial-gradient(circle, rgba(0, 229, 255, 0.1) 0%, rgba(10, 22, 40, 0.9) 70%)' }}>
            <div className="absolute inset-4 rounded-full border border-cyber-accent/30" />
            <div className="absolute inset-10 rounded-full border border-cyber-accent/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              {selectedUser ? (
                <motion.div key={selectedUser.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center ${scanSuccess ? 'bg-cyber-success/20 border-2 border-cyber-success' : 'bg-cyber-accent/20 border-2 border-cyber-accent'}`}>
                    {scanSuccess ? <CheckCircle2 className="w-12 h-12 text-cyber-success" /> : <User className="w-12 h-12 text-cyber-accent" />}
                  </div>
                  <span className="mt-3 font-orbitron text-sm text-cyber-accent tracking-wide">{selectedUser.name}</span>
                </motion.div>
              ) : (
                <Camera className="w-16 h-16 text-cyber-accent/50" strokeWidth={1} />
              )}
            </div>
            {(scanning || !selectedUser) && (
              <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
                <motion.div className="w-full h-1 bg-gradient-to-r from-transparent via-cyber-accent to-transparent" style={{ boxShadow: '0 0 12px rgba(0, 229, 255, 0.8)' }} animate={{ y: ['-100%', '100%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} />
              </div>
            )}
            {cornerMarkers.map((cls, i) => (
              <div key={i} className={`absolute w-6 h-6 ${cls} ${scanSuccess ? 'border-cyber-success' : 'border-cyber-accent'}`} />
            ))}
          </div>
          <AnimatePresence>
            {scanning && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute -bottom-8 left-1/2 -translate-x-1/2 font-orbitron text-sm text-cyber-accent tracking-widest">
                {scanSuccess ? 'VERIFIED ✓' : 'SCANNING...'}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="flex flex-wrap justify-center gap-4 mb-8">
          {mockUsers.map((u) => {
            const isSelected = selectedUser?.id === u.id;
            const styles = roleStyles[u.role];
            return (
              <motion.button key={u.id} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }} onClick={() => !scanning && setSelectedUser(u)} className={`relative cyber-panel hud-corner p-4 w-44 text-left transition-all duration-300 ${isSelected ? `${styles.border} shadow-glow` : ''} ${scanning ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${styles.iconBg} border ${styles.iconBorder}`}>
                    <User className={`w-5 h-5 ${styles.iconText}`} />
                  </div>
                  <div>
                    <div className="font-orbitron font-semibold text-cyber-text text-sm">{u.name}</div>
                    <div className={`text-xs ${styles.labelText}`}>{u.roleLabel}</div>
                  </div>
                </div>
                <div className="text-xs text-cyber-muted font-mono">ID: {u.faceId.toUpperCase()}</div>
                {isSelected && (
                  <motion.div layoutId="selected-indicator" className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${styles.indicatorBg} flex items-center justify-center shadow-glow`}>
                    <CheckCircle2 className="w-4 h-4 text-cyber-bg" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </motion.div>

        <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleLogin} disabled={!selectedUser || scanning} className={`cyber-btn px-10 py-3 font-orbitron text-lg tracking-widest ${!selectedUser || scanning ? 'opacity-40 cursor-not-allowed' : ''}`}>
          {scanning ? (scanSuccess ? '认证成功' : '识别中...') : '登 录'}
        </motion.button>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.8 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center">
          <div className="font-orbitron text-lg md:text-xl text-cyber-accent/90 tracking-widest glow-text">城市通信基站运维与网络优化三维可视化管控平台</div>
          <div className="mt-2 text-xs text-cyber-muted tracking-[0.3em] font-mono">CITY COMMUNICATION BASE STATION O&M SYSTEM</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 1 }} className="absolute bottom-6 right-6 text-right">
          <div className="font-orbitron text-xl text-cyber-accent glow-text tracking-wide">{formatDate(now).split(' ')[1]}</div>
          <div className="text-xs text-cyber-muted font-mono tracking-wider">{formatDate(now).split(' ')[0]}</div>
        </motion.div>
      </div>
    </div>
  );
}
