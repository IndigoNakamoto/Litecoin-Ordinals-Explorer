'use client'
// app/page-home.tsx
import React, { useEffect, useState, useRef } from 'react';
import { InscriptionCard } from './components/inscriptionCard';
import { debounce, sortOrder } from 'lodash';

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
}

export default function Home({ initialInscriptions }: HomeProps) {
    const [inscriptions, setInscriptions] = useState<Inscription[]>(initialInscriptions);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState({ sortOrder: 'oldest', contentType: '', contentTypeType: '', page: 1, cursed: false });
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [activeFilterButton, setActiveFilterButton] = useState('All');
    const [selectedSortOption, setSelectedSortOption] = useState<string>('Oldest');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [rightPosition, setRightPosition] = useState('0px');


    const cardRefs = useRef([]); // Add this line to create refs for all cards

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
                limit: '100', // Assuming you want to keep the limit or it can be adjusted based on your requirements
            }).toString();
    
            // Complete URL with query parameters
            const url = `${baseUrl}?${queryParams}`;
    
            // Fetch the data from the backend
            const response = await fetch(url);
            const data = await response.json();
    
            // Concatenate the new data with the existing inscriptions
            setInscriptions(prevInscriptions => [...prevInscriptions, ...data]);
    
            // Check if the number of fetched items is less than 100, indicating no more inscriptions to load
            setHasMore(data.length === 100);
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
        } else if(filterType === 'SVG' ){
            newFilter.contentType = 'image%2Fsvg+xml'
        } else if(filterType === 'GIF' ) {
            newFilter.contentType = 'image%2Fgif'
        } else if(filterType === 'HTML' ) {
            newFilter.contentType = 'text%2Fhtml%3Bcharset%3Dutf-8'
        } else if (filterType === 'PDF') {
            newFilter.contentType = 'application%2Fpdf'
        } else if (filterType === 'JSON'  ){
            newFilter.contentType = 'application%2Fjson'
        } else if (filterType === '3D' ) {
            newFilter.contentTypeType = 'model'             
        } else if (filterType === 'Text' ) {
            newFilter.contentTypeType = 'text'
        } else if (filterType === 'Audio' ) {
            newFilter.contentTypeType = 'audio'
        } else if (filterType === 'Video' ) {
            newFilter.contentTypeType = 'video'
        } else if (filterType === 'Image' ) {
            newFilter.contentTypeType = 'image'
        }
    
        setFilter(newFilter);
    };

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
            <div className="mx-auto p-4 max-w-screen-2xl mb-16">
                <h1 className="text-2xl font-bold">Inscriptions</h1>

                {/* Filter Buttons */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pt-2">
                    {['All', 'Video', 'Image', 'SVG', 'GIF', 'JSON', 'Text', 'PDF', 'Audio', '3D'].map((type) => ( //'HTML', 
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
                            {['Newest', 'Oldest', 'Highest Fee', 'Largest File'].map((option) => ( //'Largest File', 'Largest Fee'
                                <button key={option} onClick={() => handleSortOptionSelect(option)} className="block px-4 py-2 text-sm text-gray-800 hover:text-blue-700 w-full text-left">
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}
                </div>


                <div className="grid grid-cols-2 pt-8 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
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








    // const fetchInscriptions = async () => {

    //     setLoading(true);

    //     try {
    //         const query = new URLSearchParams({
    //             contentTypeType: filter.contentTypeType || '',
    //             contentType: filter.contentType || '',
    //             sortOrder: filter.sortOrder,
    //             page: filter.page?.toString() || '1',
    //             cursed: filter.cursed.toString(),
    //             limit: '100' // Request 100 inscriptions each time
    //         }).toString();
    //         const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/inscriptions?${query}`);
    //         const data = await response.json();

    //         setInscriptions(prev => [...prev, ...data]);

    //         // Check if the number of fetched items is less than 100, which means there are no more inscriptions to load
    //         setHasMore(data.length === 100);
    //     } catch (error) {
    //         console.error("Failed to fetch inscriptions:", error);
    //         // Handle error (e.g., show error message to user)
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // const fetchInscriptions = async () => {
    //     setLoading(true);
    
    //     try {
    //         // Base URL for the inscriptions endpoints
    //         let baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/inscriptions`;
    
    //         // Determine the correct endpoint based on the filters
    //         if (filter.contentTypeType) {
    //             baseUrl += `/content_type_type/${filter.contentTypeType}`;
    //         } else if (filter.contentType) {
    //             baseUrl += `/content_type/${filter.contentType}`;
    //         } else {
    //             baseUrl += '/'; // Default to getting all inscriptions
    //         }
    
    //         // Build the query parameters
    //         const queryParams = new URLSearchParams({
    //             sortOrder: filter.sortOrder,
    //             page: filter.page?.toString() || '1',
    //             cursed: filter.cursed.toString(),
    //             limit: '100', // Assuming you want to keep the limit or it can be adjusted based on your requirements
    //         }).toString();
    
    //         // Complete URL with query parameters
    //         const url = `${baseUrl}?${queryParams}`;
    
    //         // Fetch the data from the backend
    //         const response = await fetch(url);
    //         const data = await response.json();
    
    //         // Update state with the new inscriptions
    //         setInscriptions(prev => [...prev, ...data]);
    
    //         // Check if the number of fetched items is less than 100, indicating no more inscriptions to load
    //         setHasMore(data.length === 100);
    //     } catch (error) {
    //         console.error("Failed to fetch inscriptions:", error);
    //         // Handle error (e.g., show error message to user)
    //     } finally {
    //         setLoading(false);
    //     }
    // };



        

    // const handleFilterClick = (filterType: string) => {
    //     setActiveFilterButton(filterType);
    //     updateFilter('contentTypeType', filterType);
    // };

    // all maps to /inscriptions
    // image maps to /inscriptions/content_type_type/image
    // svg maps to /inscriptions/content_type/image%2Fsvg
    // gif maps to /inscriptions/content_type/image%2Fgif
    // 3D maps to /inscriptions/content_type/model
    // text maps to /inscriptions/content_type/text
    // html maps to /inscriptions/content_type/text%2Fhtml
    // audio maps to /inscriptions/content_type_type/audio
    // video maps to /inscriptions/content_type_type/video
    // application maps to /inscriptions/content_type_type/application
    // pdf maps to /inscriptions/content_type/application%2Fpdf
    // json maps to /inscriptions/content_type/application%2Fjson