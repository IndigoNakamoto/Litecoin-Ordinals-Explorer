'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from "@material-tailwind/react";

import ConnectModal from './ConnectModal';
import {
  WALLET_SESSION_EVENT,
  getStoredWalletSession,
} from '../lib/walletSession';

const StickyFooter = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const syncConnection = () => {
      setIsConnected(getStoredWalletSession().connected);
    };

    syncConnection();
    window.addEventListener('storage', syncConnection);
    window.addEventListener(WALLET_SESSION_EVENT, syncConnection);

    return () => {
      window.removeEventListener('storage', syncConnection);
      window.removeEventListener(WALLET_SESSION_EVENT, syncConnection);
    };
  }, []);

  if (isConnected) return null;

  return (
    <>
      <div className='fixed bottom-0 left-0 right-0 bg-black bg-opacity-80 backdrop-blur-md shadow-md'>
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-md font-regular text-white lg:text-xl">
              Connect a wallet to inscribe files and manage your Litecoin items.
            </p>
          </div>
          <div className='flex flex-nowrap items-center gap-2'>
            <Link href="/inscribe" passHref>
              <button className="min-w-[90px] rounded-3xl bg-white px-2.5 py-1 font-medium text-black transition-colors duration-300 ease-in-out hover:bg-gray-300">
                Inscribe
              </button>
            </Link>
            <Button
              onClick={() => setIsModalOpen(true)}
              color="blue"
              size="sm"
              className="rounded-3xl px-3 py-2"
              placeholder={undefined}
            >
              Connect Wallet
            </Button>
          </div>
        </div>
      </div>
      <ConnectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default StickyFooter;
