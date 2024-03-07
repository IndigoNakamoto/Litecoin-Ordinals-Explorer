import React, { useContext } from "react";
import { Typography, Button, Input, Card } from "@material-tailwind/react";
import Image from 'next/image';
import { InscribeOrderContext } from "../inscribe/page";



// interface OrderSummaryProps {
//     fileName: string; // Receive fileName prop
// }

// 
interface OrderSummaryProps {
    handleSubmit: () => void; // Add handleSubmit prop
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ handleSubmit }) => {
    const context = useContext(InscribeOrderContext);
    const FEE_PER_BYTE = 1;
    const POSTAGE = 10000;
    const SERVICE_FEE = 0.5; // USD
    const LTCUSD = 80;


    const files: { index: number, file_name: string, content_length: number, content_fee: number, service_fee: number, total: number, postage: number }[] | undefined = context?.files.map((file: FileDetails, index: number) => {
        return {
            index: index,
            file_name: file.name,
            content_length: file.size,
            content_fee: Math.ceil(file.size / 4 * FEE_PER_BYTE),
            postage: POSTAGE,
            service_fee: SERVICE_FEE / LTCUSD,
            total: Math.ceil(file.size / 4 * FEE_PER_BYTE) + POSTAGE + (SERVICE_FEE / LTCUSD),
        }
    })

    const total_service_fee = files?.reduce((acc, file) => acc + file.service_fee, 0).toFixed(5) * 100000000;
    const total_content_fee = files?.reduce((acc, file) => acc + file.content_fee, 0);
    const total_postage = files?.length * 10000;

    function formatLitsToLitecoin(lits: number) {
        const litsPerLitecoin = 100000000; // Number of lits in 1 Litecoin
        const litecoins = lits / litsPerLitecoin;

        // Convert to a fixed number of digits after the decimal to prevent scientific notation for very small numbers
        let formattedLitecoins = litecoins.toFixed(8); // Ensures the result is a string with 8 decimal places

        // Split the result into whole and fraction parts
        let [whole, fraction] = formattedLitecoins.includes('.') ? formattedLitecoins.split('.') : [formattedLitecoins, '00000000'];

        // Format the fractional part with non-breaking spaces
        fraction = `${fraction.slice(0, 2)}\u00A0${fraction.slice(2, 5)}\u00A0${fraction.slice(5)}`;

        return `${whole}.${fraction}`;
    }

    return (
        <Card className="mt-4" placeholder={undefined}>
            <div>
                <div>
                    <div className='p-4'>
                        <Typography variant="h6" color="blue-gray" placeholder={undefined}>
                            Order Summary
                        </Typography>
                        <div className="flex justify-between items-center mt-4">
                            <Typography
                                variant="small"
                                className="text-gray-600 font-normal mt-1" placeholder={undefined}            >
                                Inscription Postage:
                            </Typography>
                            <Typography
                                variant="small"
                                className="text-gray-600 font-normal mt-1" placeholder={undefined}            >
                                {formatLitsToLitecoin(total_postage)} LTC
                            </Typography>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                            <Typography
                                variant="small"
                                className="text-gray-600 font-normal mt-1" placeholder={undefined}            >
                                Content Size Fee:
                            </Typography>
                            <Typography
                                variant="small"
                                className="text-gray-600 font-normal mt-1" placeholder={undefined}            >
                                {formatLitsToLitecoin(total_content_fee)} LTC
                            </Typography>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                            <Typography
                                variant="small"
                                className="text-gray-600 font-normal mt-1" placeholder={undefined}            >
                                Service Fee:
                            </Typography>
                            <Typography
                                variant="small"
                                className="text-gray-600 font-normal mt-1" placeholder={undefined}            >
                                {formatLitsToLitecoin(total_service_fee)} LTC
                            </Typography>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                            <Typography
                                variant="small"
                                className="text-gray-600 font-normal mt-1" placeholder={undefined}            >
                                Code LitecoinFam:
                            </Typography>
                            <Typography
                                variant="small"
                                className="text-red-800 font-normal mt-1" placeholder={undefined}            >
                                -0.03 500 000 LTC
                            </Typography>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                            <Typography
                                variant="small"
                                className="text-gray-600 font-normal mt-1" placeholder={undefined}            >
                                Credit:
                            </Typography>
                            <Typography
                                variant="small"
                                className="text-red-800 font-normal mt-1" placeholder={undefined}            >
                                -0.00 050 000 LTC
                            </Typography>
                        </div>
                        <div className="border-t border-gray-300 my-2" />
                        <div className="flex justify-between items-center mt-1">
                            <Typography
                                variant="small"
                                className="text-gray-600 font-normal mt-1" placeholder={undefined}            >
                                Order Total:
                            </Typography>
                            <Typography
                                variant="small"
                                className="text-gray-600 font-normal mt-1" placeholder={undefined}            >
                                {formatLitsToLitecoin((total_postage) + (total_content_fee) + (total_service_fee))} LTC
                            </Typography>
                        </div>

                    </div>
                </div>

                {/* TODO: Implement logic for codes */}
                <div className="m-4 w-48 ">
                    <div className="flex">
                        <Input
                            id="code"
                            color="gray"
                            type=""
                            className="focus:!border-t-gray-700"
                            variant="standard" label="Code"
                            labelProps={{
                                className: "",
                            }}
                            // TODO add error logic
                            crossOrigin={undefined} />
                        <Typography variant='small' className='h-8 ml-4 mb-2 block font-medium  text-blue-500' placeholder={undefined}>
                            Code Applied
                        </Typography>
                        <div className='h-8 ml-4 mt-1'>
                            <Button variant="text" size="sm" className='text-gray-600' placeholder={undefined}>
                                Apply
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="m-4 w-48 ">
                    <label htmlFor="credit">
                    </label>
                    <div className="flex">
                        <Input
                            id="credit"
                            color="gray"
                            type=""
                            className="focus:!border-t-gray-700"
                            variant="standard" label="Credit"
                            labelProps={{
                                className: "",
                            }}
                        // TODO add error logic
                        />
                        <Typography variant='small' className='h-8 ml-4 mb-2 block font-medium  text-blue-500' placeholder={undefined}>
                            Credit Applied
                        </Typography>
                        <div className='h-8 ml-4 mt-1'>
                            <Button variant="text" size="sm" className='text-gray-600' placeholder={undefined}>
                                Update
                            </Button>
                        </div>
                    </div>
                </div>


                {/* The Input Receiving address component*/}
                <div className="m-4 mt-0 w-96">
                    <label htmlFor="receiving_address">
                        <Typography
                            variant="small"
                            className="mb-2 block font-medium text-gray-700" placeholder={undefined}                        >
                            Receiving Address
                        </Typography>
                    </label>
                    <Input
                        id="receiving_address"
                        color="gray"
                        size="lg"
                        type=""
                        variant="Outlined" 
                        label="Receiving Address"
                        name="receiving_address"
                        placeholder="ltc1..."
                        labelProps={{
                            className: "",
                        }} crossOrigin={undefined} 
                        // TODO: Add error logic
                        />
                    <Typography
                        variant="small"
                        color="gray"
                        className="mt-2 flex items-center gap-1 font-normal"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="-mt-px h-4 w-4"
                        >
                            <path
                                fillRule="evenodd"
                                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Send to a valid Litecoin Taproot Address (P2TR). OrdLite.io is not responsible for any loss of funds.
                    </Typography>
                    <Typography
                        variant="small"
                        className="mt-2 block font-medium text-gray-600" placeholder={undefined}                    >
                        I agree to the{" "}
                        <a
                            href="#"
                            className="underline transition-colors hover:text-blue-500"
                        >
                            Terms and Conditions
                        </a>
                    </Typography>
                </div>


                {/* Go to payment screen with the Litecoin address, order summary, and time remaining to complete the invoice order */}
                <div className='w-full p-4'>
                    <Button
                        onClick={handleSubmit}
                        color="blue"
                        size="lg"
                        className="mb-2 flex h-12 items-center justify-center gap-2 text-white w-full" placeholder={undefined}                    >

                        Inscribe with {" "}
                        <Image
                            src={`/logos/litecoin-ltc-logo.png`}
                            width={32}
                            height={32}
                            alt="Litecoin"
                            className="h-6 w-6"
                        />
                    </Button>
                </div>
            </div>
        </Card>
    );
}

export default OrderSummary;
