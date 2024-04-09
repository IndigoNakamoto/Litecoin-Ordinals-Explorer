import Link from "next/link";

const currentYear = new Date().getFullYear();


export function Footer() {
  return (
    <div className="flex items-center mx-auto min-w-full bg-black">
      <footer className=" text-gray-700 w-full mx-auto max-w-screen-2xl p-4">
        <div className=" flex justify-between">

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