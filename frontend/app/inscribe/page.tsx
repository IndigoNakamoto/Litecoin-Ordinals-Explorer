'use client'
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Avatar,
    Input,
    Button
} from "@material-tailwind/react";
import Image from "next/image";
export default function Page() {

    return (
        <div className="mx-auto p-4 max-w-screen-xl">
            <Typography variant="h1" className="mb-6 font-2xl">
                Inscribe
            </Typography>
            <div className="flex items-center justify-center max-w-xl">
                <label for="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-1 border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-blue-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                        </svg>
                        <p className="mb-2 text-sm text-blue-500 dark:text-blue-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-blue-500 dark:text-blue-400">Any file less than 400KB</p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" />
                </label>
            </div>
            <div className="my-6 max-w-xl">
                <label htmlFor="Litecoin Receiving Address">
                    <Typography
                        variant="small"
                        className="mb-2 block font-medium text-gray-200"
                    >
                        Your Receiving Taproot Address
                    </Typography>
                </label>
                <Input
                    id="ltcaddress"
                    color="gray"
                    size="lg"
                    type="text"
                    name="text"
                    placeholder="ltc1..."
                    className="focus:!border-t-gray-900"
                    labelProps={{
                        className: "hidden",
                    }} crossOrigin={undefined} />

                <Button
                    color="white"
                    size="lg"
                    className="mt-4 flex h-12 items-center justify-center gap-2 text-black"
                    fullWidth
                >

                    Inscribe with {" "}                    
                    <Image
                        src={`/logos/litecoin-ltc-logo.png`}
                        width={32}
                        height={32}
                        alt="google"
                        className="h-6 w-6"
                    />
                </Button>
            </div>
            <div>
                {/* list of files  */}
            </div>

        </div>
    )
}


// <Typography variant="h1" className="mb-6 font-2xl">
// Inscribe
// </Typography>
// <div className='flex justify-center max-w-4xl mx-auto lg:py-36'>
// <Card className="max-w-[24rem] overflow-hidden">
// <CardHeader
//     floated={false}
//     shadow={false}
//     color="transparent"
//     className="m-0 rounded-none relative"
// >
//     <div className='mx-auto bg-blue-200 h-40 w-20 mt-8 rounded-xl' />
// </CardHeader>
// <CardBody>
//     <Typography variant="h4" color="blue-gray">
//         Single Parent File
//     </Typography>
//     <Typography variant="lead" color="gray" className="mt-3 font-normal">
//         Upload a single file less than 400KB to be inscribed onto the Litecoin Blockchain
//     </Typography>
// </CardBody>
// </Card>