import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import type { Vec3 } from '../../../shared/types';

interface MaintenancePathProps {
  from: Vec3;
  to: Vec3;
  highlight?: boolean;
}

export function MaintenancePath({ from, to, highlight = false }: MaintenancePathProps) {
  const ballRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const start = useMemo(() => new THREE.Vector3(from.x, from.y, from.z), [from]);
  const end = useMemo(() => new THREE.Vector3(to.x, to.y, to.z), [to]);
  const ballSize = highlight ? 1.4 : 0.8;
  const lineWidth = highlight ? 4 : 2;
  const lightDist = highlight ? 25 : 10;
  const emissiveIntensity = highlight ? 4 : 2;
  const opacity = highlight ? 1 : 0.8;
  const baseColor = highlight ? '#ff3d71' : '#00e5ff';

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
      {highlight && (
        <Line
          points={points}
          color="#ff3d71"
          lineWidth={8}
          transparent
          opacity={0.15}
        />
      )}
      <Line
        points={points}
        color={baseColor}
        lineWidth={lineWidth}
        transparent
        opacity={opacity}
        dashed
        dashSize={highlight ? 3 : 2}
        gapSize={1}
      />
      <mesh ref={ballRef}>
        <sphereGeometry args={[ballSize, 16, 16]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
      <pointLight ref={lightRef} color={baseColor} intensity={emissiveIntensity} distance={lightDist} />
    </group>
  );
}
