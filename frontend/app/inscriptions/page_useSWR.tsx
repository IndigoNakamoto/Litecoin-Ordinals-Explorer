'use client'
// app/inscriptions/page.tsx
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { InscriptionPreview } from '../components/inscriptionCard';
import { debounce } from 'lodash';
import useSWR from 'swr';

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

const fetcher = (url: string) => fetch(url).then((res) => res.json());



export default function Home() {
    const [filter, setFilter] = useState({ sortBy: 'oldest', contentType: 'All', cursed: false });
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const [loading, setLoading] = useState(false);
    const [lastInscriptionNumber, setLastInscriptionNumber] = useState<number | undefined>();
    const [hasMore, setHasMore] = useState(true);
    const [activeFilterButton, setActiveFilterButton] = useState('All');
    // const [selectedSortOption, setSelectedSortOption] = useState<string>('Oldest');

    // Construct the API URL based on the current filter state.
    // const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/inscriptions?lastInscriptionNumber=${undefined}&sortBy=${filter.sortBy}&contentType=${filter.contentType}&cursed=${filter.cursed}`;



    // Use the useState hook to manage filter and sort state
    const [selectedSortOption, setSelectedSortOption] = useState('Oldest');

    // Construct the API URL dynamically based on the current state
    const apiUrl = useMemo(() => {
        const params = new URLSearchParams({
            sortBy: filter.sortBy,
            contentType: filter.contentType,
            cursed: filter.cursed.toString(),
        }).toString();
        return `${process.env.NEXT_PUBLIC_BACKEND_URL}/inscriptions?${params}`;
    }, [filter]);


    // Use the useSWR hook to fetch inscriptions. Adjust the key and fetcher based on your API structure.
    const { data: inscriptions, error } = useSWR<Inscription[]>(apiUrl, fetcher);

    // Handling filter changes
    const handleFilterClick = useCallback((filterType: string) => {
        setFilter((prevFilter) => ({
            ...prevFilter,
            contentType: filterType,
        }));
    }, []);

    // Handling sort option changes
    const handleSortOptionSelect = useCallback((option: string) => {
        const sortValue = option.toLowerCase().replace(' ', '');
        setFilter((prevFilter) => ({
            ...prevFilter,
            sortBy: sortValue,
        }));
        setSelectedSortOption(option);
        setDropdownOpen(false);
    }, []);

    // const handleSortOptionSelect = (option: string) => {
    //     setInscriptions([])
    //     setSelectedSortOption(option);
    //     setDropdownOpen(false);
    //     updateFilter('sortBy', option.toLowerCase().replace(' ', ''));
    // };

    const loader = useRef(null);

    // const handleFilterClick = (filterType: string) => {
    //     setActiveFilterButton(filterType);
    //     updateFilter('contentType', filterType);
    // };

    const fetchInscriptions = async () => {
        if (!hasMore) return;

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

            // setInscriptions(prev => [...prev, ...data]);
            setLastInscriptionNumber(data[data.length - 1]?.inscription_number);
            setHasMore(data.length > 0);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch inscriptions:", error);
            // Handle error (e.g., show error message to user)
        } finally {
            setLoading(false);
        }
    };

    // Debounce scroll event
    useEffect(() => {
        const debouncedHandleScroll = debounce(() => setShowScrollButton(window.scrollY > window.innerHeight), 100);
        window.addEventListener('scroll', debouncedHandleScroll);
        return () => window.removeEventListener('scroll', debouncedHandleScroll);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !loading) fetchInscriptions();
        }, { threshold: 1.0 });
        if (loader.current) observer.observe(loader.current);
        return () => observer.disconnect();
    }, [filter, lastInscriptionNumber, loading]);

    useEffect(() => {
        // setInscriptions([]);
        setLastInscriptionNumber(undefined);
        fetchInscriptions();
    }, [filter]);

    const updateFilter = (type: 'sortBy' | 'contentType' | 'cursed', value: string | boolean) => {
        setLastInscriptionNumber(undefined);
        setHasMore(true);
        setFilter(prev => ({ ...prev, [type]: value }));
    };



    const toggleDropdown = () => {
        setDropdownOpen(prevState => !prevState);
    };

    return (
        <div className="mx-auto p-4 max-w-screen-2xl">
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
                {inscriptions?.map(inscription => (
                    <div key={inscription.inscription_id}>
                        <InscriptionPreview {...inscription} />
                    </div>
                ))}
            </div>

            {/* {loading && <p className="text-center pt-80 text-2xl">Loading...</p>} */}
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
