import React from 'react';
import Link from 'next/link';
import Image from "next/legacy/image";

// Example useAuth hook. Replace this with your actual authentication hook/context
const useAuth = () => {
  // This should return an object or state indicating if the user is signed in
  // For demonstration purposes, it returns false (not signed in)
  return { isAuthenticated: true };
};

// TODO: Modify to optionally take in a prop boolean value
const StickyFooter = () => {
  const { isAuthenticated } = useAuth();

  // If the user is authenticated, return null to hide the StickyFooter
  if (isAuthenticated) return null;

  return (
    <div className='fixed bottom-0 left-0 right-0 bg-black bg-opacity-80 backdrop-blur-md shadow-md'>
      <div className="flex justify-between items-center py-4 mx-auto max-w-screen-2xl px-4">
        <Link href="/" passHref className="flex items-center text-white font-regular text-md lg:text-xl ">
          Discover and Inscribe the Litecoin Blockchain with OrdLite.io
        </Link>
        <div className='flex flex-nowrap'> {/* This div contains the buttons and prevents wrapping */}
          <Link href="/login" passHref>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-1 px-2.5 rounded-3xl">
              Login
            </button>
          </Link>
          <Link href="/signup" passHref>
            <button className="ml-2 bg-white hover:bg-slate-200 text-black font-medium py-1 px-2.5 rounded-3xl min-w-[90px]">
              Sign Up
            </button>

          </Link>
        </div>
      </div>
    </div>
  );
};

export default StickyFooter;
