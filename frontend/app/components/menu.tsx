import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import Next.js Image component for optimized images

const Menu = () => {
  return (
    <div className='bg-white max-w-full shadow-md '>
      <div className="flex items-center py-4 mx-auto max-w-screen-2xl">
        {/* Logo and OrdLite.io text */}
        <Link href="/" passHref  className="flex items-center text-black font-semibold py-2 px-4 text-2xl cursor-pointer">

            {/* SVG logo next to the text */}
            <Image src="/OrdinalsLiteLogo3.png" alt="OrdLite logo" width={32} height={32} className="h-8 mr-2"/>
            OrdLite.io

        </Link>

        {/* Centering container for the search bar */}
        {/* Uncomment and use if search functionality is implemented
        <div className="flex-grow flex justify-center mx-4">
          <input
            type="search"
            placeholder="Search..."
            className="w-96 px-4 py-2 border border-gray-600 rounded-md bg-gray-700 text-black"
          />
        </div>
        */}

        {/* Button on the right */}
        <div className="flex-initial">
          <Link href="/inscriptions" passHref className="hover:bg-blue-500 text-black hover:text-white font-semibold py-2 px-4 rounded-xl">

              Inscriptions

          </Link>
        </div>
        <div className="flex-initial">
          <Link href="/Inscribe" passHref className="hover:bg-blue-500 text-black hover:text-white font-semibold py-2 px-4 rounded-xl">

              Inscribe

          </Link>
        </div>
      </div>
    </div>
  );
};

export default Menu;
