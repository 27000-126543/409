import { useMemo } from 'react';
import * as THREE from 'three';

interface Building {
  position: [number, number, number];
  size: [number, number, number];
  windowColor: string;
}

function generateBuildings(): Building[] {
  const buildings: Building[] = [];
  const roadX = [-60, -20, 20, 60];
  const roadZ = [-60, -20, 20, 60];
  const isRoad = (x: number, z: number) =>
    roadX.some(r => Math.abs(x - r) < 10) || roadZ.some(r => Math.abs(z - r) < 10);

  for (let i = 0; i < 60; i++) {
    const x = (Math.random() - 0.5) * 260;
    const z = (Math.random() - 0.5) * 260;
    if (isRoad(x, z)) continue;
    const w = 4 + Math.random() * 8;
    const d = 4 + Math.random() * 8;
    const h = 5 + Math.random() * 20;
    buildings.push({
      position: [x, h / 2, z],
      size: [w, h, d],
      windowColor: Math.random() > 0.4 ? '#4fc3f7' : '#1a2a4a',
    });
  }
  return buildings;
}

export function City() {
  const buildings = useMemo(() => generateBuildings(), []);
  const roads = useMemo(() => {
    const r: [number, number, number][] = [];
    [-60, -20, 20, 60].forEach(x => r.push([x, 0.1, 0]));
    [-60, -20, 20, 60].forEach(z => r.push([0, 0.1, z]));
    return r;
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#0a1628" />
      </mesh>

      {buildings.map((b, i) => (
        <group key={i} position={b.position}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={b.size} />
            <meshStandardMaterial color="#0d2137" />
          </mesh>
          <mesh position={[0, b.size[1] / 2 + 0.05, 0]}>
            <boxGeometry args={[b.size[0] * 0.9, 0.1, b.size[2] * 0.9]} />
            <meshStandardMaterial
              color="#4fc3f7"
              emissive="#4fc3f7"
              emissiveIntensity={0.3}
            />
          </mesh>
          <mesh position={[0, 0, b.size[2] / 2 + 0.01]}>
            <planeGeometry args={[b.size[0] * 0.7, b.size[1] * 0.6]} />
            <meshStandardMaterial
              color={b.windowColor}
              emissive={b.windowColor}
              emissiveIntensity={b.windowColor === '#4fc3f7' ? 0.4 : 0}
            />
          </mesh>
        </group>
      ))}

      {roads.map((pos, i) => (
        <mesh key={i} position={pos} rotation={[-Math.PI / 2, 0, i >= 4 ? Math.PI / 2 : 0]}>
          <planeGeometry args={[6, 300]} />
          <meshStandardMaterial
            color="#1a3a5c"
            emissive="#1a3a5c"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}
