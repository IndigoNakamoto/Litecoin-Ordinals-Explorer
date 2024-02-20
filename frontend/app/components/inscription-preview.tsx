import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ModelViewer from './model-viewer';

interface InscriptionPreviewProps {
    inscription_id: string;
    inscription_number: number;
    content_type: string;
    content_type_type: string;
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

export const InscriptionPreview: React.FC<InscriptionPreviewProps> = ({
    inscription_id,
    inscription_number,
    content_type,
    content_type_type
}) => {
    const { content, loading, error } = useFetchContent(inscription_id, content_type);

    const renderContent = () => {
        if (loading) return <p className="text-white">Loading...</p>;
        if (error) return <p className="text-white">{error}</p>;
        if (!content) return null;

        if (content_type.startsWith('image/')) {
            return <Image src={content} alt={`Inscription ${inscription_number}`} layout="fill" objectFit="cover" />;
        } else if (content_type.startsWith('text/') || content_type === 'application/json') {
            return <pre className="text-white">{content}</pre>;
        } else if (content_type === 'application/pdf') {
            return <iframe src={content} width="100%" height="500px"></iframe>;
        } else if (content_type.startsWith('video/')) {
            return <video src={content} controls width="100%"></video>;
        } else if (content_type.startsWith('audio/')) {
            return <audio src={content} controls></audio>;
        }

        return <p className="text-white">Unsupported content type</p>;
    };

    return (
        <div className="overflow-hidden shadow-lg cursor-pointer transition-transform duration-200 ease-in-out hover:scale-105">
            <Link href={`/inscription/${inscription_id}`} className="aspect-w-1 aspect-h-1 min-w-full min-h-[200px] max-h-[200px] overflow-hidden rounded-3xl bg-gradient-to-br from-gray-800 to-transparent flex items-center justify-center relative">

                {renderContent()}

            </Link>
            <div className="pt-2 p-4">
                <p>#{inscription_number}</p>
                <p className="text-gray-500 text-sm">{content_type_type}</p>
            </div>
        </div>
    );
};
