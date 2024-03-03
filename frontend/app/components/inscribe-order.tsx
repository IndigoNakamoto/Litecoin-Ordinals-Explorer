// app/components/inscribe-order
import React from "react";

// @material-tailwind/react
import {
  Chip,
  Button,
  Typography,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Checkbox,
  Input,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  IconButton,
  Avatar,
} from "@material-tailwind/react";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import {
  ArrowDownTrayIcon,
  EllipsisHorizontalIcon,
  AdjustmentsVerticalIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";

interface Inscribe {
  commit: string;
  inscriptions: [{ id: string, locatoin: string }];
  parent: string;
  reveal: string;
  total_fees: number;
}

const TABLE_ROW_TRANSACTION = [
  {
    "commit": "88dc33f3b752d6829944c5b0f93edd57413eafe06645636cc91c51274ea620e6",
    "inscriptions": [
      {
        "id": "b84df77d70cab9c51685e7e2b91681c414a9ee675fe86375e51b1803c130147fi0",
        "location": "b84df77d70cab9c51685e7e2b91681c414a9ee675fe86375e51b1803c130147f:0:0",
        "content_length": 399,
        "file_name": "image.jpeg"
      }
    ],
    "parent": null,
    "reveal": "b84df77d70cab9c51685e7e2b91681c414a9ee675fe86375e51b1803c130147f",
    "total_fees": 67403
  },
  {
    "commit": "20930da8aacf7807ed169e3639a1a5caeacfc2473d9974688828a9546d8f97b8",
    "inscriptions": [
      {
        "id": "94c3cfcac9db3a097231c2ef64c884b75aad9dc88ec9e2152c9796105f34de5fi0",
        "location": "94c3cfcac9db3a097231c2ef64c884b75aad9dc88ec9e2152c9796105f34de5f:0:0"
      }
    ],
    "parent": null,
    "reveal": "94c3cfcac9db3a097231c2ef64c884b75aad9dc88ec9e2152c9796105f34de5f",
    "total_fees": 67403
  }
]

// const TABLE_ROW = [];
const TABLE_ROW = [
  {
    id: "#MS-415646",
    file_name: "profile_picture.jpeg",
    content_length: "369 KB",
    status: "pending",
  },
  {
    id: "#MS-415697",
    file_name: "profile_picture.jpeg",
    content_length: "369 KB",
    status: "completed",
  },
  {
    id: "#MS-415698",
    file_name: "profile_picture.jpeg",
    content_length: "369 KB",
    status: "completed",
  },
  {
    id: "#MS-415698",
    file_name: "profile_picture.jpeg",
    content_length: "369 KB",
    status: "completed",
  },
  {
    id: "#MS-415698",
    file_name: "profile_picture.jpeg",
    content_length: "369 KB",
    status: "completed",
  },
  {
    id: "#MS-415698",
    file_name: "profile_picture.jpeg",
    content_length: "369 KB",
    status: "completed",
  },
];

const TABLE_HEAD = [
  {
    icon: <Checkbox crossOrigin={undefined} />,
  },
  {
    head: "File Name",
  },
  {
    head: "Content Size",
  },
  {
    head: "",
  },
];

function TablesExample7() {
  return (
    <section className="">
      <Card className="h-full w-full" placeholder={undefined}>
        <CardHeader
          floated={false}
          shadow={false}
          className="rounded-none flex flex-wrap gap-4 justify-between" placeholder={undefined}        >
          <div>
            <Typography variant="h6" color="blue-gray" placeholder={undefined}>
              Your Inscription Order
            </Typography>
            <Typography
              variant="small"
              className="text-gray-600 font-normal mt-1" placeholder={undefined}            >
              These are details for your order{" "}
            </Typography>
          </div>
          <div className="flex flex-wrap items-center w-full shrink-0 gap-4 md:w-max">
          </div>
        </CardHeader>
        <CardBody className="overflow-scroll !px-0 py-0" placeholder={undefined}>
          <table className="w-full min-w-max table-auto">
            <thead>
              <tr className='pl-16'>
                {TABLE_HEAD.map(({ head, icon }) => (
                  <th
                    key={head}
                    className="border-b border-gray-300 !p-4"
                  >
                    <div className="flex gap-2 items-center">
                      {icon}
                      <Typography
                        color="blue-gray"
                        variant="small"
                        className="!font-bold" placeholder={undefined}                      >
                        {head}
                      </Typography>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TABLE_ROW.map(
                ({
                  id,
                  file_name,
                  // status,
                  content_length,
                }) => {
                  const classes = "!p-4 border-b border-gray-300";
                  return (
                    <tr key={id}>
                      <td className={classes}>
                        <Checkbox crossOrigin={undefined}/>
                      </td>
                      <td className={classes}>
                        <div className="flex items-center gap-3">
                          <Typography
                            variant="small"
                            className="font-bold"
                            color="blue-gray" placeholder={undefined}                          >
                            {file_name}
                          </Typography>
                        </div>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          className="!font-normal text-gray-600" placeholder={undefined}                        >
                          {content_length}
                        </Typography>
                      </td>
                      {/* <td className={classes}>
                        <div className="w-max">
                          <Chip
                            variant="ghost"
                            value={status}
                            color={
                              status === "completed"
                                ? "green"
                                : status === "pending"
                                  ? "amber"
                                  : "red"
                            }
                          />
                        </div>
                      </td> */}
                      <td className="border-b border-gray-300 text-right pr-6">
                        <Menu placement="left-start">
                          <MenuHandler>
                            <IconButton variant="text" placeholder={undefined}>
                              <EllipsisHorizontalIcon className="w-8 h-8 text-gray-600" />
                            </IconButton>
                          </MenuHandler>
                          <MenuList placeholder={undefined}>
                            <MenuItem placeholder={undefined}>Edit</MenuItem>
                            <MenuItem placeholder={undefined}>Delete</MenuItem>
                          </MenuList>
                        </Menu>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </section>
  );
}

export default TablesExample7;