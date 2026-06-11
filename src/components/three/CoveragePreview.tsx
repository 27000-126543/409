import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Vec3 } from '../../../shared/types';

interface CoveragePreviewProps {
  center: Vec3;
  radius: number;
}

export function CoveragePreview({ center, radius }: CoveragePreviewProps) {
  const domeRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const ringGeo = useMemo(() => new THREE.RingGeometry(radius * 0.95, radius, 64), [radius]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (domeRef.current) {
      const mat = domeRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = 0.3 + Math.sin(t * 2) * 0.15;
    }
    if (ringRef.current) {
      ringRef.current.scale.setScalar(1 + Math.sin(t * 3) * 0.05);
    }
  });

  return (
    <group position={[center.x, center.y, center.z]}>
      <mesh ref={domeRef} rotation={[-Math.PI / 2, 0, 0]}>
        <sphereGeometry args={[radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#00e5ff"
          transparent
          opacity={0.4}
          emissive="#00e5ff"
          emissiveIntensity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <primitive object={ringGeo} attach="geometry" />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[radius * 0.3, radius, 32, 1]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.2} wireframe />
      </mesh>
    </group>
  );
}
