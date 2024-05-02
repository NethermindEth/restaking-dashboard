import { useLocation, useNavigate } from 'react-router-dom';
import Footer from './Footer';
import { Link } from '@nextui-org/react';
import { useCallback } from 'react';
import { useTheme } from './ThemeContext';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { resolvedTheme: theme } = useTheme();
  const handleNavLinkClick = useCallback(
    event => {
      event.preventDefault();

      navigate(event.target.getAttribute('href'));
    },
    [navigate]
  );
  return (
    <div
      className={`sidebar-${theme} h-full flex flex-col overflow-y-scroll lg:overflow-hidden w-full`}
      data-theme
    >
      <header className="flex-none font-display font-bold pb-8 pt-3 px-5 text-sm uppercase">
        Restaking Dashboard
      </header>
      <nav className="flex-none">
        {navItems.map((item, i) => {
          const selected =
            item.href === location.pathname
              ? 'border-emerald-400'
              : 'border-transparent';
          return (
            <Link
              key={`nav-item-${i}`}
              className={`border-l-4 hover:bg-default/20 flex gap-x-2 px-4 py-4 transition-all ${selected}`}
              href={item.href}
              onClick={handleNavLinkClick}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.title}
            </Link>
          );
        })}
      </nav>
      <Footer />
    </div>
  );
}

const navItems = [
  {
    title: 'Overview',
    href: '/',
    icon: 'home'
  },
  {
    title: 'LRT',
    href: '/lrt',
    icon: 'cycle'
  },
  {
    title: 'AVS',
    href: '/avs',
    icon: 'stacks'
  },
  {
    title: 'Operators',
    href: '/operators',
    icon: 'network_node'
  },
  {
    title: 'LST',
    href: '/lst',
    icon: 'cached'
  }
];
