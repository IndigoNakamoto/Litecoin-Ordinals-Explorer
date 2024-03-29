// contexts/InscribeOrderContext.tsx
import { createContext, useContext } from 'react';

interface InscribeOrderContextType {
    fileName: string;
    setFileName: React.Dispatch<React.SetStateAction<string>>;
    files: File[];
    setFiles: React.Dispatch<React.SetStateAction<File[]>>;
    fileSize: number;
    setFileSize: React.Dispatch<React.SetStateAction<number>>;
    error: string | null; // Add this line
    destinationAddresssetError: React.Dispatch<React.SetStateAction<string | null>>; // Add this line
    code: string | null;
    setCode: React.Dispatch<React.SetStateAction<string | null>>;
    credit: number | null;
    setCredit: React.Dispatch<React.SetStateAction<number | null>>;
    receivingAddress: string | null;
    setReceivingAddress: React.Dispatch<React.SetStateAction<string | null>>;
    serviceFee: number | null;
    setServiceFee: React.Dispatch<React.SetStateAction<number | null>>;
    ltcUSD: number;
    setLtcUSD: React.Dispatch<React.SetStateAction<number>>;
    destinationAddress: string | null;
    setDestinationAddress: React.Dispatch<React.SetStateAction<string | null>>;
    invoicePaymentLink: string | null;
    setInvoicePaymentLink: React.Dispatch<React.SetStateAction<string | null>>;
}
export const InscribeOrderContext = createContext<InscribeOrderContextType | null>(null);

export const useInscribeOrder = () => useContext(InscribeOrderContext);