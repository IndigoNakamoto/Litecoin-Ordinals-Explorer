'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@material-tailwind/react";

import ConnectModal from './ConnectModal';
import { ProfileMenu } from './ProfileMenu';
import {
  WALLET_SESSION_EVENT,
  getStoredWalletSession,
} from '../lib/walletSession';


const Menu = () => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const syncConnection = () => {
      setConnected(getStoredWalletSession().connected);
    };

    syncConnection();
    window.addEventListener('storage', syncConnection);
    window.addEventListener(WALLET_SESSION_EVENT, syncConnection);

    return () => {
      window.removeEventListener('storage', syncConnection);
      window.removeEventListener(WALLET_SESSION_EVENT, syncConnection);
    };
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleButtonClick = () => {
    setIsModalOpen(true);
  };

  return (
    <nav className='bg-gradient-to-br from-white to-gray-300 max-w-full shadow-md '>
      <div className="flex items-center py-4 mx-auto max-w-screen-2xl">
        <Link href="/" passHref className="flex items-center text-black font-semibold py-1 px-4 text-2xl cursor-pointer">
          <Image src="/OrdinalsLiteLogo3.png" alt="OrdLite logo" width={42} height={42} className="h-8 w-8" />
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
          <div className='pr-4'>
            {connected ?
              <ProfileMenu /> :
              <Button
                onClick={handleButtonClick}
                color="blue"
                size="md"
                variant="outlined"
                className="p-2 flex h-10 items-center justify-center gap-2 text-blue-600 w-full " placeholder={undefined}            >
                Connect Wallet
              </Button>
            }
          </div>
        </div>
      </div >
      <ConnectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </nav >
  );
};

export default Menu;
