import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import type { Vec3 } from '../../../shared/types';

interface MaintenancePathProps {
  from: Vec3;
  to: Vec3;
}

export function MaintenancePath({ from, to }: MaintenancePathProps) {
  const ballRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const start = useMemo(() => new THREE.Vector3(from.x, from.y, from.z), [from]);
  const end = useMemo(() => new THREE.Vector3(to.x, to.y, to.z), [to]);

  const curve = useMemo(() => {
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    mid.y += 30;
    return new THREE.CatmullRomCurve3([start, mid, end]);
  }, [start, end]);

  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    const raw = curve.getPoints(100);
    raw.forEach(p => pts.push([p.x, p.y, p.z]));
    return pts;
  }, [curve]);

  useFrame(({ clock }) => {
    if (ballRef.current) {
      const t = (clock.getElapsedTime() % 2) / 2;
      const pos = curve.getPoint(t);
      ballRef.current.position.copy(pos);
      if (lightRef.current) lightRef.current.position.copy(pos);
    }
  });

  return (
    <group>
      <Line
        points={points}
        color="#00e5ff"
        lineWidth={2}
        transparent
        opacity={0.8}
        dashed
        dashSize={2}
        gapSize={1}
      />
      <mesh ref={ballRef}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial
          color="#00e5ff"
          emissive="#00e5ff"
          emissiveIntensity={2}
        />
      </mesh>
      <pointLight ref={lightRef} color="#00e5ff" intensity={2} distance={10} />
    </group>
  );
}
