'use client'

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

import { buildOrdContentUrl } from '../lib/runtime';
import ModelViewer from './model-viewer';

interface ContentRendererProps {
    inscription_id: string;
    contentType: string;
    formattedInscriptionNumber: string;
    shouldLoad?: boolean;
    mode?: 'card' | 'detail';
}

const isTextContent = (contentType: string) =>
    contentType.startsWith('text/') || contentType === 'application/json';

const isModelContent = (contentType: string) =>
    contentType === 'model/gltf-binary' || contentType === 'model/gltf+json';

const Placeholder = ({ label }: { label: string }) => (
    <div className="flex h-full min-h-[220px] w-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-4 text-center text-sm text-gray-300">
        {label}
    </div>
);

export const ContentRenderer: React.FC<ContentRendererProps> = ({
    inscription_id,
    contentType,
    formattedInscriptionNumber,
    shouldLoad = true,
    mode = 'detail',
}) => {
    const [textContent, setTextContent] = useState<string | null>(null);
    const [loadingText, setLoadingText] = useState(false);
    const [error, setError] = useState('');

    const contentUrl = useMemo(
        () => buildOrdContentUrl(inscription_id),
        [inscription_id],
    );

    useEffect(() => {
        if (!shouldLoad || !isTextContent(contentType)) {
            return;
        }

        let cancelled = false;

        const fetchTextContent = async () => {
            try {
                setLoadingText(true);
                setError('');
                const response = await fetch(contentUrl);

                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status}`);
                }

                const text = await response.text();
                if (!cancelled) {
                    setTextContent(text);
                }
            } catch (fetchError) {
                const message = fetchError instanceof Error ? fetchError.message : 'Unknown error';
                if (!cancelled) {
                    setError(`Failed to load preview: ${message}`);
                }
            } finally {
                if (!cancelled) {
                    setLoadingText(false);
                }
            }
        };

        fetchTextContent();

        return () => {
            cancelled = true;
        };
    }, [contentType, contentUrl, shouldLoad]);

    if (!shouldLoad) {
        return <Placeholder label="Preview loads as you scroll" />;
    }

    if (loadingText) {
        return <Placeholder label="Loading preview..." />;
    }

    if (error) {
        return <p className="p-3 text-sm text-red-300">{error}</p>;
    }

    if (contentType.startsWith('image/')) {
        return (
            <Image
                src={contentUrl}
                alt={`Inscription ${formattedInscriptionNumber}`}
                fill
                unoptimized
                sizes={mode === 'card' ? '(max-width: 768px) 50vw, 25vw' : '100vw'}
                className="object-cover"
            />
        );
    }

    if (isTextContent(contentType)) {
        if (!textContent) {
            return <Placeholder label="No preview available" />;
        }

        return (
            <pre
                className={`w-full whitespace-pre-wrap break-words text-white ${mode === 'card' ? 'max-h-full overflow-hidden p-3 text-xs' : 'max-h-[500px] overflow-auto rounded-xl p-4 text-sm'}`}
            >
                {textContent}
            </pre>
        );
    }

    if (contentType === 'application/pdf') {
        return (
            <iframe
                src={contentUrl}
                width="100%"
                height={mode === 'card' ? '100%' : '500'}
                title={`Inscription ${formattedInscriptionNumber} PDF`}
                className="min-h-[320px] w-full border-0"
            />
        );
    }

    if (contentType.startsWith('video/')) {
        return (
            <video
                src={contentUrl}
                controls
                muted={mode === 'card'}
                preload="metadata"
                className="h-full w-full object-cover"
            />
        );
    }

    if (contentType.startsWith('audio/')) {
        return (
            <div className="flex h-full min-h-[220px] w-full items-center justify-center p-4">
                <audio src={contentUrl} controls className="w-full" />
            </div>
        );
    }

    if (isModelContent(contentType)) {
        if (mode === 'card') {
            return <Placeholder label="3D model available" />;
        }

        return <ModelViewer modelUrl={contentUrl} />;
    }

    return <Placeholder label="Unsupported content type" />;
};

export default ContentRenderer;
