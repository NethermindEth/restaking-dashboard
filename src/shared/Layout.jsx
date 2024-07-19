import Footer from './Footer';
import Header from './Header';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useTailwindBreakpoint } from './useTailwindBreakpoint';

export default function Layout() {
  const showSidebar = useTailwindBreakpoint('lg');

  return (
    <div className="bg-background flex flex-col gap-4 min-h-screen text-foreground">
      <div className="flex flex-1">
        {showSidebar && (
          <div className="sticky top-0 max-h-screen w-64 bg-content1 border-b border-e border-outline flex flex-col overflow-y-scroll lg:overflow-hidden rounded-br-lg">
            <Sidebar />
          </div>
        )}
        <div className="flex flex-col w-full">
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
