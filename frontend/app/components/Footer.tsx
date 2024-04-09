import Link from "next/link";

const currentYear = new Date().getFullYear();


export function Footer() {
  return (
    <div className="flex items-center px-8 mx-auto min-w-full ">
      <footer className="bg-black text-gray-700 max-w-screen-lg min-w-full">
        <div className=" flex justify-between h-10">

          {/* Left side */}
          <h1 className='text-xs text-gray-700 '>
            All rights reserved. Copyright &copy; {currentYear} OrdLite.io.
          </h1>
          {/* Justify between */}

          {/* Right side */}
          <div className="text-xs">
            <Link className="ml-8" href="/terms">
              Terms
            </Link>
            <Link className="ml-8" href="/privacy">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default Footer;