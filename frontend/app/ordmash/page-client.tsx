'use client'
import { Typography } from "@material-tailwind/react";
import React, { useEffect, useState, useCallback } from 'react';


function page() {
    return (
        <section className="container mx-auto gap-10 px-4 py-10 lg:gap-16 lg:pt-14 justify-between">
            <div className=''>
                <Typography
                    className="text-5xl md:text-5xl font-bold text-white" placeholder={undefined}>
                    OrdMash
                </Typography>
                <Typography variant="h6" color="white" className="mt-1 font-medium text-white" placeholder={undefined}>
                    Are all Litoshis inscribed equally? No. Will we judge them. Yes
                </Typography>
                <Typography
                    className="pt-8 text-5xl md:text-5xl font-bold text-white" placeholder={undefined}>
                    Which is more Lit? Click to choose.
                </Typography>
            </div>
        </section>
    )
}

export default page