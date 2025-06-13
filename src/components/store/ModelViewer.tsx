
"use client";

import React, { Suspense, useRef, useEffect, type ComponentProps } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Bounds,
  Center,
  useGLTF,
  useAnimations,
  Html
} from "@react-three/drei";
import { Skeleton } from "@/components/ui/skeleton";

interface AnimatedModelProps {
  url: string;
}

function AnimatedModel({ url }: AnimatedModelProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(url, true);
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    if (!animations?.length || !actions) return;
    // Play the first animation by default if available, or a common one like "Idle" or "TPose"
    const actionToPlay = 
        actions["Idle"] || 
        actions["idle"] || 
        actions["TPose"] || 
        actions["tpose"] || 
        Object.values(actions)[0];

    if (actionToPlay) {
      actionToPlay.reset().play();
    }
    
    // Cleanup function
    return () => {
      if (actionToPlay) {
        actionToPlay.stop();
      }
    };

  }, [actions, animations]);

  return <primitive ref={group} object={scene} dispose={null} />;
}

interface ModelViewerProps {
  url: string;
  height?: number;
  canvasProps?: Partial<ComponentProps<typeof Canvas>>;
}

const ModelViewer: React.FC<ModelViewerProps> = ({ url, height = 350, canvasProps }) => {
  if (!url) {
    return <Skeleton className="w-full" style={{ height: `${height}px` }} />;
  }

  return (
    <div
      style={{
        width: "100%",
        height: `${height}px`,
        overflow: "hidden",
        borderRadius: "8px",
        background: "hsl(var(--muted))"
      }}
      className="relative"
    >
      <Canvas 
        key={url} 
        shadows 
        camera={{ position: [0, -2, 20], fov: 35 }}
        style={{ touchAction: 'none' }} // Important for touch interactions with OrbitControls
        {...canvasProps}
      >
        <ambientLight intensity={1.5} />
        <directionalLight 
            position={[5, 5, 5]} 
            intensity={2} 
            castShadow 
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
        />
        <directionalLight position={[-5, 5, -5]} intensity={1} />
        
        <Suspense fallback={
            <Html center>
                <Skeleton className="w-24 h-24 rounded-full" />
            </Html>
        }>
          <Bounds clip margin={2}>
            <Center>
              <group position={[0, -0.75, 0]}> {/* Adjust y based on typical model pivot */}
                <AnimatedModel url={url} />
              </group>
            </Center>
          </Bounds>
        </Suspense>

        <Environment preset="sunset" />
        <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            minPolarAngle={Math.PI / 4} // Don't look from too far below
            maxPolarAngle={Math.PI / 1.8} // Don't look from too far above
            minDistance={1.5}
            maxDistance={5}
            target={[0, -0.3, 0]} // Adjust target to focus slightly higher if models are offset
        />
        <ContactShadows
          position={[0, -0.75, 0]} // Match group's y offset
          opacity={0.5}
          scale={10}
          blur={1.5}
          far={2}
        />
      </Canvas>
    </div>
  );
};

export default ModelViewer;

