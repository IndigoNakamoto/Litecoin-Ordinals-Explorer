'use client';
import { useEffect, useState, useRef } from 'react';
import { InscriptionPreview } from '../components/inscription-preview'; // Adjust the path as necessary

interface Inscription {
    address: string;
    charms: string[];
    children: string[];
    content_length: number;
    content_type: string;
    content_type_type: string;
    genesis_fee: number;
    genesis_height: number;
    inscription_id: string;
    inscription_number: number;
    next: string;
    output_value: number;
    parent: string;
    previous: string;
    rune: string;
    sat: string;
    satpoint: string;
    timestamp: string;
}

export default function Home() {
    const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState({ sortBy: 'oldest', contentType: 'All', cursed: false });
    const [lastInscriptionNumber, setLastInscriptionNumber] = useState<number | undefined>();
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [activeFilterButton, setActiveFilterButton] = useState('All');

    const loader = useRef(null);

    // Update filter for content type using buttons
    const handleFilterClick = (filterType: string) => {
        setActiveFilterButton(filterType);
        updateFilter('contentType', filterType);
    };

    const fetchInscriptions = async () => {
        if (!hasMore) return; // Prevent fetching if no more inscriptions are available

        setLoading(true);
        const query = new URLSearchParams({
            lastInscriptionNumber: lastInscriptionNumber?.toString() || '',
            sortBy: filter.sortBy,
            contentType: filter.contentType,
            cursed: filter.cursed.toString(),
        }).toString();
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/inscriptions?${query}`);
        const data = await response.json();

        setInscriptions(prev => [...prev, ...data]);
        setLastInscriptionNumber(data[data.length - 1]?.inscription_number);
        setHasMore(data.length > 0); // Update based on whether data was returned
        setLoading(false);
    };


    useEffect(() => {
        const handleScroll = () => setShowScrollButton(window.scrollY > window.innerHeight);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !loading) fetchInscriptions();
        }, { threshold: 1.0 });
        if (loader.current) observer.observe(loader.current);
        return () => observer.disconnect();
    }, [filter, lastInscriptionNumber, loading]);

    useEffect(() => {
        setInscriptions([]); // Reset on filter change
        setLastInscriptionNumber(undefined); // Reset pagination
        fetchInscriptions();
    }, [filter]);

    const updateFilter = (type: 'sortBy' | 'contentType' | 'cursed', value: string | boolean) => {
        // Reset the pagination state whenever a filter is updated
        setLastInscriptionNumber(undefined);
        setHasMore(true);
        setFilter(prev => ({ ...prev, [type]: value }));
    };;

    return (
        <div className="mx-auto p-4 max-w-screen-2xl">
            <h1 className="text-2xl font-bold">Inscriptions</h1>
            {/* Sorting & Filtering UI */}
            <div className="pt-6 pb-10">
                {/* Content type filter buttons with side-scroll for narrow screens */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {['All', 'Image', 'SVG', 'GIF', 'Model', 'Text', 'HTML', 'Audio', 'Video', 'Application', 'PDF', 'JSON'].map((type) => ( //'JavaScript', 
                        <button
                            key={type}
                            onClick={() => handleFilterClick(type)}
                            className={`px-3 py-1.5 text-sm rounded-3xl ${activeFilterButton === type ? 'bg-gradient-to-br from-blue-500 to-blue-800 text-white' : 'bg-gradient-to-br from-white to-gray-400 text-black'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Sort buttons now below and justified to the left */}
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={() => updateFilter('sortBy', 'newest')}
                        className={`px-3 py-1.5 text-sm rounded ${filter.sortBy === 'newest' ? 'bg-gradient-to-br from-blue-500 to-blue-800 text-white' : 'bg-gradient-to-br from-white to-gray-400 text-black'}`}
                    >
                        Newest
                    </button>
                    <button
                        onClick={() => updateFilter('sortBy', 'oldest')}
                        className={`px-3 py-1.5 text-sm rounded ${filter.sortBy === 'oldest' ? 'bg-gradient-to-br from-blue-500 to-blue-800 text-white' : 'bg-gradient-to-br from-white to-gray-400 text-black'}`}
                    >
                        Oldest
                    </button>
                </div>
            </div>



            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {inscriptions.map(inscription => (
                    <div key={inscription.inscription_id}>
                        <InscriptionPreview {...inscription} />
                    </div>
                ))}
            </div>
            {loading && <p className="text-center">Loading...</p>}
            <div ref={loader} className="h-10" />
            {showScrollButton && (
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="fixed bottom-4 right-4 bg-gradient-to-br from-blue-500 to-blue-800 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-full z-50"
                    style={{ transition: 'opacity 0.3s' }}>
                    ↑ Top
                </button>
            )}
        </div>
    );
}
