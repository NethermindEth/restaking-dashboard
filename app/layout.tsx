import "./globals.css";

export const metadata = {
  title: "EigenLayer Restaking Dashboard",
  description: "Visualise EigenLayer staking and withdrawals in Goerli",
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
