import React, { useState, useEffect, useContext } from 'react';
import {
    Dialog,
    DialogBody,
    DialogHeader,
    DialogFooter,
    Typography,
    Button
} from "@material-tailwind/react";
import Image from 'next/image';
import PaymentModal from './paymentModal';
import { InscribeOrderContext } from "../components/contexts/InscribeOrderContext";

const fetchInvoiceData = async (invoice_id: string) => {
    // fetch data from 'localhost:3005/api/invoice/:invoiceId
    return await fetch(`http://localhost:3005/api/invoice/${invoice_id}`)
        .then(response => response.json())
};

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoiceId: string;
}

function formatLitsToLitecoin(lits: number) {
    // const litsPerLitecoin = 100000000; // Number of lits in 1 Litecoin
    // const litecoins = lits / litsPerLitecoin;

    // Convert to a fixed number of digits after the decimal to prevent scientific notation for very small numbers
    let formattedLitecoins = lits.toFixed(8); // Ensures the result is a string with 8 decimal places

    // Split the result into whole and fraction parts
    let [whole, fraction] = formattedLitecoins.includes('.') ? formattedLitecoins.split('.') : [formattedLitecoins, '00000000'];

    // Format the fractional part with non-breaking spaces
    fraction = `${fraction.slice(0, 2)}\u00A0${fraction.slice(2, 5)}\u00A0${fraction.slice(5)}`;

    return `${whole}.${fraction}`;
}





const InvoiceModal: React.FC<ModalProps> = ({ isOpen, onClose, invoiceId }) => {
    const context = useContext(InscribeOrderContext);
    if (!context) {
        throw new Error("FileUpload must be used within a InscribeOrderContext.Provider");
    }
    const { destinationAddress, invoicePaymentLink } = context;

    const [fetchedInvoice, setFetchedInvoice] = useState<any | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false); // State to manage Payment modal visibility


    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchInvoiceData(invoiceId);
            // console.log('Data:', data);
            setFetchedInvoice(data);
        };

        if (isOpen) {
            fetchData();
        }
    }, [isOpen, invoiceId]);

    const cancelInvoice = async () => {
        const response = await fetch(`http://localhost:3005/api/invoice/markInvalid/${invoiceId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // You might need to send a body or additional headers depending on your backend requirements
        });

        if (response.ok) {
            const updatedInvoice = await response.json();
            // Assuming the backend returns the updated invoice, we set it to our state
            // Alternatively, you could manually update the fetchedInvoice state to reflect the cancellation
            setFetchedInvoice({
                ...fetchedInvoice,
                status: updatedInvoice.status, // Update the status based on the response
            });
            // Optionally, close the modal or provide feedback to the user
        } else {
            // Handle error case
            console.error("Failed to cancel the invoice");
        }
    };



    const openPaymentModal = () => setIsPaymentModalOpen(true); // Function to open Payment modal
    const closePaymentModal = () => setIsPaymentModalOpen(false); // Function to close Payment modal

    const showButton = fetchedInvoice?.status === 'New';
    const date = new Date(fetchedInvoice?.createdTime * 1000).toLocaleString();
    return (
        <>

            <Dialog open={isOpen} handler={onClose} placeholder={undefined} size={'xl'} className=''>
                <DialogHeader placeholder={undefined} className='flex justify-between'>
                    <div className='gap-0 m-0 p-0'>

                        <Typography className='text-gray-900' variant='h1' placeholder={undefined}>Invoice</Typography>
                        <Typography variant='lead' placeholder={undefined}>{fetchedInvoice?.id || "Loading..."}</Typography>
                    </div>
                    <div className='p-4'>
                        <Image src="/OrdinalsLiteLogo3.svg" width={100} height={100} alt="Litecoin" />
                    </div>
                </DialogHeader>


                <DialogBody placeholder={undefined}>
                    <Typography variant='h5' className='text-gray-900' placeholder={undefined}> OrdLite.io</Typography>
                    <div className='flex gap-2'>
                        <Typography variant='h6' className='w-40 text-gray-900 font-bold text-md' placeholder={undefined}> Payment Status: </Typography>
                        <Typography variant='lead' className='text-gray-900 text-md' placeholder={undefined}> {fetchedInvoice?.status || "Loading..."}</Typography>
                    </div>
                    <div className='flex gap-2'>
                        <Typography variant='h6' className='w-40 text-gray-900 font-bold text-md' placeholder={undefined}> Inscribe Status: </Typography>
                        <Typography variant='lead' className='text-gray-900 text-md' placeholder={undefined}> {fetchedInvoice?.metadata.status}</Typography>
                    </div>
                    <div className='flex gap-2'>
                        <Typography variant='h6' className='w-40 text-gray-900 font-bold text-md' placeholder={undefined}> Created:</Typography>
                        <Typography variant='lead' className='text-gray-900 text-md' placeholder={undefined}>  {date || "Loading..."} </Typography>
                    </div>
                    <div className='flex gap-2'>
                        <Typography variant='h6' className='w-40 text-gray-900 font-bold text-md' placeholder={undefined}> Total Due:</Typography>
                        <Typography variant='lead' className='text-gray-900 text-md' placeholder={undefined}>  {formatLitsToLitecoin(Number(fetchedInvoice?.due)) || "0"} LTC </Typography>
                    </div>
                    {/* <div className='flex gap-2'>
                        <Typography variant='h6' className='w-40 text-gray-900 font-bold text-md' placeholder={undefined}> LTC/USD Rate: </Typography>
                        <Typography variant='lead' className='text-gray-900 text-md' placeholder={undefined}>  {`$${fetchedInvoice?.metadata.ltc_usd_rate.toFixed(2)}`} </Typography>
                    </div> */}

                    {fetchedInvoice?.metadata?.files && (
                        <table className="w-full mt-16 border-collapse text-gray-900 text-lefttable-auto ">
                            <thead>
                                <tr>
                                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">File Name</th>
                                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">Size</th>
                                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">Content Fee</th>
                                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">Postage Fee</th>
                                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">Service Fee</th>
                                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">Total</th>
                                    <th className='border-b border-blue-gray-100 bg-blue-gray-50 p-4'>Inscription</th>
                                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">Inscribe Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fetchedInvoice.metadata.files.map((file: any, index: number) => (
                                    <tr key={index} className='even:bg-blue-gray-50/50'>
                                        <td className="p-2">{file.fileName}</td>
                                        <td className="p-2">{file.fileSize} bytes</td>
                                        <td className="p-2">{formatLitsToLitecoin(file.contentFee)} LTC</td>
                                        <td className="p-2">{formatLitsToLitecoin(file.postage) || '0.00 000 000'} LTC</td>
                                        <td className="p-2">{formatLitsToLitecoin(file.serviceFee)} LTC</td>
                                        <td className="p-2">{formatLitsToLitecoin(file.total)} LTC</td>
                                        <td className="p-2">View</td>
                                        <td className="p-2">{file.inscribeStatus}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                </DialogBody>

                {showButton && ( // Conditionally render the button
                    <DialogFooter placeholder={undefined}>
                        <div className='flex px-4 gap-4'>
                            <Button
                                onClick={openPaymentModal}
                                color="blue"
                                size="lg"
                                className="mb-2 flex w-40 h-12 items-center justify-center gap-2 text-white m-8 mx-auto" // Add mx-auto class for horizontal centering
                                disabled={undefined} // Conditionally disable the button if total postage is 0 or receiving address is invalid
                                placeholder={undefined}                    >
                                Pay with {" "}
                                <Image
                                    src={`/logos/litecoin-ltc-logo.png`}
                                    width={32}
                                    height={32}
                                    alt="Litecoin"
                                    className="h-6 w-6"
                                />
                            </Button>

                            {/* TODO: fetch(localhost:3005/api/invoice/markInvalid/:invoiceId). Refresh state, which should make the buttons dissapear */}
                            <Button
                                onClick={cancelInvoice}
                                color="red"
                                size="lg"
                                variant='outlined'
                                className="mb-2 flex w-40  h-12 items-center justify-center gap-2 text-red-500 m-8 mx-auto" // Add mx-auto class for horizontal centering
                                disabled={undefined} // Conditionally disable the button if total postage is 0 or receiving address is invalid
                                placeholder={undefined}  >
                                Cancel
                            </Button>
                        </div>
                    </DialogFooter>
                ) || (
                        // eslint-disable-next-line react/no-children-prop
                        <DialogFooter placeholder={undefined} className='pb-16' children={undefined}>
                        </DialogFooter>
                    )}
            </Dialog>
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={function (): void {
                    throw new Error('Function not implemented.');
                }}
                id={fetchedInvoice?.id}
                expirationTime={fetchedInvoice?.expirationTime}
                createdTime={fetchedInvoice?.createdTime}
                due={fetchedInvoice?.amount}
                metadata={fetchedInvoice?.metadata}
                paymentLink={String(invoicePaymentLink)}
                currency={'LTC'}
                LTC_USD={Number(fetchedInvoice?.metadata.ltc_usd_rate)}
                paymentAddress={String(destinationAddress)}
            />
        </>
    );
};

export default InvoiceModal;
