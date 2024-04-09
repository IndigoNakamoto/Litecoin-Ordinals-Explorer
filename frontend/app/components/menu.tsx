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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const connected = localStorage.getItem('connected');
    const username = localStorage.getItem('username')
    if (connected === 'true') {
      setConnected('true')
    }
    setUser(String(username))
  }, []);


  const handleButtonClick = () => {
    setIsModalOpen(true);
  };
  const toggleMobileMenu = () => {
    setShowMobileMenu(current => !current);
  };

  return (
    <nav className='bg-gradient-to-br from-white to-gray-500 max-w-full shadow-md'>
      <div className="flex items-center py-2 md:p-4 mx-auto justify-between">

        {/* Logo and OrdLite.io text */}
        <Link href="/" passHref className="flex items-center text-black font-semibold py-1 px-4 text-2xl cursor-pointer">
          <div className='h-10 w-10'>
            <Image src="/OrdinalsLiteLogo3.png" alt="OrdLite.io Logo" width={42} height={42} />
          </div>
          <span className='pl-2'>OrdLite.io</span>
        </Link>

        {/* Hide these links on mobile using md:flex */}
        <div className="hidden lg:flex items-center space-x-2 w-full justify-between">
          {/* Left side yellow*/}
          <div className="flex ">
            <div className="flex-initial">
              <Link href="/info" passHref className="hover:text-blue-600 text-black font-semibold py-2 px-4 rounded-xl  transition-colors duration-300 ease-in-out">
                Info
              </Link>
            </div>
            <div className="flex-initial">
              <Link href="/inscribe" passHref className="hover:text-blue-600 text-black font-semibold py-2 px-4 rounded-xl  transition-colors duration-300 ease-in-out">
                Inscribe
              </Link>
            </div>
            <p className='text-gray-500'>|</p>
            <div className="flex-initial">
              <Link href="https://ynohtna92.github.io/ord-litecoin/" passHref target="_blank" className="hover:text-blue-600 text-black font-semibold py-2 px-4 rounded-xl  transition-colors duration-300 ease-in-out">
                Get Started
              </Link>
            </div>
            <div className="flex-initial">
              <Link href="https://litecoinspace.org/" passHref target="_blank" className="hover:text-blue-600 text-black font-semibold py-2 px-4 rounded-xl  transition-colors duration-300 ease-in-out">
                Explore
              </Link>
            </div>
            <div className="flex-initial">
              <Link href="https://www.lite.space/missions" passHref target="_blank" className="hover:text-blue-600 text-black font-semibold py-2 px-4 rounded-xl  transition-colors duration-300 ease-in-out">
                Donate
              </Link>
            </div>
          </div>

          {/* Right side */}
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
        </div>
        <IconButton variant="gradient" onClick={toggleMobileMenu} className="lg:hidden m-4" placeholder={undefined}>
          {/* Insert hamburger icon SVG or use an icon library */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>

        </IconButton>
      </div >
      {showMobileMenu && (
        <div className="fixed top-0 left-0 flex flex-col w-screen h-screen bg-black bg-opacity-50 backdrop-filter backdrop-blur-3xl z-50 ">
          <div className='w-full p-4 flex justify-end'>
          <IconButton variant="gradient" onClick={toggleMobileMenu} className="lg:hidden m-4 justify-end" placeholder={undefined}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </IconButton>
          </div>
          <div className="p-10 pt-20">
            {/* I want this IconButton */}

            <Link href="/" passHref onClick={toggleMobileMenu} className="flex flex-col items-center text-white font-semibold py-1 px-4 pb-16 text-2xl cursor-pointer">
              <div className='h-40 w-40'>
                <Image src="/OrdinalsLiteLogo3.jpeg" alt="OrdLite.io Logo" width={160} height={160} />
              </div>
              <span className='pl-2 text-4xl'>OrdLite.io</span>
            </Link>
            <div className="items-center w-full">
              {/* Left side yellow*/}
              <div className="flex flex-col items-center gap-4 text-4xl">
                <div className="flex-initial">
                  <Link href="/info" passHref onClick={toggleMobileMenu} className="hover:text-blue-600 text-white font-semibold py-2 px-4 rounded-xl  transition-colors duration-300 ease-in-out">
                    Info
                  </Link>
                </div>

                <div className="flex-initial">
                  <Link href="https://ynohtna92.github.io/ord-litecoin/" passHref target="_blank" className="hover:text-blue-600 text-white font-semibold py-2 px-4 rounded-xl  transition-colors duration-300 ease-in-out">
                    Get Started
                  </Link>
                </div>
                <div className="flex-initial">
                  <Link href="https://litecoinspace.org/" passHref target="_blank" className="hover:text-blue-600 text-white font-semibold py-2 px-4 rounded-xl  transition-colors duration-300 ease-in-out">
                    Explore
                  </Link>
                </div>
                <div className="flex-initial">
                  <Link href="https://www.lite.space/missions" passHref target="_blank" className="hover:text-blue-600 text-white font-semibold py-2 px-4 rounded-xl  transition-colors duration-300 ease-in-out">
                    Donate
                  </Link>
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center justify-center w-full mt-20 space-x-8">
                {/* Added ml-auto to move this item to the far right */}
                <Link href="https://discord.com/invite/z2FWv5v5uJ" target="_blank" passHref>
                  <IconButton variant="gradient" className="rounded-full bg-gradient-to-br from-white to-gray-500" placeholder={undefined}>
                    <Image
                      src="/logos/discord.svg"
                      alt="litescribe"
                      width={24}
                      height={24}
                    />
                  </IconButton>
                </Link>
                <Link href="https://x.com/ordlite" target="_blank"  passHref>
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

              </div>
            </div>
          </div>
        </div>
      )}
      <ConnectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </nav >
  );
};

export default Menu;
