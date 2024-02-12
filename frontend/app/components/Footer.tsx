import { Typography, IconButton } from "@material-tailwind/react";
const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="px-4 py-4">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
          <Typography className="!text-sm font-medium text-gray-500 lg:text-left text-center" placeholder={undefined}>
            All rights reserved. Copyright &copy; {currentYear} OrdLite.io.
          </Typography>
          <div className="flex lg:ml-auto place-content-center gap-2">
            <a href="#buttons-with-link">
              <IconButton variant="text" size="sm" placeholder={undefined}>
                <i className="fa-brands fa-twitter text-lg text-gray-500 transition-colors hover:text-blue-gray-900" />
              </IconButton>
            </a>
            <a href="#buttons-with-link">
              <IconButton variant="text" size="sm" placeholder={undefined}>
                <i className="fa-brands fa-youtube text-lg text-gray-500 transition-colors hover:text-blue-gray-900" />
              </IconButton>
            </a>
            <a href="#buttons-with-link">
              <IconButton variant="text" size="sm" placeholder={undefined}>
                <i className="fa-brands fa-instagram text-lg text-gray-500 transition-colors hover:text-blue-gray-900" />
              </IconButton>
            </a>
            <a href="#buttons-with-link">
              <IconButton variant="text" size="sm" placeholder={undefined}>
                <i className="fa-brands fa-github text-lg text-gray-500 transition-colors hover:text-blue-gray-900" />
              </IconButton>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer;