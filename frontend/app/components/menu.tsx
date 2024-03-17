'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import Image from "next/legacy/image"; // Import Next.js Image component for optimized images
import { Avatar } from "@material-tailwind/react";
import { Typography, Button, Input, Card } from "@material-tailwind/react";
import ConnectModal from './ConnectModal';

const Menu = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => {
    setIsModalOpen(true);
};
  const handleButtonClick = () => {
    setIsModalOpen(true);
  };

  return (
    <nav className='bg-gradient-to-br from-white to-gray-300 max-w-full shadow-md '>
      {/* <MetaMaskProvider> */}
      <div className="flex items-center py-4 mx-auto max-w-screen-2xl">
        {/* Logo and OrdLite.io text */}
        <Link href="/" passHref className="flex items-center text-black font-semibold py-1 px-4 text-2xl cursor-pointer">
          {/* SVG logo next to the text */}
          <Image src="/OrdinalsLiteLogo3.png" alt="OrdLite logo" width={42} height={42} className="h-8" />
          <span className='pl-2'>
            OrdLite.io
          </span>
        </Link>
        <div className="flex-initial">
          <Link href="/stats" passHref className="hover:text-blue-600 text-black font-semibold py-2 px-4 rounded-xl  transition-colors duration-300 ease-in-out">
            Stats
          </Link>
        </div>
        <div className="flex-initial">
          <Link href="/inscribe" passHref className="hover:text-blue-600 text-black font-semibold py-2 px-4 rounded-xl  transition-colors duration-300 ease-in-out">
            Inscribe
          </Link>
        </div>
        <div className="flex-initial ml-auto">
          {/* Added ml-auto to move this item to the far right */}
          
          {/* <Link href="/profile" passHref className="hover:text-blue-600 text-black font-semibold py-0 px-0 rounded-xl  transition-colors duration-300 ease-in-out"> */}
            {/* <Avatar alt="avatar" variant="rounded" src='/indigo.jpeg' placeholder={'undefined'} size="sm"/> */}
            <Button
              onClick={handleButtonClick}
              color="blue"
              size="md"
              variant="outlined"
              className="p-2 flex h-10 items-center justify-center gap-2 text-blue-600 w-full" placeholder={undefined}            >
              Connect Wallet
            </Button>
          {/* </Link> */}
        </div>
      </div >
      <ConnectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </nav >
  );
};

export default Menu;
