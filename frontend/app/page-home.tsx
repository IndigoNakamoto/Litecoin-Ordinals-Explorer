'use client'
// app/page-home.tsx
import React, { useEffect, useState, useRef } from 'react';
import { InscriptionCard } from './components/inscriptionCard';
import { debounce } from 'lodash';
import { Typography } from "@material-tailwind/react";
import { Button } from "@material-tailwind/react";

export interface Inscription {
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
    nsfw: boolean;
    next: string;
    output_value: number;
    parent: string;
    previous: string;
    processed: boolean;
    rune: string;
    sat: string;
    satpoint: string;
    timestamp: string;
}

interface HomeProps {
    initialInscriptions: Inscription[];
    totalCount: number;
}

export default function Home({ initialInscriptions, totalCount }: HomeProps) {
    const [inscriptions, setInscriptions] = useState<Inscription[]>(initialInscriptions);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState({ sortOrder: 'oldest', contentType: '', contentTypeType: '', page: 1, cursed: false });
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [activeFilterButton, setActiveFilterButton] = useState('All');
    const [selectedSortOption, setSelectedSortOption] = useState<string>('Oldest');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [rightPosition, setRightPosition] = useState('0px');
    const [fetchedCount, setFetchedCount] = useState(totalCount);
    const [filterTypeDesc, setFilterType] = useState('');


    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Assuming each card has an ID that corresponds to the inscription_id
                        const cardId = entry.target.getAttribute('data-inscription-id');
                        // Logic to load card content goes here
                        console.log(`Load content for card ${cardId}`);
                    }
                });
            },
            { rootMargin: '0px', threshold: 0.1 }
        );

        cardRefs.current.forEach(ref => { // Observe each card
            if (ref) observer.observe(ref);
        });

        return () => { // Cleanup observer on component unmount
            cardRefs.current.forEach(ref => {
                if (ref) observer.unobserve(ref);
            });
        };
    }, [inscriptions]); // Depend on the inscriptions array


    const fetchInscriptions = async () => {
        setLoading(true);

        try {
            // Base URL for the inscriptions endpoints

            let baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/inscriptions`;

            // Determine the correct endpoint based on the filters
            if (filter.contentTypeType) {
                baseUrl += `/content_type_type/${filter.contentTypeType}`;
            } else if (filter.contentType) {
                baseUrl += `/content_type/${filter.contentType}`;
            } else {
                baseUrl += '/'; // Default to getting all inscriptions
            }

            // Build the query parameters
            const queryParams = new URLSearchParams({
                sortOrder: filter.sortOrder,
                page: filter.page?.toString() || '1',
                cursed: filter.cursed.toString(),
                limit: '50', // Assuming you want to keep the limit or it can be adjusted based on your requirements
            }).toString();

            // Complete URL with query parameters
            const url = `${baseUrl}?${queryParams}`;

            // Fetch the data from the backend
            const response = await fetch(url);
            const data = await response.json();

            // Concatenate the new data with the existing inscriptions
            setInscriptions(prevInscriptions => [...prevInscriptions, ...data]);

            // Check if the number of fetched items is less than 50, indicating no more inscriptions to load
            setHasMore(data.length === 50);
        } catch (error) {
            console.error("Failed to fetch inscriptions:", error);
            // Handle error (e.g., show error message to user)
        } finally {
            setLoading(false);
        }
    };



    const isInitialMount = useRef(true);
    useEffect(() => {
        // Skip the effect on initial mount
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            // This code now runs only on updates, not on the initial mount
            // setInscriptions([]);
            fetchInscriptions();
            fetchTotalCount();
        }
    }, [filter]);

    const handleLoadMore = () => {
        // Increment the page by one
        setFilter(prevFilter => ({
            ...prevFilter,
            page: prevFilter.page + 1
        }));
    };

    // Show scroll button
    const loader = useRef(null);


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

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                const entry = entries[0];
                if (entry.isIntersecting && hasMore && !loading) {
                    handleLoadMore();
                }
            },
            {
                rootMargin: '100px',
            }
        );

        if (loader.current) {
            observer.observe(loader.current);
        }

        return () => {
            if (loader.current) {
                observer.unobserve(loader.current);
            }
        };
    }, [loading, hasMore]);



    const handleFilterClick = (filterType: string) => {
        setActiveFilterButton(filterType);
        setInscriptions([])
        // Reset page to 1 for a new filter to start from the beginning
        let newFilter = { ...filter, page: 1 };
        newFilter.contentType = '';
        newFilter.contentTypeType = '';

        if (filterType === 'All') {
            // If "All" is selected, clear both contentType and contentTypeType filters
            newFilter.contentType = '';
            newFilter.contentTypeType = '';
            setFilterType('')
        } else if (filterType === 'SVG') {
            newFilter.contentType = 'image%2Fsvg+xml'
            setFilterType('SVG')
        } else if (filterType === 'GIF') {
            newFilter.contentType = 'image%2Fgif'
            setFilterType('GIF')
        } else if (filterType === 'HTML') {
            newFilter.contentType = 'text%2Fhtml%3Bcharset%3Dutf-8'
            setFilterType('HTML')
        } else if (filterType === 'PDF') {
            newFilter.contentType = 'application%2Fpdf'
            setFilterType('PDF')
        } else if (filterType === 'JSON') {
            newFilter.contentType = 'application%2Fjson'
            setFilterType('JSON')
        } else if (filterType === '3D') {
            newFilter.contentTypeType = 'model'
            setFilterType('3D')
        } else if (filterType === 'Text') {
            newFilter.contentTypeType = 'text'
            setFilterType('Text')
        } else if (filterType === 'Audio') {
            newFilter.contentTypeType = 'audio'
            setFilterType('Audio')
        } else if (filterType === 'Videos') {
            newFilter.contentTypeType = 'video'
            setFilterType('Video')
        } else if (filterType === 'Images') {
            newFilter.contentTypeType = 'image'
            setFilterType('Image')
        }
        setFilter(newFilter);
    };


    const fetchTotalCount = async () => {
        try {
            if (filter.contentType === '' && filter.contentTypeType === '') {
                const count = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/stats/total_count`)
                    .then(response => response.json());
                setFetchedCount(count.count);
            } else if (filter.contentType === 'image%2Fsvg+xml') {
                const count = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/stats/content_type_count/image%2Fsvg+xml`)
                    .then(response => response.json());
                setFetchedCount(count.count);
            } else if (filter.contentType === 'image%2Fgif') {
                const count = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/stats/content_type_count/image%2Fgif`)
                    .then(response => response.json());
                setFetchedCount(count.count);
            } else if (filter.contentType === 'text%2Fhtml%3Bcharset%3Dutf-8') {
                const count = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/stats/content_type_count/text%2Fhtml%3Bcharset%3Dutf-8`)
                    .then(response => response.json());
                setFetchedCount(count.count);
            } else if (filter.contentType === 'application%2Fpdf') {
                const count = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/stats/content_type_count/application%2Fpdf`)
                    .then(response => response.json());
                setFetchedCount(count.count);
            } else if (filter.contentType === 'application%2Fjson') {
                const count = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/stats/content_type_count/application%2Fjson`)
                    .then(response => response.json());
                setFetchedCount(count.count);
            } else if (filter.contentTypeType === 'model') {
                const count = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/stats/content_type_type_count/model`)
                    .then(response => response.json());
                setFetchedCount(count.count);
            } else if (filter.contentTypeType === 'text') {
                const count = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/stats/content_type_type_count/text`)
                    .then(response => response.json());
                setFetchedCount(count.count);
            } else if (filter.contentTypeType === 'audio') {
                const count = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/stats/content_type_type_count/audio`)
                    .then(response => response.json());
                setFetchedCount(count.count);
            } else if (filter.contentTypeType === 'video') {
                const count = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/stats/content_type_type_count/video`)
                    .then(response => response.json());
                setFetchedCount(count.count);
            } else if (filter.contentTypeType === 'image') {
                const count = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/stats/content_type_type_count/image`)
                    .then(response => response.json());
                setFetchedCount(count.count);
            }
        } catch (error) {
            console.error("Failed to fetch inscriptions count:", error);
        }
    }

    const updateFilter = (type: 'sortOrder' | 'contentType' | 'contentTypeType' | 'cursed', value: string | boolean) => {
        setHasMore(true);
        setFilter(prev => ({ ...prev, [type]: value }));
    };

    const handleSortOptionSelect = (option: string) => {
        // even when we do not click on this, setInscriptions([]) clears when we click on handleLoadMore.
        setInscriptions([])
        setSelectedSortOption(option); //highestfee, largestfile, newest, oldest
        setDropdownOpen(false);
        if (option === 'Newest') updateFilter('sortOrder', 'number_desc');
        if (option === 'Oldest') updateFilter('sortOrder', 'number_asc');
        if (option === 'Highest Fee') updateFilter('sortOrder', 'genesis_fee');
        if (option === 'Largest File') updateFilter('sortOrder', 'content_length');
        // updateFilter('sortOrder', option.toLowerCase().replace(' ', ''));
    };

    const toggleDropdown = () => {
        setDropdownOpen(prevState => !prevState);
    };


    return (
        <>
            <div className="mx-auto p-8 mb-16">
                {/* Filter Buttons */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {['All', 'Images', 'GIF', 'Text', 'SVG', 'Videos', 'JSON', 'PDF', 'Audio', '3D'].map((type) => ( //'HTML', 
                        <Button
                            key={type}
                            onClick={() => handleFilterClick(type)}
                            className={`px-6 py-1.5 text-sm rounded-3xl ${activeFilterButton === type ? 'bg-gradient-to-br from-blue-400 to-blue-700 text-white' : 'bg-gradient-to-br from-white to-gray-400 text-black'}`} placeholder={undefined}                        >
                            {type}
                        </Button>
                    ))}
                </div>

                {/* Sort Dropdown */}
                <div className="relative inline-block pt-4">
                    <button onClick={toggleDropdown} className="w-32 px-3 py-1.5 text-sm rounded-lg bg-gradient-to-br from-blue-400 to-blue-700 text-white">
                        {selectedSortOption} <svg className="inline-block w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {dropdownOpen && (
                        <div className="absolute z-10 mt-1 bg-gradient-to-br from-white to-gray-200 border border-gray-200 rounded-lg shadow-lg right-0 w-32">
                            {['Newest', 'Oldest', 'Highest Fee', 'Largest File'].map((option) => ( //'Largest File', 'Largest Fee'
                                <button key={option} onClick={() => handleSortOptionSelect(option)} className="block px-4 py-2 text-sm text-gray-800 hover:text-blue-700 w-full text-left">
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Inscriptions Count */}
                <div className='pt-4 '>
                    <Typography placeholder={undefined} variant="lead" className='text-gray-500 text-md'>Found <span className='text-white'>{`${fetchedCount.toLocaleString()} ${filterTypeDesc}`}</span> inscriptions</Typography>
                </div>

                {/* Inscriptions */}
                <div className="grid pt-8 gap-1" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                    {Array.isArray(inscriptions) && inscriptions.map((inscription, index) => (
                        <div key={inscription.inscription_id} ref={el => el && (cardRefs.current[index] = el)} data-inscription-id={inscription.inscription_id}>
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

                <div ref={loader} className="h-10" />
                <div ref={loader} />
            </div>
        </>
    );
}