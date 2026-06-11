import { GridHelper } from 'three';
import { useMemo } from 'react';

export function SceneGround() {
  const grid = useMemo(() => {
    const helper = new GridHelper(200, 40, '#00e5ff', '#00e5ff');
    helper.material.transparent = true;
    helper.material.opacity = 0.25;
    return helper;
  }, []);

  return <primitive object={grid} position={[0, 0.01, 0]} />;
}
