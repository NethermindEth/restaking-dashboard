import Header from './Header';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useTailwindBreakpoint } from './useTailwindBreakpoint';
import Footer from './Footer';

export default function Layout() {
  const showSidebar = useTailwindBreakpoint('lg');

  return (
    <div className="bg-background flex flex-col gap-4 text-foreground">
      <div className="basis-0 flex flex-1">
        {showSidebar && (
          <div className="sticky top-0 max-h-screen w-64 bg-content1 border-b border-e border-outline flex flex-col overflow-y-scroll lg:overflow-hidden rounded-br-lg">
            <Sidebar />
          </div>
        )}
        <div className="basis-0 flex-1">
          {!showSidebar && <Header />}
          <main className="px-4 pt-6">
            <Outlet />
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
