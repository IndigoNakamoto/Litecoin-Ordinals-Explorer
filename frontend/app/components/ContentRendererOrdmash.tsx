'use client'
// app/components/ContentRenderer.tsx
import React, { Suspense, useEffect, useState } from 'react';
import Image from "next/image";
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';


// Component for rendering GLB/GLTF models
const ModelViewer = ({ modelUrl }: { modelUrl: string }) => {
    const { scene, error } = useGLTF(modelUrl) as any;
    if (error) {
        console.error("Failed to load model:", error);
        return <p>Error loading model.</p>;
    }
    return <primitive object={scene} />;
};


interface ContentRendererProps {
    inscription_id: string;
    contentType: string;
    formattedInscriptionNumber: string;
}

const useFetchContent = (inscription_id: string, content_type: string) => {
    const [content, setContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchData() {
            try {
                const url = `${process.env.NEXT_PUBLIC_ORD_LITECOIN_URL}/content/${inscription_id}`;
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const contentType = response.headers.get('Content-Type');

                if (contentType?.startsWith('image/') || contentType === 'application/pdf' || contentType?.startsWith('video/') || contentType?.startsWith('audio/')) {
                    const blob = await response.blob();
                    setContent(URL.createObjectURL(blob));
                } else if (contentType?.startsWith('text/') || contentType === 'application/json') {
                    const text = await response.text();
                    setContent(text);
                } else if (contentType === 'model/gltf-binary' || contentType === 'model/gltf+json') {
                    // console.log("Model URL:", url); // Debug: Log the model URL
                    setContent(url); // Set the model URL for 3D rendering
                } else {
                    setContent('Unsupported content type');
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : 'An unknown error occurred';
                setError('Failed to load content. ' + message);
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [inscription_id, content_type]);

    return { content, loading, error };
};

export const ContentRenderer: React.FC<ContentRendererProps> = ({ inscription_id, contentType, formattedInscriptionNumber }) => {
    const { content, loading, error } = useFetchContent(inscription_id, contentType);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (!content) return <p>No preview available</p>;
    if (contentType === 'text/html;charset=utf-8') {
        return (
            <div className='flex justify-center items-center w-full h-full '>
                <iframe srcDoc={content} style={{ height: '80%', width: '50%' }} className=''></iframe>
            </div>
        );
    } else if (contentType.startsWith('image/')) {
        return <Image src={content} alt={`Inscription ${formattedInscriptionNumber}`} fill={true} priority={true} />;
    } else if (contentType.startsWith('text/') || contentType === 'application/json') {
        return <pre className="text-white overflow-auto whitespace-pre-wrap break-words p-4 w-full max-h-full">{content}</pre>;
    } else if (contentType === 'application/pdf') {
        return <iframe src={content} width="100%" height="1000px"></iframe>;
    } else if (contentType.startsWith('video/')) {
        return <video src={content} autoPlay muted loop width="100%"></video>;
    } else if (contentType.startsWith('audio/')) {
        return <audio src={content} controls></audio>;
    } else if (contentType === 'model/gltf-binary' || contentType === 'model/gltf+json') {
        return (
            <div className='bg-white w-full h-full'>
                <Canvas>
                    {/* <ambientLight intensity={0.5} /> */}
                    {/* <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                    <pointLight position={[-10, -10, -10]} /> */}
                    <OrbitControls />
                    <ModelViewer modelUrl={content} />
                </Canvas>
            </div>
        );
    }

    return <p className="text-white">Unsupported content type</p>;
};


export default ContentRenderer;
