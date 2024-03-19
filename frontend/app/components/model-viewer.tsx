// import React, { Suspense } from 'react';
// import { Canvas } from '@react-three/fiber';
// import { OrbitControls, useGLTF, Environment, Gltf } from '@react-three/drei';
// import { ThreeEvent } from '@react-three/fiber';

// // Extend GLTF type to include the TypeScript definition for the 'scene' property
// type GLTFResult = Gltf & {
//   nodes: {
//     [name: string]: THREE.Mesh;
//   };
//   materials: {
//     [name: string]: THREE.Material;
//   };
//   scene: THREE.Scene; // Ensure 'scene' is recognized by TypeScript
// };

// interface ModelProps {
//   modelPath: string;
// }

// // Correctly type the props for Model component
// const Model: React.FC<ModelProps> = ({ modelPath }) => {
//   const { scene } = useGLTF(modelPath) as GLTFResult; // Cast to GLTFResult to access 'scene'
//   return <primitive object={scene} />;
// };

// interface ModelViewerProps {
//   modelUrl: string;
// }

// // Correctly type the props for ModelViewer component
// const ModelViewer: React.FC<ModelViewerProps> = ({ modelUrl }) => {
//   return (
//     <div style={{ height: '500px', width: '100%' }}>
//       <Canvas>
//         <ambientLight intensity={0.5} />
//         <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
//         <Suspense fallback={null}>
//           <Model modelPath={modelUrl} />
//           <Environment preset="sunset" />
//         </Suspense>
//         <OrbitControls />
//       </Canvas>
//     </div>
//   );
// };

// export default ModelViewer;
