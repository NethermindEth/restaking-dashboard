import { Link } from '@nextui-org/react';
import RestakingLogo from './ResatkingLogo';
import { useLocation } from 'react-router-dom';

export default function Sidebar({ onOpenChange }) {
  const location = useLocation();

  return (
    <div>
      <header className="flex-none border-l-4 border-transparent px-5 pb-8 pt-6">
        <RestakingLogo />
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
              className={`flex gap-x-2 border-l-4 px-5 py-5 text-foreground-2 transition-all hover:border-foreground-2 hover:bg-default/50 hover:text-foreground-1 hover:opacity-100 data-[focus-visible=true]:outline-offset-[-2px] ${selected}`}
              href={item.href}
              key={`nav-item-${i}`}
              onPress={() => {
                if (onOpenChange) {
                  onOpenChange(false);
                }
              }}
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
