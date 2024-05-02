import Header from './Header';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useTailwindBreakpoint } from './useTailwindBreakpoint';

export default function Layout() {
  const showSidebar = useTailwindBreakpoint('lg');

  return (
    <div className="bg-background flex min-h-screen text-foreground">
      {showSidebar && (
        <div className="flex w-52">
          <Sidebar />
        </div>
      )}
      <main className="basis-0 flex-1">
        {!showSidebar && <Header />}
        <Outlet />
      </main>
    </div>
  );
}
