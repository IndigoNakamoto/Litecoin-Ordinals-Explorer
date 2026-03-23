'use client'

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

interface ModelViewerProps {
    modelUrl: string;
}

function Model({ modelUrl }: ModelViewerProps) {
    const { scene } = useGLTF(modelUrl) as { scene: React.JSX.Element | any };
    return <primitive object={scene} scale={1.2} />;
}

const ModelViewer: React.FC<ModelViewerProps> = ({ modelUrl }) => {
    return (
        <div className="h-[500px] w-full overflow-hidden rounded-xl bg-slate-950">
            <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
                <ambientLight intensity={1.1} />
                <directionalLight position={[5, 5, 5]} intensity={1.4} />
                <Suspense fallback={null}>
                    <Model modelUrl={modelUrl} />
                </Suspense>
                <OrbitControls enablePan={false} />
            </Canvas>
        </div>
    );
};

export default ModelViewer;
