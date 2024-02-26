// app/components/ContentRenderer.tsx
import { useEffect, useState } from 'react';
import Image from 'next/image';

// Adjusted ContentRendererProps to include `inscription_id`
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
                const url = `http://0.0.0.0:80/content/${inscription_id}`;
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                if (content_type.startsWith('image/') || content_type === 'application/pdf' || content_type.startsWith('video/') || content_type.startsWith('audio/')) {
                    const blob = await response.blob();
                    setContent(URL.createObjectURL(blob));
                } else if (content_type.startsWith('text/') || content_type === 'application/json') {
                    const text = await response.text();
                    setContent(text);
                }
                else {
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
    // Moved useFetchContent hook inside ContentRenderer
    const { content, loading, error } = useFetchContent(inscription_id, contentType);

    // Render logic remains the same, but now includes loading and error handling
    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (!content) return <p>No content available</p>;

    if (!content) return null;

    if (contentType.startsWith('image/')) {
        return <Image src={content} alt={`Inscription ${formattedInscriptionNumber}`} layout="fill" objectFit="cover" />;
    } else if (contentType.startsWith('text/') || contentType === 'application/json') {
        return <pre className="text-white">{content}</pre>;
    } else if (contentType === 'application/pdf') {
        return <iframe src={content} width="100%" height="500px"></iframe>;
    } else if (contentType.startsWith('video/')) {
        return <video src={content} controls width="100%"></video>;
    } else if (contentType.startsWith('audio/')) {
        return <audio src={content} controls></audio>;
    }

    return <p className="text-white">Unsupported content type</p>;
};
