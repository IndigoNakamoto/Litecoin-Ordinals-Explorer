'use client'
import { useEffect, useState } from "react";
import { InscriptionCard } from '../components/inscriptionCard';
import { Avatar } from "@material-tailwind/react";

declare global {
    interface Window {
        litescribe: any; // Use `any` or a more specific type if you know the structure
    }
}

interface Inscription {
    content_type: string;
    inscription_id: string;
    inscription_number: number;
    content_type_type: string;
    content_length: number;
}

export default function Page() {
    const [balance, setBalance] = useState<number>(0);
    const [inscriptions, setInscriptions] = useState<Inscription[]>([]);

    useEffect(() => {
        const fetchAndCacheInscriptions = async () => {
            try {
                const cachedInscriptions = localStorage.getItem('inscriptions');
                if (cachedInscriptions) {
                    setInscriptions(JSON.parse(cachedInscriptions));
                }

                if (typeof window.litescribe !== 'undefined') {
                    console.log('LiteScribe is installed!');
                    const fetchedInscriptions = await window.litescribe.getInscriptions();
                    const InscriptionTranslated: Inscription[] = fetchedInscriptions.list.map((inscription: { inscriptionId: string; inscriptionNumber: number; contentType: string, content_type_type: string, contentLength: number }) => ({
                        inscription_id: inscription.inscriptionId,
                        inscription_number: inscription.inscriptionNumber,
                        content_type: inscription.contentType,
                        content_type_type: inscription.contentType.split('/')[0],
                        content_length: inscription.contentLength
                    }));

                    localStorage.setItem('inscriptions', JSON.stringify(InscriptionTranslated));
                    setInscriptions(InscriptionTranslated);
                    const balance = await window.litescribe.getBalance();
                    setBalance(balance);
                } else {
                    console.log('LiteScribe is not installed. Please consider installing it.');
                }
            } catch (error) {
                console.error('Error fetching inscriptions:', error);
            }
        };

        fetchAndCacheInscriptions();
    }, []);

    const sumContentLength = (objects: Inscription[]) => {
        return objects.reduce((total, obj) => total + obj.content_length, 0);
    };


    return (
        <div className="mx-auto p-4 max-w-screen-2xl pb-16">
            <div className="flex justify-center items-center w-full pt-4"> {/* Keep the format, but I want*/}
                <div className="flex gap-8 px-8"> {/* This creates a flex container for the avatar and content, making them columns */}
                    <div className="flex-shrink-0">
                        <Avatar alt="avatar" variant="rounded" src='/indigo.jpeg' placeholder={'undefined'} size="xxl" />
                    </div>

                    <div className="flex-grow"> {/* col 2 - Main content container */}
                        <div className="flex justify-between items-center mb-2 w-full"> {/* row 1 */}
                            <div className="flex-grow">
                                <p>Indigo Nakamoto</p>
                            </div>

                            <button className="flex-shrink-0 text-xs border border-gray-700 text-gray-200 p-1 px-2 rounded-xl hover:bg-gray-900 transition-colors duration-300 ease-in-out">
                                Edit profile
                            </button>


                            <div className="flex-grow">
                                <p>{balance.unconfirmed > 0 ? 'Transaction pending' : ''}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4"> {/* row 2 */}
                            <div>
                                <h2 className="text-sm text-stone-200">{inscriptions.length} Inscriptions </h2>
                            </div>
                            <div>
                                <h2 className="text-sm text-stone-200">{Math.round(sumContentLength(inscriptions) / 1000)} KB</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full border-t border-stone-800 my-8"></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 normal:grid-cols-6 gap-4">
                {Array.isArray(inscriptions) && inscriptions.map(inscription => (
                    <div key={inscription.inscription_id}>
                        <InscriptionCard {...inscription} />
                    </div>
                ))}
            </div>
        </div>
    );

}