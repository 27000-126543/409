import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useAppStore } from '../../store';
import { City } from './City';
import { SceneGround } from './SceneGround';
import { Station } from './Station';
import { MaintenancePath } from './MaintenancePath';
import { CoveragePreview } from './CoveragePreview';
import { Drone } from './Drone';

function FogSetup() {
  const scene = useMemo(() => {
    const s = new THREE.Scene();
    s.fog = new THREE.FogExp2('#0A1628', 0.006);
    return s;
  }, []);

  useFrame((state) => {
    state.scene.fog = scene.fog;
    if (!state.scene.background) {
      state.scene.background = new THREE.Color('#0A1628');
    }
  });

  return null;
}

function DroneAnimator() {
  const droneRoutes = useAppStore((s) => s.droneRoutes);
  const droneInspections = useAppStore((s) => s.droneInspections);
  const progressRef = useRef(0);

  useFrame((_, delta) => {
    progressRef.current = (progressRef.current + delta * 0.05) % 1;
  });

  const activeInspections = droneInspections.filter((d) => d.status === 'flying');

  return (
    <>
      {activeInspections.map((inspection) => {
        const route = droneRoutes.find((r) => r.id === inspection.routeId);
        if (!route || route.waypoints.length < 2) return null;
        return (
          <Drone
            key={inspection.id}
            waypoints={route.waypoints}
            progress={progressRef.current}
          />
        );
      })}
    </>
  );
}

function SceneContent() {
  const stations = useAppStore((s) => s.stations);
  const activePaths = useAppStore((s) => s.activeWorkOrderPaths);
  const siteSelections = useAppStore((s) => s.siteSelections);
  const candidatePosition = useAppStore((s) => s.candidatePosition);
  const planningMode = useAppStore((s) => s.planningMode);
  const highlightWorkOrderId = useAppStore((s) => s.highlightWorkOrderId);

  const pointLights: { pos: [number, number, number]; color: string; intensity: number }[] = useMemo(() => {
    return [
      { pos: [-80, 30, -80], color: '#4488ff', intensity: 0.4 },
      { pos: [80, 30, -80], color: '#4488ff', intensity: 0.4 },
      { pos: [-80, 30, 80], color: '#4488ff', intensity: 0.4 },
      { pos: [80, 30, 80], color: '#4488ff', intensity: 0.4 },
      { pos: [0, 50, 0], color: '#6699ff', intensity: 0.3 },
    ];
  }, []);

  return (
    <>
      <FogSetup />

      <directionalLight
        position={[50, 80, 30]}
        intensity={0.6}
        color="#cce0ff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-150}
        shadow-camera-right={150}
        shadow-camera-top={150}
        shadow-camera-bottom={-150}
      />
      <ambientLight color="#4466aa" intensity={0.4} />

      {pointLights.map((l, i) => (
        <pointLight
          key={i}
          position={l.pos}
          color={l.color}
          intensity={l.intensity}
          distance={100}
        />
      ))}

      <City />
      <SceneGround />

      {stations.map((station) => (
        <Station key={station.id} station={station} />
      ))}

      {activePaths.map((path) => (
        <MaintenancePath
          key={path.orderId}
          from={path.from}
          to={path.to}
          highlight={highlightWorkOrderId === path.orderId}
        />
      ))}

      {siteSelections.map((site) => (
        <CoveragePreview
          key={site.id}
          center={site.position}
          radius={site.coverageRadius}
        />
      ))}

      {planningMode && candidatePosition && (
        <CoveragePreview
          center={candidatePosition}
          radius={30}
        />
      )}

      <DroneAnimator />

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={20}
        maxDistance={250}
        maxPolarAngle={Math.PI / 2.1}
      />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.2}
          intensity={0.8}
          mipmapBlur
          luminanceSmoothing={0.9}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.8} />
      </EffectComposer>
    </>
  );
}

export function Scene() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 80, 100], fov: 50 }}
      gl={{ antialias: true, alpha: false }}
      style={{ width: '100%', height: '100%' }}
    >
      <SceneContent />
    </Canvas>
  );
}
