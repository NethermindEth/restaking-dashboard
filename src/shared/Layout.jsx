import Footer from './Footer';
import Header from './Header';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useTailwindBreakpoint } from './useTailwindBreakpoint';

export default function Layout() {
  const showSidebar = useTailwindBreakpoint('lg');

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
