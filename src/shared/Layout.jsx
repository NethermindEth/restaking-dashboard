import Header from './Header';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useTailwindBreakpoint } from './useTailwindBreakpoint';

export default function Layout() {
  const showSidebar = useTailwindBreakpoint('lg');

  return (
    <div className="bg-background min-h-screen flex flex-col text-foreground">
      <div className="basis-0 flex flex-1">
        {showSidebar && (
          <div className="flex w-64">
            <Sidebar />
          </div>
        )}
        <div className="basis-0 flex-1">
          {!showSidebar && <Header />}
          <main className="p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
      <div className="h-10"></div>
    </div>
  );
}
