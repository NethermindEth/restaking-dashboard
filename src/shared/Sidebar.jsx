import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from '@nextui-org/react';
import RestakingLogo from './ResatkingLogo';

export default function Sidebar({ onOpenChange }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [focusedIndex, setFocusedIndex] = useState(0);
  const linkRefs = useRef([]);

  const handleKeyDown = (event, index) => {
    switch (event.key) {
      case ' ':
        event.preventDefault();
        setFocusedIndex(prevIndex =>
          prevIndex >= navItems.length - 1 ? 0 : prevIndex + 1
        );
        break;
      case 'Enter':
        navigate(navItems[index].href);
        if (onOpenChange) {
          onOpenChange(false);
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (linkRefs.current[focusedIndex]) {
      linkRefs.current[focusedIndex].focus();
    }
  }, [focusedIndex]);

  return (
    <div onKeyDown={handleKeyDown} tabIndex={0}>
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
              className={`flex gap-x-2 border-l-4 px-5 py-5 text-foreground-2 transition-all hover:border-foreground-2 hover:bg-default/50 hover:text-foreground-1 hover:opacity-100 focus:border-foreground-1 focus:bg-default focus:text-foreground-1 focus:outline-none focus:ring-0 ${selected}`}
              href={item.href}
              key={`nav-item-${i}`}
              onPress={() => {
                navigate(item.href);
                if (onOpenChange) {
                  onOpenChange(false);
                }
              }}
              ref={el => (linkRefs.current[i] = el)}
              style={{ outline: 'none' }}
              tabIndex={-1}
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
