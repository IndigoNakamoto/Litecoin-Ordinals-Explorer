import React, { useEffect, useState } from 'react';
import InvoiceModal from './InvoiceModal';

import {
  Card,
  CardHeader,
  Typography,
  Button,
  CardBody,
  Chip,
  CardFooter,
  Avatar,
  IconButton,
  Tooltip,
} from "@material-tailwind/react";

const TABLE_HEAD = ["Invoice ID", "Amount", "Date", "Payment Status", "Inscribe Status", ""];

// Define the structure of your transaction data for TypeScript
interface Transaction {
  id: string;
  amount: string;
  status: string;
  expirationTime: number;
  createdTime: number;
  currency: string;
  metadata: {
    status: string;
    files: {
      fileName: string;
      fileSize: number;
      contentFee: number;
      serviceFee: number;
    }[];
    account_id: string;
    receivingAddress: string;
  };
}



export default function TransactionsTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null); // State to hold the selected transactio
  const [username, setUsername] = useState<string | null>(null);



  // Encapsulate the data fetching logic into a function
  const fetchTransactions = async () => {
    if (window.litescribe) {
      // const requestedAccounts = await window.litescribe.requestAccounts();
      const username = localStorage.getItem('username')
      setUsername(username);
      if (username === null) {
        return
      } else {
        fetch(`http://localhost:3005/api/invoice/account/${username}`)
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            if (Array.isArray(data)) {
              setTransactions(data);
            } else {
              console.error('Data received from API is not an array:', data);
            }
          })
          .catch(error => console.error('Error fetching transactions:', error));

      }
    }
  };

  // Call fetchTransactions on component mount
  useEffect(() => {
    fetchTransactions();
    setIsModalOpen(false);
  }, [username]);

  // Function to handle modal open and set the selected transaction
  const handleOpenModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  return (
    <Card className="h-full w-2xl" placeholder={undefined}>
      {isModalOpen && selectedTransaction && (
        <InvoiceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} invoiceId={selectedTransaction.id} />
      )}
      <div className='flex justify-between'>
        <CardHeader floated={false} shadow={false} className="rounded-none" placeholder={undefined}>
          <div className="mb-4 flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div>

              <Typography variant="h5" color="blue-gray" placeholder={undefined}>
                Recent Transactions
              </Typography>

              <Typography color="gray" className="mt-1 font-normal" placeholder={undefined}>
                These are details about the last transactions
              </Typography>
            </div>
          </div>

        </CardHeader>

        <Button onClick={fetchTransactions} color="black" className='p-2 m-6' size='md' variant="outlined" placeholder={undefined}>
          Refresh
        </Button>
      </div>
      <CardBody className="overflow-scroll px-0" placeholder={undefined}>
        <table className="w-full min-w-max table-auto text-left">
          <thead>
            <tr>
              {TABLE_HEAD.map((head) => (
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
            {transactions.map((transaction, index) => {
              const isLast = index === transactions.length - 1;
              const classes = isLast
                ? "p-4"
                : "p-4 border-b border-blue-gray-50";
              const date = new Date(transaction.createdTime * 1000).toLocaleString();

              return (
                <tr key={transaction.id}>
                  <td className={classes}>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-bold" placeholder={undefined}                    >
                      {transaction.id}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal" placeholder={undefined}                    >
                      {transaction.amount} {transaction.currency}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal" placeholder={undefined}                    >
                      {date}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Chip
                      size="sm"
                      variant="ghost"
                      value={transaction.status}
                      color={
                        transaction.status === "New"
                          ? "green"
                          : transaction.status === "Processing"
                            ? "yellow"
                            : transaction.status === "Settled"
                              ? "green"
                              : "red"
                      }
                    />
                  </td>
                  <td className={classes}>
                    <Chip
                      size="sm"
                      variant="ghost"
                      value={transaction.metadata.status}
                      color={
                        transaction.metadata.status === "Pending"
                          ? "amber"
                          : transaction.metadata.status === "Processing"
                            ? "yellow"
                            : transaction.metadata.status === "Inscribed"
                              ? "green"
                              : "red"
                      }
                    />
                  </td>
                  <td className={classes}>
                    <Tooltip content="View Invoice">
                      {/* Open Invoice Modal on click */}
                      <IconButton variant="text" onClick={() => handleOpenModal(transaction)} placeholder={undefined}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>

                      </IconButton>
                    </Tooltip>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}
