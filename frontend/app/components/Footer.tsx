import Link from "next/link";

const currentYear = new Date().getFullYear();


export function Footer() {
  return (
    <div className='h-10'>
      <footer className="bg-black text-gray-700 mx-auto max-w-screen-2xl flex pt-5">
        <div className="container flex justify-between h-10">

          {/* Left side */}
          <h1 className='text-xs text-gray-700 '>
            All rights reserved. Copyright &copy; {currentYear} OrdLite.io.
          </h1>
          {/* Justify between */}

          {/* Right side */}
          <div className="text-xs">
            <Link className="m-5" href="/terms">
              Terms
            </Link>
            <Link className="m-5" href="/privacy">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default Footer;