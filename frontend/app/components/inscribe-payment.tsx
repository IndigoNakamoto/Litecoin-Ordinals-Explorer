import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Avatar,
  Typography,
  Button,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  IconButton,
  Switch,
} from "@material-tailwind/react";
import {
  BriefcaseIcon,
  Cog6ToothIcon,
  EllipsisVerticalIcon,
  RectangleGroupIcon,
  ShoppingBagIcon,
  SpeakerWaveIcon,
} from "@heroicons/react/24/solid";

interface WidgetsCardPropsType {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  imgs: string[];
}

function WidgetsCard({ icon, title, subtitle, imgs}: WidgetsCardPropsType) {
  return (
    <Card className="border !border-blue-gray-100 px-2 justify-center p-6" shadow={false} placeholder={undefined}>
      <CardHeader
        floated={false}
        shadow={false}
        className="flex !justify-between !items-center rounded-none mt-0" placeholder={undefined}      >
        <div className="flex gap-4">
          <div className="!grid h-12 w-12 rounded-lg place-items-center border !border-blue-gray-100">
            {icon}
          </div>
          <div>
            <Typography
              color="blue-gray"
              className="!font-bold text-lg" placeholder={undefined}            >
              {title}
            </Typography>
            <Typography
              variant="small"
              className="!font-normal text-gray-600" placeholder={undefined}            >
              {subtitle}
            </Typography>
          </div>
        </div>
        <div className="flex items-center pr-4">
          {imgs.map((img, key) => (
            <div key={key} className="-mr-4">
              <Avatar
                src={img}
                className="rounded-full h-12 w-12 border-2 hover:z-10 focus:z-10 !border-white"
                alt="avatar" placeholder={undefined}              />
            </div>
          ))}
        </div>
      </CardHeader>
    </Card>
  );
}

const widgets = [
  {
    icon: <SpeakerWaveIcon className="w-6 h-6 text-gray-900" />,
    title: "Cyber Week",
    subtitle: "Campaign Dev",
    imgs: [
      "https://www.material-tailwind.com/img/avatar6.jpg",
      "https://www.material-tailwind.com/img/avatar1.jpg",
      "https://www.material-tailwind.com/img/avatar2.jpg",
    ],
  },
  {
    icon: <ShoppingBagIcon className="w-6 h-6 text-gray-900" />,
    title: "Black Friday",
    subtitle: "Campaign Dev",
    imgs: [
      "https://www.material-tailwind.com/img/avatar4.jpg",
      "https://www.material-tailwind.com/img/avatar5.jpg",
      "https://www.material-tailwind.com/img/avatar6.jpg",
    ],
  },
  {
    icon: <RectangleGroupIcon className="w-6 h-6 text-gray-900" />,
    title: "New Template",
    subtitle: "Campaign Dev",
    imgs: [
      "https://www.material-tailwind.com/img/avatar3.jpg",
      "https://www.material-tailwind.com/img/avatar4.jpg",
      "https://www.material-tailwind.com/img/avatar5.jpg",
    ],
  },
];

function WidgetsExample5() {
  return (
    <section className="px-8 lg:px-16 py-20">
      <div className="">
        <Card
          className="border !border-blue-gray-100 p-2"
          shadow={false} placeholder={undefined}        >
          <CardHeader
            floated={false}
            shadow={false}
            className="flex !justify-between !items-center rounded-none" placeholder={undefined}          >
            <div className="flex gap-4">
              <div className="!grid h-12 w-12 rounded-lg place-items-center border !border-blue-gray-100">
                <BriefcaseIcon className="h-6 w-6 text-gray-900" />
              </div>
              <div>
                <Typography
                  variant="h6"
                  color="blue-gray"
                  className="!font-medium" placeholder={undefined}                >
                  User Information
                </Typography>
                <Typography
                  variant="small"
                  className="!font-normal text-gray-600" placeholder={undefined}                >
                  Last Campaign Performance
                </Typography>
              </div>
            </div>
            <Menu placement="bottom-end">
              <MenuHandler>
                <IconButton variant="text" placeholder={undefined}>
                  <EllipsisVerticalIcon className="text-gray-500 w-8 h-8" />
                </IconButton>
              </MenuHandler>
              <MenuList placeholder={undefined}>
                <MenuItem placeholder={undefined}>Item 1</MenuItem>
                <MenuItem placeholder={undefined}>Item 2</MenuItem>
                <MenuItem placeholder={undefined}>Item 3</MenuItem>
              </MenuList>
            </Menu>
          </CardHeader>
          <CardBody className="pl-4 grid gap-4" placeholder={undefined}>
            <div className="grid grid-cols-2">
              <Typography className="font-normal text-gray-600" placeholder={undefined}>
                Company Name
              </Typography>
              <Typography
                variant="h6"
                color="blue-gray"
                className="font-medium" placeholder={undefined}              >
                GreatVibes Inc.
              </Typography>
            </div>
            <div className="grid grid-cols-2">
              <Typography className="font-normal text-gray-600" placeholder={undefined}>
                Primary Contact
              </Typography>
              <Typography
                variant="h6"
                color="blue-gray"
                className="font-medium" placeholder={undefined}              >
                Emma Roberts, CEO
              </Typography>
            </div>
            <div className="grid grid-cols-2">
              <Typography className="font-normal text-gray-600" placeholder={undefined}>
                Industry
              </Typography>
              <Typography
                variant="h6"
                color="blue-gray"
                className="font-medium" placeholder={undefined}              >
                Software and IT Services
              </Typography>
            </div>
            <div className="grid grid-cols-2">
              <Typography className="font-normal text-gray-600" placeholder={undefined}>
                Customer Since
              </Typography>
              <Typography
                variant="h6"
                color="blue-gray"
                className="font-medium" placeholder={undefined}              >
                January 2018
              </Typography>
            </div>
            <div className="grid grid-cols-2">
              <Typography className="font-normal text-gray-600" placeholder={undefined}>
                Latest Project
              </Typography>
              <Typography
                variant="h6"
                color="blue-gray"
                className="font-medium" placeholder={undefined}              >
                Resource Planning
              </Typography>
            </div>
            <div className="grid grid-cols-2">
              <Typography className="font-normal text-gray-600" placeholder={undefined}>
                Industry
              </Typography>
              <Typography
                variant="h6"
                color="blue-gray"
                className="font-medium" placeholder={undefined}              >
                Software and IT Services
              </Typography>
            </div>
          </CardBody>
        </Card>

      </div>
    </section>
  );
}

export default WidgetsExample5;