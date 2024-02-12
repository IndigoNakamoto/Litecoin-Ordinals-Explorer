# OrdLite.io Frontend

This is the Next.js frontend application for OrdLite.io, a platform for interacting with Litecoin inscriptions.

## Prerequisites

Before running the frontend, ensure that:
1.  The [OrdLite.io Backend](../backend/README.md) is set up and running.
2.  You have Node.js (LTS version recommended) and npm/yarn/pnpm/bun installed.

## Environment Configuration

1.  Navigate to the `frontend/` directory.
2.  Copy the `.env.example` file to a new file named `.env.local`:
    ```bash
    cp .env.example .env.local
    ```
3.  Open `.env.local` and update the `NEXT_PUBLIC_API_URL` to point to your running backend instance. For example:
    ```env
    NEXT_PUBLIC_API_URL="http://localhost:3001/api"
    ```
4.  Add any other necessary environment variables as described in `.env.example`.

## Getting Started

To run the development server:

1.  Ensure you are in the `frontend/` directory.
2.  Install dependencies:
    ```bash
    npm install
    # or
    # yarn install
    # or
    # pnpm install
    # or
    # bun install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    # or
    # yarn dev
    # or
    # pnpm dev
    # or
    # bun dev
    ```

Open [http://localhost:3000](http://localhost:3000) (or the port specified in your terminal) with your browser to see the result. The page auto-updates as you edit files in the `app/` directory.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## License

This project is part of OrdLite.io and is licensed under the MIT License. See the main [LICENSE](../LICENSE) file in the root directory for details.

## Contributing

Contributions to the OrdLite.io frontend are welcome! Please refer to the main [README.md](../README.md) in the root directory for general contribution guidelines.

## Learn More About Next.js

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deployment

You can deploy this Next.js application using various platforms. The [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme), from the creators of Next.js, is one popular option. For more general deployment guidance, refer to the [Next.js deployment documentation](https://nextjs.org/docs/deployment).
