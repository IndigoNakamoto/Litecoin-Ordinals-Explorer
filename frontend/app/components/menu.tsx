import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import Next.js Image component for optimized images

const Menu = () => {
  return (
    <div className='bg-gradient-to-br from-white to-gray-300 max-w-full shadow-md '>
      <div className="flex items-center py-4 mx-auto max-w-screen-2xl">
        {/* Logo and OrdLite.io text */}
        <Link href="/" passHref className="flex items-center text-black font-semibold py-2 px-4 text-2xl cursor-pointer">
          {/* SVG logo next to the text */}
          <Image src="/OrdinalsLiteLogo3.png" alt="OrdLite logo" width={32} height={32} className="h-8 mr-2" />
          OrdLite.io
        </Link>
        <div className="flex-initial">
          <Link href="/stats" passHref className="hover:text-blue-600 text-black font-semibold py-2 px-4 rounded-xl">
            Stats
          </Link>
        </div>
        <div className="flex-initial">
          {/* <Link href="/inscribe" passHref className="hover:text-blue-600 text-black font-semibold py-2 px-4 rounded-xl">
            Inscribe
          </Link> */}
        </div>
      </div>
    </div>
  );
};

export default Menu;
