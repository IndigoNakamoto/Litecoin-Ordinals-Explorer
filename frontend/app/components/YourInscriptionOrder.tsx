// app/components/inscribe-order
import React from "react";
import { InscribeOrderContext } from "./contexts/InscribeOrderContext";
import { createContext, useContext, useState } from 'react';

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

interface FileDetails {
  name: string;
  size: number;
}

interface Inscribe {
  commit: string;
  inscriptions: [{ id: string, locatoin: string }];
  parent: string;
  reveal: string;
  total_fees: number;
}

const TABLE_HEAD = [
  {
    head: "File Name",
  },
  {
    head: "Content Size",
  },
  {
    head: "Content Fee",
  },
  {
    head: "Postage",
  },
  {
    head: "Service Fee",
  },
  {
    head: "Total",
  },
  {
    head: "",
  },
];



function InscribeOrder() {
  const context = useContext(InscribeOrderContext);
  const [ltcusd, setLtcusd] = useState(0);
  ;

  const FEE_PER_BYTE = 1;
  const POSTAGE = 10000;
  const SERVICE_USD_FEE = 0.5; // USD
  const LTCUSD = context?.ltcUSD || 100;
  const SERVICE_FEE = Math.floor(Number((SERVICE_USD_FEE / LTCUSD * 100000000)))

  const files: { index: number, file_name: string, content_length: number, content_fee: number, service_fee: number, total: number, postage: number }[] | undefined = context?.files.map((file: FileDetails, index: number) => {
    return {
      index: index,
      file_name: file.name,
      content_length: file.size,
      content_fee: Math.ceil(file.size / 4 * FEE_PER_BYTE),
      postage: POSTAGE,
      service_fee: SERVICE_FEE,
      total: Math.ceil(file.size / 4 * FEE_PER_BYTE) + POSTAGE + SERVICE_FEE
    }
  })

  const setFiles = context?.setFiles;

  // Function to handle delete action
  const handleDelete = (index: number) => {
    const updatedFiles = context?.files.filter((file: FileDetails, i: number) => i !== index);
    if (setFiles) {
      setFiles(updatedFiles ?? []);
    }
  };

  /* 
  handleFileEdit
  Will open a dialog
  import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";


  we want to add two new properties to each file: MetaTitle and MetaDescription. 


  MetaTitle should be limited to 70 characters
  import { Input } from "@material-tailwind/react";
  <Input variant="outlined" label="Outlined" placeholder="Outlined"/>

  MetaDescription should be limited to 300 characters
  import { Textarea } from "@material-tailwind/react";
  <Textarea variant="outlined" label="Outlined" />
  
  */

  return (
    <section className="">

      <Card className="h-full w-full" placeholder={undefined}>
        <CardHeader floated={false} shadow={false} className="rounded-none" placeholder={undefined}>
          <div className="mb-4 flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div className="pb-2">
              <Typography variant="h5" color="blue-gray" placeholder={undefined}>
                Your Inscription Order
              </Typography>
              <Typography
                variant="small"
                className=" font-normal mt-1" placeholder={undefined}            >
                These are details for your order. You can remove files by clicking the ellipsis icon.
              </Typography>
            </div>
            <div className="flex flex-wrap items-center w-full shrink-0 gap-4 md:w-max">
            </div>
          </div>
        </CardHeader>
        <CardBody className="overflow-scroll !px-0 py-0" placeholder={undefined}>
          <table className="w-full min-w-max table-auto text-left">
            <thead>
              <tr>
                {TABLE_HEAD.map(({ head }) => (
                  <th
                    key={head}
                    className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                  >
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal leading-none opacity-70" placeholder={undefined}                  >
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {files?.map(
                ({
                  index,
                  file_name,
                  content_length,
                  content_fee,
                  service_fee,
                  total,
                  postage
                }) => {
                  const isLast = index === files.length - 1;
                  const classes = isLast 
                    ? "!p-4 border-b border-gray-300"
                    : "p-4 border-b border-blue-gray-50";
                  const truncatedFileName = file_name.length > 20 ? `...${file_name.slice(-15)}` : file_name;
                  return (
                    <tr key={index}>
                      <td className={classes}>
                        <div className="flex items-center gap-3">
                          <Typography
                            variant="small"
                            className="font-bold"
                            color="blue-gray" placeholder={undefined}                          >
                            {truncatedFileName}
                          </Typography>
                        </div>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          className="!font-normal " placeholder={undefined} color="blue-gray"                      >
                          {Math.ceil(content_length / 1000)} KB
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          className="!font-normal " placeholder={undefined} color="blue-gray"                    >
                          {content_fee} lits
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          className="!font-normal " placeholder={undefined} color="blue-gray"                     >
                          {postage} lits
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          className="!font-normal " placeholder={undefined} color="blue-gray"                   >
                          {service_fee} lits
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          className="!font-normal " placeholder={undefined} color="blue-gray"                   >
                          {total} lits
                        </Typography>
                      </td>
                      <td className="border-b border-gray-300 text-right pr-6">
                        <Menu placement="left-start">
                          <MenuHandler>
                            <IconButton variant="text" placeholder={undefined}>
                              <EllipsisHorizontalIcon className="w-8 h-8 text-gray-600" />
                            </IconButton>
                          </MenuHandler>
                          <MenuList placeholder={undefined}>
                            {/* TODO: METADATA <MenuItem placeholder={undefined}>Edit</MenuItem> */}
                            <MenuItem placeholder={undefined} onClick={() => handleDelete(index)}>Delete</MenuItem>
                            {/* TODO: handleFileEdit */}
                            {/* <MenuItem placeholder={undefined}>Edit</MenuItem> */}
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

export default InscribeOrder;