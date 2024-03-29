'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from "next/legacy/image"; // Import Next.js Image component for optimized images
import { Button, IconButton } from "@material-tailwind/react";
import ConnectModal from './ConnectModal';
import { ProfileMenu } from './ProfileMenu';


const Menu = () => {
  const [connected, setConnected] = useState('false');
  const [user, setUser] = useState('');
  useEffect(() => {
    const connected = localStorage.getItem('connected');
    const username = localStorage.getItem('username')
    if (connected === 'true') {
      setConnected('true')
    }
    setUser(String(username))
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleButtonClick = () => {
    setIsModalOpen(true);
  };

  return (
    <nav className='bg-gradient-to-br from-white to-gray-500 max-w-full shadow-md '>
      <div className="flex items-center py-2 md:p-4 mx-auto">
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
        {/* <div className="flex-initial">
          <Link href="/liteclash" passHref className="hover:text-blue-600 text-black font-semibold py-2 px-4 rounded-xl  transition-colors duration-300 ease-in-out">
            LiteClash
          </Link>
        </div> */}
        <div className="flex items-center ml-auto space-x-2">
          {/* Added ml-auto to move this item to the far right */}
          <Link href="https://discord.com/invite/z2FWv5v5uJ" passHref>
            <IconButton variant="gradient" className="rounded-full bg-gradient-to-br from-white to-gray-500" placeholder={undefined}>
              <Image
                src="/logos/discord.svg"
                alt="litescribe"
                width={24}
                height={24}
              />
            </IconButton>
          </Link>
          <Link href="https://x.com/ordlite" passHref>
            <IconButton variant="gradient" className="rounded-full bg-gradient-to-br from-white to-gray-500" placeholder={undefined}>
              <Image
                src="/logos/x.svg"
                alt="litescribe"
                className='text-white'
                width={24}
                height={24}
              />
            </IconButton>
          </Link>
          <div className='pr-4'>
            {connected === 'true' ?
              <ProfileMenu user={user} /> :
              <div className="hidden md:flex">
                <Button
                  onClick={handleButtonClick}
                  size="md"
                  variant="filled"
                  className="p-2 flex h-10 items-center justify-center gap-2 text-black w-28 bg-gradient-to-br from-white to-gray-500" placeholder={undefined}                >
                  Connect
                </Button>
              </div>
            }
          </div>
        </div>
      </div >
      <ConnectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </nav >
  );
};

export default Menu;
