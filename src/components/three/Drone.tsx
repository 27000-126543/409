import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Vec3 } from '../../../shared/types';

interface DroneProps {
  waypoints: Vec3[];
  progress: number;
}

export function Drone({ waypoints, progress }: DroneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const prop1Ref = useRef<THREE.Mesh>(null);
  const prop2Ref = useRef<THREE.Mesh>(null);
  const prop3Ref = useRef<THREE.Mesh>(null);
  const prop4Ref = useRef<THREE.Mesh>(null);

  const curve = useMemo(() => {
    const pts = waypoints.map(w => new THREE.Vector3(w.x, w.y, w.z));
    return new THREE.CatmullRomCurve3(pts, true);
  }, [waypoints]);

  useFrame((_, delta) => {
    const props = [prop1Ref, prop2Ref, prop3Ref, prop4Ref];
    props.forEach(p => {
      if (p.current) p.current.rotation.y += delta * 40;
    });
    if (groupRef.current) {
      const t = progress % 1;
      const pos = curve.getPoint(t);
      groupRef.current.position.copy(pos);
      const tangent = curve.getTangent(t);
      groupRef.current.lookAt(pos.clone().add(tangent));
    }
  });

  const armPositions: [number, number, number][] = [
    [1.5, 0, 1.5], [-1.5, 0, 1.5], [1.5, 0, -1.5], [-1.5, 0, -1.5],
  ];

  return (
    <group ref={groupRef}>
      <mesh>
        <boxGeometry args={[2, 0.6, 2]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.7} roughness={0.3} />
      </mesh>
      {armPositions.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh>
            <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
            <meshStandardMaterial color="#34495e" />
          </mesh>
          <mesh
            ref={i === 0 ? prop1Ref : i === 1 ? prop2Ref : i === 2 ? prop3Ref : prop4Ref}
            position={[0, 0.3, 0]}
          >
            <boxGeometry args={[2.5, 0.05, 0.2]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        </group>
      ))}
      <spotLight
        position={[0, -1, 0]}
        angle={0.5}
        penumbra={0.5}
        intensity={2}
        color="#ffffff"
        target-position={[0, -10, 0]}
      />
    </group>
  );
}
