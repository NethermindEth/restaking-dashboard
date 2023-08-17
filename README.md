# EigenLayer's Restaking Dashboard

This project is composed of two parts:
- A [Next.js](https://nextjs.org/) frontend bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) 
- A supabase database and set of edge functions that are run via cron jobs.

## Getting Started with the Next.js App

First, run the development server:

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

## Getting Started with the Supabase Functions

The edge functions are located in the `functions` folder. They are deployed manually, and a cron job is setup in the `cron` scheme in order to run them continuously.

