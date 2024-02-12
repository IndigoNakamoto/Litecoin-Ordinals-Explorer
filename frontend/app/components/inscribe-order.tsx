// // app/components/inscribe-order
// import React from "react";



// // @material-tailwind/react
// import {
//   Chip,
//   Button,
//   Typography,
//   Card,
//   CardHeader,
//   CardBody,
//   CardFooter,
//   Checkbox,
//   Input,
//   Menu,
//   MenuHandler,
//   MenuList,
//   MenuItem,
//   IconButton,
//   Avatar,
// } from "@material-tailwind/react";

// import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
// import {
//   ArrowDownTrayIcon,
//   EllipsisHorizontalIcon,
//   AdjustmentsVerticalIcon,
//   MagnifyingGlassIcon,
// } from "@heroicons/react/24/solid";

// interface FileDetails {
//   name: string;
//   size: number;
// }


// const TABLE_HEAD = [
//   {
//     head: "File Name",
//   },
//   {
//     head: "Content Size",
//   },
//   {
//     head: "Content Fee",
//   },
//   {
//     head: "Postage",
//   },
//   {
//     head: "Service Fee",
//   },
//   {
//     head: "Total",
//   },
//   {
//     head: "",
//   },
// ];

// function InscribeOrder() {

  
//   const FEE_PER_BYTE = 1;
//   const POSTAGE = 10000;
//   const SERVICE_USD_FEE = 0.5; // USD
//   const LTCUSD = 80;
//   const SERVICE_FEE = (SERVICE_USD_FEE/LTCUSD).toFixed(5) * 100000000;

//   const files = JSON.parse(localStorage.getItem('files') ?? '[]');

//   const files: { index: number, file_name: string, content_length: number, content_fee: number, service_fee: number, total: number, postage: number }[] | undefined = context?.files.map((file: FileDetails, index: number) => {
//     return {
//       index: index,
//       file_name: file.name,
//       content_length: file.size,
//       content_fee: Math.ceil(file.size / 4 * FEE_PER_BYTE),
//       postage: POSTAGE,
//       service_fee: SERVICE_FEE,
//       total: Math.ceil(file.size / 4 * FEE_PER_BYTE) + POSTAGE + SERVICE_FEE
//     }
//   })

//   localStorage.setItem('files', JSON.stringify(files));

//   // Function to handle delete action
//   const handleDelete = (index: number) => {
//     const updatedFiles = context?.files.filter((file: FileDetails, i: number) => i !== index);
//     if (setFiles) {
//       setFiles(updatedFiles ?? []);
//     }
//   };

//   return (
//     <section className="">

//       <Card className="h-full w-full" placeholder={undefined}>
//         <CardHeader
//           floated={false}
//           shadow={false}
//           className="rounded-none flex flex-wrap gap-4 justify-between" placeholder={undefined}        >
//           <div>
//             <Typography variant="h6" color="blue-gray" placeholder={undefined}>
//               Your Inscription Order
//             </Typography>
//             <Typography
//               variant="small"
//               className="text-gray-600 font-normal mt-1" placeholder={undefined}            >
//               These are details for your order{" "}
//             </Typography>
//           </div>
//           <div className="flex flex-wrap items-center w-full shrink-0 gap-4 md:w-max">
//           </div>
//         </CardHeader>
//         <CardBody className="overflow-scroll !px-0 py-0" placeholder={undefined}>
//           <table className="w-full min-w-max table-auto">
//             <thead>
//               <tr className='pl-16'>
//                 {TABLE_HEAD.map(({ head }) => (
//                   <th
//                     key={head}
//                     className="border-b border-gray-300 !p-4"
//                   >
//                     <div className="flex gap-2 items-center">
//                       <Typography
//                         color="blue-gray"
//                         variant="small"
//                         className="!font-bold" placeholder={undefined}                      >
//                         {head}
//                       </Typography>
//                     </div>
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {files?.map(
//                 ({
//                   index,
//                   file_name,
//                   content_length,
//                   content_fee,
//                   service_fee,
//                   total,
//                   postage
//                 }) => {
//                   const classes = "!p-4 border-b border-gray-300";
//                   const truncatedFileName = file_name.length > 20 ? `...${file_name.slice(-15)}` : file_name;
//                   return (
//                     <tr key={index}>
//                       <td className={classes}>
//                         <div className="flex items-center gap-3">
//                           <Typography
//                             variant="small"
//                             className="font-bold"
//                             color="blue-gray" placeholder={undefined}                          >
//                             {truncatedFileName}
//                           </Typography>
//                         </div>
//                       </td>
//                       <td className={classes}>
//                         <Typography
//                           variant="small"
//                           className="!font-normal text-gray-600" placeholder={undefined}                        >
//                           {Math.ceil(content_length/1000)} KB
//                         </Typography>
//                       </td>
//                       <td className={classes}>
//                         <Typography
//                           variant="small"
//                           className="!font-normal text-gray-600" placeholder={undefined}                        >
//                           {content_fee} lits
//                         </Typography>
//                       </td>
//                       <td className={classes}>
//                         <Typography
//                           variant="small"
//                           className="!font-normal text-gray-600" placeholder={undefined}                        >
//                           {postage} lits
//                         </Typography>
//                       </td>
//                       <td className={classes}>
//                         <Typography
//                           variant="small"
//                           className="!font-normal text-gray-600" placeholder={undefined}                        >
//                           {service_fee} lits
//                         </Typography>
//                       </td>
//                       <td className={classes}>
//                         <Typography
//                           variant="small"
//                           className="!font-normal text-gray-600" placeholder={undefined}                        >
//                           {total} lits
//                         </Typography>
//                       </td>
//                       <td className="border-b border-gray-300 text-right pr-6">
//                         <Menu placement="left-start">
//                           <MenuHandler>
//                             <IconButton variant="text" placeholder={undefined}>
//                               <EllipsisHorizontalIcon className="w-8 h-8 text-gray-600" />
//                             </IconButton>
//                           </MenuHandler>
//                           <MenuList placeholder={undefined}>
//                             {/* TODO: METADATA <MenuItem placeholder={undefined}>Edit</MenuItem> */}
//                             <MenuItem placeholder={undefined} onClick={() => handleDelete(index)}>Delete</MenuItem>
//                           </MenuList>
//                         </Menu>
//                       </td>
//                     </tr>
//                   );
//                 }
//               )}
//             </tbody>
//           </table>
//         </CardBody>
//       </Card>
//     </section>
//   );
// }

// export default InscribeOrder;