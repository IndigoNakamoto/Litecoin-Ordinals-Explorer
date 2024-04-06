import Link from "next/link";

const currentYear = new Date().getFullYear();


export function Footer() {
  return (
    <footer className="bg-black text-gray-500 max-w-full">
      <div className="container flex justify-between mx-auto">
        {/* left side */}
        <div className="mx-4 gap-4 flex">
          <h1>
            All rights reserved. Copyright &copy; {currentYear} OrdLite.io.
          </h1>
        </div>

        {/* right side */}
        <div className="mx-4 gap-4 flex">
          <Link className="m-1" href="/terms">
            Terms
          </Link>
          <Link className="m-1" href="/privacy">
            Privacy
          </Link>
          {/* <Link className="m-1" href="/donate">
            Donate
          </Link> */}
        </div>
      </div>
    </footer>
  );
}
export default Footer;