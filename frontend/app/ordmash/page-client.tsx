'use client'
import { Typography } from "@material-tailwind/react";
import React, { useEffect, useState, useCallback } from 'react';
import { CardOrdmash } from '../components/CardOrdmash';


function page() {
    return (
        <div className='max-w-full flex flex-col items-center'> {/* Added flex and flex-col */}
            <div className='w-full'> {/* mx-auto removed; justify-between requires flex */}
                <section className="flex items-center justify-between py-2 md:p-4  md:py-2 bg-gradient-to-r from-blue-500 to-blue-700">
                    <div className="pl-4">
                        <Typography
                            className="text-5xl md:text-5xl font-bold text-white" placeholder={undefined}>
                            OrdMash
                        </Typography>
                        <Typography variant="h6" color="white" className="mt-1 font-medium text-white" placeholder={undefined}>
                            Are all Litoshis inscribed equally? No. Will we judge them. Yes
                        </Typography>
                    </div>
                    <div className="pr-4">
                        <Typography variant="h6" color="white" className="mt-1 font-medium text-white" placeholder={undefined}>
                            Top 1000
                        </Typography>
                    </div>
                </section>
                <section className="container mx-auto gap-10 px-4 lg:gap-16">
                    <div className='pb-4'>
                        <Typography
                            className="pt-8 text-5xl md:text-4xl font-semibold text-white" placeholder={undefined}>
                            Which is more Lit? Click to choose.
                        </Typography>
                    </div>
                    {/* Issues with the styling for Both CardOrdmash components */}
                    <div className="grid pt-8 gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>

                        <CardOrdmash inscription_id={"d1effe076165cd6940cc6e1a92822c5b6cc36fe22fad8668feefbb25ab4f4032i0"} inscription_number={2} content_type="application/pdf" content_type_type="application" content_length={57} />
                        <div className='flex justify-center items-center h-full'>
                            <Typography
                                className="text-5xl md:text-5xl font-bold text-white">
                                Or
                            </Typography>
                        </div>

                        <CardOrdmash inscription_id={"309ca94df5683e4daaaac8b97339d7ad92801230eda6d9ba94771ba5b6c33bb6i0"} inscription_number={3} content_type="application/pdf" content_type_type="application" content_length={57} />
                    </div>
                </section>
            </div>
        </div>
    )
}

export default page