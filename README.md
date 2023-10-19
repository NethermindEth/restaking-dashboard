# EigenLayer's Restaking Dashboard

This project is composed of two parts:

- A [Next.js](https://nextjs.org/) frontend bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app)
- A serverless backend that in turn queries Spice AI to fetch data/.

## Getting Started with the Next.js App

First, run the development server:

Copy `.env.example` to `.env` and fill all the variables.

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The functions that are retrieving data are in:

- `/app/page.tsx`: This is the main page that is rendered, it calls most of the functions and is being rendered on the server.
- `pages/api/og.tsx`: This is the endpoint that is called to generate the og image. See more [here](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation).

## Starting API server

Make sure to install [serverless](https://www.serverless.com/framework/docs/getting-started) framework.

### Offline Development

Copy `.env.example` to `.env` inside `/api` and fill all the variables.

```bash
cd api
yarn
serverless offline start
```

### More tokens support

To add more tokens for any network:

- Update `app/constants.ts` and `api/utils.ts`
- In `getRates()` inside `app/utils.ts` add code for the respective token
- You can get required token addresses from [here](https://github.com/Layr-Labs/eigenlayer-contracts/blob/master/README.md)
