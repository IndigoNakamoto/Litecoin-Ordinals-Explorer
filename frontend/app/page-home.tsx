'use client'
// app/page-home.tsx
import React, { useEffect, useState, useRef } from 'react';
import { InscriptionCard } from './components/inscriptionCard';
import { debounce, sortBy } from 'lodash';


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

interface HomeProps {
    initialInscriptions: Inscription[];
}

export default function Home({ initialInscriptions }: HomeProps) {
    const [inscriptions, setInscriptions] = useState<Inscription[]>(initialInscriptions);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState({ sortBy: 'oldest', contentType: 'All', cursed: false });
    const [lastInscriptionNumber, setLastInscriptionNumber] = useState<number | undefined>();
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [activeFilterButton, setActiveFilterButton] = useState('All');
    const [selectedSortOption, setSelectedSortOption] = useState<string>('Oldest');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [rightPosition, setRightPosition] = useState('0px');

    const fetchInscriptions = async () => {
        setLoading(true);

        try {
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
            setHasMore(data.length > 0 && data.length >= 200); // Check if there are more than 200 items
        } catch (error) {
            console.error("Failed to fetch inscriptions:", error);
            // Handle error (e.g., show error message to user)
        } finally {
            setLoading(false);
        }
    };

    // Clear filter inscriptions list
    // BUG: CAUSES THE PAGE TO LOAD AGAIN
    // need a way to prevent this on first load
    const isInitialMount = useRef(true);
    useEffect(() => {
        // Skip the effect on initial mount
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            // This code now runs only on updates, not on the initial mount
            setInscriptions([]);
            setLastInscriptionNumber(undefined);
            fetchInscriptions();
        }
    }, [filter]);

    const handleLoadMore = () => {
        // Skip the effect on initial mount
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            // This code now runs only on updates, not on the initial mount
            fetchInscriptions();
        }
    };

    // Lazy load
    const loader = useRef(null);

    // useEffect(() => {
    //     const observer = new IntersectionObserver(entries => {
    //         if (entries[0].isIntersecting && !loading) fetchInscriptions();
    //     }, { threshold: 1.0 });
    //     if (loader.current) observer.observe(loader.current);
    //     return () => observer.disconnect();
    // }, [filter, lastInscriptionNumber, loading]);


    // update top button position
    const updateButtonPosition = () => {
        // Function to update the button's right position dynamically
        const viewportWidth = window.innerWidth;
        const maxWidth = 1520; // Assuming 'xl' corresponds to 1280px in your Tailwind config
        // Ensure the button stays within the max-width boundary of its container
        const excessWidth = Math.max(0, viewportWidth - maxWidth);
        const calculatedRightPosition = excessWidth / 2 + 'px';
        setRightPosition(calculatedRightPosition);
    };

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            window.addEventListener('resize', updateButtonPosition);
            updateButtonPosition(); // Update position on component mount
            return () => window.removeEventListener('resize', updateButtonPosition);
        }

    }, []);


    // Debounce scroll event
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            const debouncedHandleScroll = debounce(() => setShowScrollButton(window.scrollY > window.innerHeight), 100);
            window.addEventListener('scroll', debouncedHandleScroll);
            return () => window.removeEventListener('scroll', debouncedHandleScroll);
        }
    }, []);





    const handleFilterClick = (filterType: string) => {
        setActiveFilterButton(filterType);
        updateFilter('contentType', filterType);
    };

    const updateFilter = (type: 'sortBy' | 'contentType' | 'cursed', value: string | boolean) => {
        setLastInscriptionNumber(undefined);
        setHasMore(true);
        setFilter(prev => ({ ...prev, [type]: value }));
    };

    const handleSortOptionSelect = (option: string) => {
        setInscriptions([])
        setSelectedSortOption(option);
        setDropdownOpen(false);
        updateFilter('sortBy', option.toLowerCase().replace(' ', ''));
    };

    const toggleDropdown = () => {
        setDropdownOpen(prevState => !prevState);
    };

    return (
        <>
            <div className="mx-auto p-4 max-w-screen-2xl mb-16">
                <h1 className="text-2xl font-bold">Inscriptions</h1>

                {/* Filter Buttons */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pt-2">
                    {['All', 'Image', 'SVG', 'GIF', 'Model', 'Text', 'HTML', 'Audio', 'Video', 'Application', 'PDF', 'JSON'].map((type) => (
                        <button
                            key={type}
                            onClick={() => handleFilterClick(type)}
                            className={`px-3 py-1 text-sm rounded-3xl ${activeFilterButton === type ? 'bg-gradient-to-br from-blue-400 to-blue-700 text-white' : 'bg-gradient-to-br from-white to-gray-400 text-black'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Sort Dropdown */}
                <div className="relative inline-block pt-4">
                    <button onClick={toggleDropdown} className="w-32 px-3 py-1.5 text-sm rounded-lg bg-gradient-to-br from-blue-400 to-blue-700 text-white">
                        {selectedSortOption} <svg className="inline-block w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {dropdownOpen && (
                        <div className="absolute z-10 mt-1 bg-gradient-to-br from-white to-gray-200 border border-gray-200 rounded-lg shadow-lg right-0 w-32">
                            {['Newest', 'Oldest', 'Largest File', 'Largest Fee'].map((option) => (
                                <button key={option} onClick={() => handleSortOptionSelect(option)} className="block px-4 py-2 text-sm text-gray-800 hover:text-blue-700 w-full text-left">
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}
                </div>


                <div className="grid grid-cols-2 pt-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                    {Array.isArray(inscriptions) && inscriptions.map(inscription => (
                        <div key={inscription.inscription_id}>
                            <InscriptionCard {...inscription} />
                        </div>
                    ))}
                </div>

                {/* Loading indicator */}
                {loading && (
                    <p className="text-center pt-8 text-2xl">Loading...</p>
                )}

                {/* {loading && <p className="text-center pt-80 text-2xl">Loading...</p>} */}
                <div ref={loader} className="h-10" />
                {showScrollButton && (
                    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="fixed bottom-20 bg-gradient-to-br from-blue-500 to-blue-800 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-full z-50"
                        style={{ transition: 'opacity 0.3s', right: rightPosition }}>
                        ↑ Top
                    </button>
                )}

                <div className="flex justify-center">
                    {!loading && hasMore && (
                        <button
                            onClick={handleLoadMore}
                            className="w-40 py-2 px-4 mt-4 bg-gradient-to-br from-blue-400 to-blue-700 text-white rounded-lg"
                        >
                            Load More
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}
