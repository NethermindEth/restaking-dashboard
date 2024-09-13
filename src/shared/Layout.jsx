import Footer from './Footer';
import Header from './Header';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Spinner } from '@nextui-org/react';
import { useSession } from '@clerk/clerk-react';
import { useTailwindBreakpoint } from './hooks/useTailwindBreakpoint';

export default function Layout() {
  const showSidebar = useTailwindBreakpoint('lg');
  const { isLoaded } = useSession();

  // Don't render the main content until the auth session is loaded
  if (!isLoaded) {
    return (
      <div className="flex h-screen flex-col content-center justify-center">
        <Spinner color="primary" size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col gap-4 bg-background text-foreground">
      <div className="flex flex-1">
        {showSidebar && (
          <div className="sticky top-0 flex max-h-screen w-64 flex-col overflow-y-scroll rounded-br-lg border-b border-e border-outline bg-content1 lg:overflow-hidden">
            <Sidebar />
          </div>
        )}
        <div className="flex w-full flex-col">
          {!showSidebar && <Header />}
          <main className="flex-1 px-4 pt-6">
            <Outlet />
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
