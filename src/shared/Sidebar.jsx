import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from '@nextui-org/react';
import { useCallback } from 'react';

export default function Sidebar({ onOpenChange }) {
  const location = useLocation();
  const navigate = useNavigate();
  const handleNavLinkClick = useCallback(
    event => {
      event.preventDefault();

      navigate(event.target.getAttribute('href'));

      if (onOpenChange) {
        onOpenChange(false);
      }
    },
    [navigate, onOpenChange]
  );
  return (
    <div>
      <header className="border-l-4 border-transparent flex-none pb-8 pt-6 px-5">
        <img
          alt="Restaking Dashboard"
          className="h-6 lg:h-5"
          src="/logo-h.svg"
        />
      </header>
      <nav className="flex-none">
        {navItems.map((item, i) => {
          const selected = new RegExp(`(^|/)${item.href}(/|$)`).test(
            location.pathname
          )
            ? 'border-foreground-1 bg-default text-foreground-1'
            : 'border-transparent';
          return (
            <Link
              key={`nav-item-${i}`}
              className={`border-l-4 hover:bg-default hover:border-foreground-2 flex gap-x-2 px-5 py-5 text-foreground-2 transition-all ${selected}`}
              href={item.href}
              onClick={handleNavLinkClick}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.title}
            </Link>
          );
        })}
      </nav>
      {/* <Settings /> */}
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
    title: 'AVS',
    href: '/avs',
    icon: 'stacks'
  },
  {
    title: 'Operators',
    href: '/operators',
    icon: 'linked_services'
  },
  {
    title: 'LRT',
    href: '/lrt',
    icon: 'token'
  },
  {
    title: 'LST',
    href: '/lst',
    icon: 'bar_chart_4_bars'
  }
];
