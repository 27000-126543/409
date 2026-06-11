import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { BaseStation, AlarmStatus } from '../../../shared/types';
import { useAppStore } from '../../store';
import { StationLabel } from './StationLabel';

interface StationProps {
  station: BaseStation;
}

const ALARM_COLORS: Record<AlarmStatus, string> = {
  normal: '#00E676',
  warning: '#FFB020',
  critical: '#FF3D57',
  offline: '#555555',
};

function AntennaArray({ tilt, color }: { tilt: number; color: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const currentTilt = useRef(tilt);

  useFrame((_, delta) => {
    currentTilt.current += (tilt - currentTilt.current) * Math.min(delta * 3, 1);
    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.degToRad(currentTilt.current);
    }
  });

  return (
    <group ref={groupRef}>
      {[-1, 0, 1].map((i) => (
        <mesh key={i} position={[i * 1.2, 0, 0.8]} rotation={[0, i * 0.3, 0]}>
          <boxGeometry args={[0.3, 2, 0.6]} />
          <meshStandardMaterial color="#8899aa" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 0, 1.2]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

function MacroStation({ color, tilt }: { color: string; tilt: number }) {
  return (
    <group>
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[4, 3, 3]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <mesh position={[0, 17, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.5, 30, 8]} />
        <meshStandardMaterial color="#556677" metalness={0.5} />
      </mesh>
      <group position={[0, 28, 0]}>
        <AntennaArray tilt={tilt} color={color} />
      </group>
      <mesh position={[0, 30.5, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}

function MicroStation({ color, tilt }: { color: string; tilt: number }) {
  return (
    <group>
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      <mesh position={[0, 6, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 8, 6]} />
        <meshStandardMaterial color="#667788" metalness={0.5} />
      </mesh>
      <group position={[0, 8.5, 0]} scale={0.6}>
        <AntennaArray tilt={tilt} color={color} />
      </group>
      <mesh position={[0, 9.5, 0]}>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}

function IndoorStation({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[3, 4, 3]} />
        <meshStandardMaterial color="#3a4a5a" />
      </mesh>
      <mesh position={[0, 4.2, 0]}>
        <boxGeometry args={[2, 0.2, 2]} />
        <meshStandardMaterial color="#4a5a6a" emissive={color} emissiveIntensity={0.6} />
      </mesh>
      {[-0.5, 0.5].map((x) =>
        [-0.5, 0.5].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 4.3, z]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} />
          </mesh>
        ))
      )}
    </group>
  );
}

function CoreStation({ color, tilt }: { color: string; tilt: number }) {
  return (
    <group>
      <mesh position={[0, 5, 0]} castShadow>
        <boxGeometry args={[15, 10, 10]} />
        <meshStandardMaterial color="#1e2a3a" />
      </mesh>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh
          key={i}
          position={[-6 + (i % 4) * 4, 3 + Math.floor(i / 4) * 4, 5.01]}
        >
          <planeGeometry args={[2.5, 2.5]} />
          <meshStandardMaterial
            color="#4fc3f7"
            emissive="#4fc3f7"
            emissiveIntensity={0.4}
          />
        </mesh>
      ))}
      {[-5, 0, 5].map((x) => (
        <group key={x} position={[x, 11, 0]}>
          <mesh>
            <cylinderGeometry args={[0.2, 0.3, 4, 6]} />
            <meshStandardMaterial color="#667788" metalness={0.5} />
          </mesh>
          <group position={[0, 2.5, 0]} scale={0.5}>
            <AntennaArray tilt={tilt} color={color} />
          </group>
        </group>
      ))}
      <mesh position={[0, 15, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}

export function Station({ station }: StationProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const statusColor = ALARM_COLORS[station.alarmStatus];
  const particlesRef = useRef<THREE.Points>(null);

  const particlePositions = useMemo(() => {
    const arr = new Float32Array(50 * 3);
    for (let i = 0; i < 50; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 2;
      arr[i * 3 + 1] = Math.random() * 5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    return arr;
  }, []);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const targetY = hovered ? 1 : 0;
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * delta * 3;

    if (station.alarmStatus !== 'normal' && station.alarmStatus !== 'offline') {
      const pulse = 0.5 + Math.sin(clock.getElapsedTime() * 4) * 0.5;
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat.emissive && mat.emissive.getHexString() === statusColor.replace('#', '')) {
            mat.emissiveIntensity = 1 + pulse * 1.5;
          }
        }
      });
    }

    if (particlesRef.current && station.airConditioning) {
      const pos = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 50; i++) {
        pos[i * 3 + 1] += delta * 2;
        if (pos[i * 3 + 1] > 6) {
          pos[i * 3 + 1] = 0;
          pos[i * 3] = (Math.random() - 0.5) * 2;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 2;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    useAppStore.getState().setSelectedStationId(station.id);
  };

  let Model: JSX.Element;
  switch (station.type) {
    case 'macro':
      Model = <MacroStation color={statusColor} tilt={station.targetAntennaTilt} />;
      break;
    case 'micro':
      Model = <MicroStation color={statusColor} tilt={station.targetAntennaTilt} />;
      break;
    case 'indoor':
      Model = <IndoorStation color={statusColor} />;
      break;
    case 'core':
      Model = <CoreStation color={statusColor} tilt={station.targetAntennaTilt} />;
      break;
  }

  const labelHeight = station.type === 'macro' ? 35 : station.type === 'core' ? 18 : station.type === 'micro' ? 12 : 6;

  return (
    <group
      ref={groupRef}
      position={[station.position.x, station.position.y, station.position.z]}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {Model}
      {hovered && (
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[station.type === 'core' ? 12 : 4, station.type === 'core' ? 14 : 6, 32]} />
          <meshBasicMaterial color={statusColor} transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}
      {station.airConditioning && (
        <points ref={particlesRef} position={[0, 2, 0]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={50}
              array={particlePositions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.15}
            color="#88ccff"
            transparent
            opacity={0.6}
            sizeAttenuation
          />
        </points>
      )}
      <StationLabel
        station={station}
        position={[0, labelHeight, 0]}
      />
    </group>
  );
}
