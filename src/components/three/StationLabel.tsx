import { Html } from '@react-three/drei';
import type { BaseStation, AlarmStatus } from '../../../shared/types';

interface StationLabelProps {
  station: BaseStation;
  position: [number, number, number];
}

const STATUS_COLORS: Record<AlarmStatus, string> = {
  normal: '#00E676',
  warning: '#FFB020',
  critical: '#FF3D57',
  offline: '#555555',
};

export function StationLabel({ station, position }: StationLabelProps) {
  const statusColor = STATUS_COLORS[station.alarmStatus];

  return (
    <Html
      position={position}
      center
      distanceFactor={15}
      style={{ pointerEvents: 'none' }}
    >
      <div
        style={{
          background: 'rgba(10, 22, 40, 0.85)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(0, 229, 255, 0.3)',
          borderRadius: '8px',
          padding: '8px 12px',
          minWidth: '140px',
          color: '#fff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '11px',
          lineHeight: '1.5',
          boxShadow: `0 0 20px ${statusColor}33`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: statusColor,
              boxShadow: `0 0 8px ${statusColor}`,
            }}
          />
          <span style={{ fontWeight: 600, color: '#00e5ff' }}>{station.name}</span>
        </div>
        <div style={{ color: '#aaccff', marginTop: '4px' }}>
          <div>在线用户: <span style={{ color: '#fff' }}>{station.onlineUsers}</span></div>
          <div>上行: <span style={{ color: '#4fc3f7' }}>{station.uplinkTraffic.toFixed(1)}G</span></div>
          <div>下行: <span style={{ color: '#81d4fa' }}>{station.downlinkTraffic.toFixed(1)}G</span></div>
        </div>
      </div>
    </Html>
  );
}
