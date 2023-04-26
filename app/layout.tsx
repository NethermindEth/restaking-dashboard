import "./globals.css";

const title = "EigenLayer Restaking Dashboard";
const description = "Visualise EigenLayer staking and withdrawals in Goerli";
const url =
  `https://${process.env.VERCEL_URL}/api/og` ||
  "https://restaking-dashboard-git-twitter-card-restaking-dashboard.vercel.app/api/og";

export const metadata = {
  title,
  description,
  openGraph: {
    type: "website",
    title,
    description,
    images: [
      {
        url,
        secureUrl: url,
        href: url,
        alt: title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    description,
    images: [
      {
        url,
        secureUrl: url,
        href: url,
        alt: title,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
