'use client'
// app/inscribe/page.tsx
import {
    Typography,
    Input,
    Button,
    Card
} from "@material-tailwind/react";
import Image from "next/image";
import InvoiceTable from '../components/inscribe-table'
import InscribeOrder from '../components/inscribe-order'
import FileUpload from "../components/FileUpload";
import InscribePayment from '../components/inscribe-payment'
export default function Page() {

    return (
        <section className="mx-auto max-w-full bg-gray-200 lg:py-36">
            <div className="mx-auto p-4 max-w-screen-xl">
                <Typography variant="h1" className="mb-6 font-2xl text-gray-900">
                    Inscribe
                </Typography>

                {/* Pre inscription */}
                <div className="grid grid-cols-1 pt-8 lg:grid-cols-2 gap-4">
                    <FileUpload />
                    <div className="w-full">
                        <InscribeOrder />
                        <Card className="mt-4">
                            {/* Breakdown */}
                            <div className='p-4'>
                                <Typography variant="h6" color="blue-gray" placeholder={undefined}>
                                    Order Summary
                                </Typography>
                                <Typography
                                    variant="small"
                                    className="text-gray-600 font-normal mt-1" placeholder={undefined}            >
                                    Inscription Postage
                                </Typography>
                                <Typography
                                    variant="small"
                                    className="text-gray-600 font-normal mt-1" placeholder={undefined}            >
                                    Content Size Fee
                                </Typography>
                                <Typography
                                    variant="small"
                                    className="text-gray-600 font-normal mt-1" placeholder={undefined}            >
                                    Service Fee
                                </Typography>
                                <Typography
                                    variant="small"
                                    className="text-gray-600 font-normal mt-1" placeholder={undefined}            >
                                    Service Fee
                                </Typography>
                                <p>Order total</p>
                            </div>

                            {/* Input Code */}
                            <div className="m-4 w-32 ">
                                <label htmlFor="code">
                                    <Typography
                                        variant="small"
                                        className="mb-2 block font-medium text-gray-700"
                                    >
                                        Code
                                    </Typography>
                                </label>
                                <Input
                                    id="code"
                                    color="gray"
                                    size="lg"
                                    type=""
                                    name="code"
                                    placeholder="Code"
                                    className="focus:!border-t-gray-700"
                                    labelProps={{
                                        className: "hidden",
                                    }}
                                />
                            </div>
                            <button>Apply</button>

                            {/* Input Receiving address */}

                            <div className="m-4 mt-0">
                                <label htmlFor="receiving_address">
                                    <Typography
                                        variant="small"
                                        className="mb-2 block font-medium text-gray-700"
                                    >
                                        Receiving Address
                                    </Typography>
                                </label>
                                <Input
                                    id="receiving_address"
                                    color="gray"
                                    size="lg"
                                    type=""
                                    name="receiving_address"
                                    placeholder="ltc1..."
                                    className="focus:!border-t-gray-700"
                                    labelProps={{
                                        className: "hidden",
                                    }}
                                />
                                <Typography
                                    variant="small"
                                    className="mt-2 block font-medium text-gray-600"
                                >
                                    I agree to the{" "}
                                    <a
                                        href="#"
                                        className="underline transition-colors hover:text-blue-500"
                                    >
                                        Terms and Conditions
                                    </a>
                                </Typography>
                            </div>
                            <div className='w-full p-4'>
                            <Button
                                color="blue"
                                size="lg"
                                className="mb-2 flex h-12 items-center justify-center gap-2 text-white w-full"
                            >

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

                        </Card>


                    </div>

                </div>


                {/* Post Inscription */}
                <div className="my-6">
                    <InvoiceTable />
                </div>

            </div>
        </section>
    )
}