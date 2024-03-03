// app/components/inscribe-table
import React from "react";
import { useState } from 'react';

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


const TABLE_ROW = [
  {
    inscription_id: "b84df77d70cab9c51685e7e2b91681c414a9ee675fe86375e51b1803c130147fi0",
    inscription_number: '',
    file_name: 'profile_picture.jpeg',
    content_length: "369",
    inscription_fee: "1149",
    inscription_postage: '10000',

    status: "pending",
  },
];

const TABLE_HEAD = [
  {
    head: "Inscription ID",
  },
  {
    head: "Transaction",
  },
  {
    head: "Amount",
  },
  {
    head: "Date",
  },
  {
    head: "Account",
  },
  {
    head: "Status",
  },
  {
    head: "",
  },
];

function truncateText(text: string): string {
  if (text.length <= 8) {
    return text; // No need to truncate if the text is already shorter than 8 characters
  }

  const firstFour = text.substring(0, 4);
  const lastFour = text.substring(text.length - 4);

  return `${firstFour}...${lastFour}`;
}

function copyTextToClipboard(text: string): void {
  const textField = document.createElement('textarea');
  textField.innerText = text;
  document.body.appendChild(textField);
  textField.select();
  document.execCommand('copy');
  textField.remove();
}

function TablesExample7() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function handleCopy(text: string): void {
    copyTextToClipboard(text);
    setCopiedId(text);
    setTimeout(() => {
      setCopiedId(null);
    }, 1500);
  }

  return (
    <section className="my-10">
      <Card className="h-full w-full" placeholder={undefined}>
        <CardHeader
          placeholder={undefined}
          floated={false}
          shadow={false}
          className="rounded-none flex flex-wrap gap-4 justify-between p-3"
        >
          <div>
            <Typography variant="h6" color="blue-gray">
              Inscription History
            </Typography>
            <Typography
              variant="small"
              className="text-gray-600 font-normal mt-1"
            >
              These are details for your inscriptions{" "}
            </Typography>
          </div>
          <div className="flex flex-wrap items-center w-full shrink-0 gap-4 md:w-max">
          </div>
        </CardHeader>
        <CardBody className="overflow-scroll !px-0 py-0">
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
                        className="!font-bold"
                      >
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
                  inscription_id,
                  logo,
                  title,
                  date,
                  status,
                  expiry,
                  account,
                  accountNumber,
                  amount,
                }) => {
                  const classes = "!p-4 border-b border-gray-300";
                  const truncatedInscriptionId = truncateText(inscription_id);
                  return (
                    <tr key={inscription_id}>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-bold truncate hover:text-blue-500"
                          onClick={() => handleCopy(inscription_id)}
                          style={{ cursor: 'pointer' }}
                        >
                          {truncatedInscriptionId}
                        </Typography>
                        {copiedId === inscription_id && (
                          <Typography variant="small" color="blue">
                            Copied!
                          </Typography>
                        )}
                      </td>
                      <td className={classes}>
                        <div className="flex items-center gap-3">
                          <img className="w-6 h-6" src={logo} alt="" />
                          <Typography
                            variant="small"
                            className="font-bold"
                            color="blue-gray"
                          >
                            {title}
                          </Typography>
                        </div>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          className="!font-normal text-gray-600"
                        >
                          {amount}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          className="!font-normal text-gray-600"
                        >
                          {date}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-12 rounded-md border border-gray-300 p-1">
                            <Avatar
                              src={
                                account === "visa"
                                  ? "https://demos.creative-tim.com/test/corporate-ui-dashboard/assets/img/logos/visa.png"
                                  : "https://demos.creative-tim.com/test/corporate-ui-dashboard/assets/img/logos/mastercard.png"
                              }
                              size="sm"
                              alt={account}
                              variant="square"
                              className="h-full w-full object-contain p-1"
                            />
                          </div>
                          <div className="flex flex-col">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-medium capitalize"
                            >
                              {account.split("-").join(" ")} {accountNumber}
                            </Typography>
                            <Typography
                              variant="small"
                              className="font-normal text-gray-600"
                            >
                              {expiry}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td className={classes}>
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
                      </td>
                      <td className="border-b border-gray-300 text-right pr-6">
                        <Menu placement="left-start">
                          <MenuHandler>
                            <IconButton variant="text">
                              <EllipsisHorizontalIcon className="w-8 h-8 text-gray-600" />
                            </IconButton>
                          </MenuHandler>
                          <MenuList>
                            <MenuItem>Edit</MenuItem>
                            <MenuItem>Update</MenuItem>
                            <MenuItem>Delete</MenuItem>
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