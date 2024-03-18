'use client'
import { useEffect, useState } from "react";
import { InscriptionCard } from '../components/inscriptionCard';
import { Avatar } from "@material-tailwind/react";
// import Footer from "../components/footer";


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
    const [balance, setBalance] = useState<string>('0');
    const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
    const [total, setTotal] = useState<string>('0');
    const [username, setUsername] = useState<string>('');
    const [copySuccess, setCopySuccess] = useState<boolean>(false);


    useEffect(() => {
        const fetchAndCacheInscriptions = async () => {
            try {
                const cachedInscriptions = localStorage.getItem('inscriptions');
                const balance = localStorage.getItem('balance');
                const total = localStorage.getItem('total');
                const username = localStorage.getItem('username')
                const provider = localStorage.getItem('provider')
                if (cachedInscriptions && balance && total && username) {
                    setInscriptions(JSON.parse(cachedInscriptions));
                    setBalance(balance)
                    setTotal(total)
                    setUsername(username)
                }
                if (typeof window.litescribe !== 'undefined' && provider === 'litescribe') {
                    const initialized = await window.litescribe.requestAccounts();
                    setUsername(initialized[0])
                    localStorage.setItem('username', initialized[0]);
                    let cursor = 0
                    let size = 100
                    const fetchedInscriptions = await window.litescribe.getInscriptions(cursor, size);
                    // console.log('Fetched inscriptions: ', fetchedInscriptions)

                    if (fetchedInscriptions) {
                        const InscriptionTranslated: Inscription[] = fetchedInscriptions.list.map((inscription: { inscriptionId: string; inscriptionNumber: number; contentType: string, content_type_type: string, contentLength: number }) => ({
                            inscription_id: inscription.inscriptionId,
                            inscription_number: inscription.inscriptionNumber,
                            content_type: inscription.contentType,
                            content_type_type: inscription.contentType.split('/')[0],
                            content_length: inscription.contentLength
                        }));
                        localStorage.setItem('inscriptions', JSON.stringify(InscriptionTranslated));
                        setInscriptions(InscriptionTranslated);



                        // console.log('profile inscriptions:', fetchedInscriptions)
                        // console.log('Set local storage total: ', fetchedInscriptions.total.toString())
                        // localStorage.setItem('total', fetchedInscriptions.total.toString());
                        // console.log('Set Total state:', fetchedInscriptions.total.toString())
                        setTotal(fetchedInscriptions.total.toString())
                    }
                    const balance = await window.litescribe.getBalance();
                    localStorage.setItem('balance', balance.toString());
                    setBalance(balance.toString());
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

    const handleUsernameClick = () => {
        navigator.clipboard.writeText(username);
        setCopySuccess(true);
        setTimeout(() => {
            setCopySuccess(false);
        }, 2000); // 1000ms = 1 second
    };

    return (
        <div className="mx-auto p-4 max-w-screen-2xl pb-16">
            <div className="flex justify-center items-center w-full pt-4"> {/* Keep the format, but I want*/}
                <div className="flex gap-8 px-8"> {/* This creates a flex container for the avatar and content, making them columns */}
                    <div className="flex-shrink-0">
                        <Avatar alt="avatar" variant="circular" src='/avatar-bgwhite.png' placeholder={'undefined'} size="xxl" />
                    </div>

                    <div className="flex-grow"> {/* col 2 - Main content container */}
                        <div className="flex justify-between items-center mb-2 w-[400px]"> {/* row 1 */}
                            <div className="flex-grow flex items-center w-full"> {/* col 1 - Username and "Copied!" message container */}
                                {copySuccess ? (
                                    <span className="text-blue-500 animate-fadeInOut">Copied!</span>
                                ) : (
                                    <p onClick={handleUsernameClick} style={{ cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{username}</p>
                                )}
                            </div>
                            <div className="flex-grow">
                                <p>{balance.unconfirmed > 0 ? 'Transaction pending' : ''}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4"> {/* row 2 */}
                            <div>
                                <h2 className="text-sm text-stone-200">{total} Inscriptions </h2>
                            </div>
                            <div>
                                <h2 className="text-sm text-stone-200">{Math.round(sumContentLength(inscriptions) / 1000)} KB</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full border-t border-stone-800 my-8"></div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 normal:grid-cols-5 gap-4">
                {Array.isArray(inscriptions) && inscriptions.map(inscription => (
                    <div key={inscription.inscription_id}>
                        <InscriptionCard {...inscription} />
                    </div>
                ))}
            </div>
            {/* <Footer /> */}
        </div>
    );

}