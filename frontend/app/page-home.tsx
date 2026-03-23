'use client'

import debounce from 'lodash/debounce';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import type { Inscription } from '@/types';

import { InscriptionCard } from './components/inscriptionCard';
import {
    DEFAULT_EXPLORER_FILTERS,
    EXPLORER_PAGE_SIZE,
    fetchInscriptions,
    type ExplorerFilters,
} from './lib/explorer';

interface HomeProps {
    initialInscriptions: Inscription[] | unknown;
}

function asInscriptionList(value: unknown): Inscription[] {
    return Array.isArray(value) ? value : [];
}

export default function Home({ initialInscriptions }: HomeProps) {
    const initialItems = asInscriptionList(initialInscriptions);
    const [inscriptions, setInscriptions] = useState<Inscription[]>(initialItems);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<ExplorerFilters>(DEFAULT_EXPLORER_FILTERS);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [hasMore, setHasMore] = useState(initialItems.length === EXPLORER_PAGE_SIZE);
    const [activeFilterButton, setActiveFilterButton] = useState('All');
    const [selectedSortOption, setSelectedSortOption] = useState<string>('Oldest');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [rightPosition, setRightPosition] = useState('0px');
    const [error, setError] = useState<string | null>(null);
    const [loadedPreviewIds, setLoadedPreviewIds] = useState<Set<string>>(
        () => new Set(initialItems.slice(0, 8).map((item) => item.inscription_id)),
    );

    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const hasMounted = useRef(false);

    const markVisibleCards = useMemo(
        () =>
            debounce((ids: string[]) => {
                setLoadedPreviewIds((prev) => {
                    const next = new Set(prev);
                    ids.forEach((id) => next.add(id));
                    return next;
                });
            }, 50),
        [],
    );

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const idsToLoad = entries
                    .filter((entry) => entry.isIntersecting)
                    .map((entry) => entry.target.getAttribute('data-inscription-id'))
                    .filter((value): value is string => Boolean(value));

                if (idsToLoad.length > 0) {
                    markVisibleCards(idsToLoad);
                }
            },
            { rootMargin: '200px', threshold: 0.1 },
        );

        cardRefs.current.forEach((ref) => {
            if (ref) {
                observer.observe(ref);
            }
        });

        return () => {
            markVisibleCards.cancel();
            observer.disconnect();
        };
    }, [inscriptions, markVisibleCards]);

    useEffect(() => {
        if (!hasMounted.current) {
            hasMounted.current = true;
            return;
        }

        const fetchPage = async () => {
            setLoading(true);
            setError(null);

            const pageItems = await fetchInscriptions(filter);

            if (pageItems.length === 0) {
                if (filter.page === 1) {
                    setInscriptions([]);
                    setError('No inscriptions matched this filter.');
                }

                setHasMore(false);
                setLoading(false);
                return;
            }

            setInscriptions((prev) =>
                filter.page === 1 ? pageItems : [...prev, ...pageItems],
            );
            setLoadedPreviewIds((prev) => {
                const next = filter.page === 1 ? new Set<string>() : new Set(prev);
                pageItems.slice(0, 8).forEach((item) => next.add(item.inscription_id));
                return next;
            });
            setHasMore(pageItems.length === EXPLORER_PAGE_SIZE);
            setLoading(false);
        };

        fetchPage();
    }, [filter]);

    useEffect(() => {
        const updateButtonPosition = () => {
            const viewportWidth = window.innerWidth;
            const maxWidth = 1520;
            const excessWidth = Math.max(0, viewportWidth - maxWidth);
            setRightPosition(`${excessWidth / 2}px`);
        };

        window.addEventListener('resize', updateButtonPosition);
        updateButtonPosition();
        return () => window.removeEventListener('resize', updateButtonPosition);
    }, []);

    useEffect(() => {
        const handleScroll = debounce(() => {
            setShowScrollButton(window.scrollY > window.innerHeight);
        }, 100);

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            handleScroll.cancel();
        };
    }, []);

    const handleLoadMore = () => {
        setFilter((prevFilter) => ({
            ...prevFilter,
            page: prevFilter.page + 1,
        }));
    };

    const handleFilterClick = (filterType: string) => {
        setActiveFilterButton(filterType);
        setInscriptions([]);
        setHasMore(true);
        setError(null);

        const nextFilter: ExplorerFilters = {
            ...filter,
            page: 1,
            contentType: '',
            contentTypeType: '',
        };

        if (filterType === 'SVG') {
            nextFilter.contentType = encodeURIComponent('image/svg+xml');
        } else if (filterType === 'GIF') {
            nextFilter.contentType = encodeURIComponent('image/gif');
        } else if (filterType === 'HTML') {
            nextFilter.contentType = encodeURIComponent('text/html;charset=utf-8');
        } else if (filterType === 'PDF') {
            nextFilter.contentType = encodeURIComponent('application/pdf');
        } else if (filterType === 'JSON') {
            nextFilter.contentType = encodeURIComponent('application/json');
        } else if (filterType === '3D') {
            nextFilter.contentTypeType = 'model';
        } else if (filterType === 'Text') {
            nextFilter.contentTypeType = 'text';
        } else if (filterType === 'Audio') {
            nextFilter.contentTypeType = 'audio';
        } else if (filterType === 'Video') {
            nextFilter.contentTypeType = 'video';
        } else if (filterType === 'Image') {
            nextFilter.contentTypeType = 'image';
        }

        setFilter(nextFilter);
    };

    const updateFilter = (type: 'sortOrder' | 'contentType' | 'contentTypeType' | 'cursed', value: string | boolean) => {
        setHasMore(true);
        setFilter((prev) => ({ ...prev, page: 1, [type]: value }));
    };

    const handleSortOptionSelect = (option: string) => {
        setInscriptions([]);
        setSelectedSortOption(option);
        setDropdownOpen(false);

        if (option === 'Newest') updateFilter('sortOrder', 'number_desc');
        if (option === 'Oldest') updateFilter('sortOrder', 'number_asc');
        if (option === 'Highest Fee') updateFilter('sortOrder', 'genesis_fee');
        if (option === 'Largest File') updateFilter('sortOrder', 'content_length');
    };

    const toggleDropdown = () => {
        setDropdownOpen((prevState) => !prevState);
    };

    return (
        <div className="mx-auto mb-16 max-w-screen-2xl p-4">
            <h1 className="text-2xl font-bold">Inscriptions</h1>

            <div className="flex gap-2 overflow-x-auto pt-2 no-scrollbar">
                {['All', 'Video', 'Image', 'SVG', 'GIF', 'JSON', 'Text', 'PDF', 'Audio', '3D'].map((type) => (
                    <button
                        key={type}
                        onClick={() => handleFilterClick(type)}
                        className={`rounded-3xl px-3 py-1 text-sm ${activeFilterButton === type ? 'bg-gradient-to-br from-blue-400 to-blue-700 text-white' : 'bg-gradient-to-br from-white to-gray-400 text-black'}`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            <div className="relative inline-block pt-4">
                <button onClick={toggleDropdown} className="w-32 rounded-lg bg-gradient-to-br from-blue-400 to-blue-700 px-3 py-1.5 text-sm text-white">
                    {selectedSortOption} <svg className="ml-1 inline-block h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {dropdownOpen && (
                    <div className="absolute right-0 z-10 mt-1 w-32 rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-200 shadow-lg">
                        {['Newest', 'Oldest', 'Highest Fee', 'Largest File'].map((option) => (
                            <button key={option} onClick={() => handleSortOptionSelect(option)} className="block w-full px-4 py-2 text-left text-sm text-gray-800 hover:text-blue-700">
                                {option}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-8 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4">
                {inscriptions.map((inscription, index) => (
                    <div
                        key={inscription.inscription_id}
                        ref={(el) => {
                            cardRefs.current[index] = el;
                        }}
                        data-inscription-id={inscription.inscription_id}
                    >
                        <InscriptionCard
                            {...inscription}
                            shouldLoadPreview={loadedPreviewIds.has(inscription.inscription_id)}
                        />
                    </div>
                ))}
            </div>

            {error && !loading && (
                <p className="pt-8 text-center text-sm text-gray-400">{error}</p>
            )}

            {loading && (
                <p className="pt-8 text-center text-2xl">Loading...</p>
            )}

            {showScrollButton && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="fixed bottom-20 z-50 rounded-full bg-gradient-to-br from-blue-500 to-blue-800 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                    style={{ transition: 'opacity 0.3s', right: rightPosition }}
                >
                    ↑ Top
                </button>
            )}

            <div className="flex justify-center">
                {!loading && hasMore && (
                    <button
                        onClick={handleLoadMore}
                        className="mt-4 w-40 rounded-lg bg-gradient-to-br from-blue-400 to-blue-700 px-4 py-2 text-white"
                    >
                        Load More
                    </button>
                )}
            </div>
        </div>
    );
}
