import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Image,
  Link
} from '@nextui-org/react';
import { SignedIn, SignedOut, useClerk, useUser } from '@clerk/clerk-react';
import { useLocation, useNavigate } from 'react-router-dom';
import RestakingLogo from './ResatkingLogo';
import { useCallback } from 'react';

export default function Sidebar({ onOpenChange }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header className="flex h-full flex-col">
      <div className="basis-0 border-l-4 border-transparent px-5 pb-8 pt-6">
        <RestakingLogo />
      </div>
      <nav className="basis-full">
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
      <div className="mx-5 mb-5 flex flex-col gap-y-2 rounded-sm bg-content2 p-3">
        <span className="text-foreground-1">Support Us</span>
        <p className="text-xs text-foreground-2">
          take advantage of all the features in one glanceand any other text.
          Lets add another line here.
        </p>

        <Button
          className="rounded-md border border-foreground-2"
          onPress={() => navigate('/subscriptions')}
          variant="bordered"
        >
          Support Us
        </Button>
      </div>

      <div className="basis-0 px-5 pb-5">
        <SignedOut>
          <Button
            className="hover:!text-content1"
            color="primary"
            fullWidth
            onClick={() => navigate('/login')}
            radius="sm"
            variant="ghost"
          >
            Sign in
          </Button>
        </SignedOut>
        <SignedIn>
          <UserMenu />
        </SignedIn>
      </div>
      {/* <Settings /> */}
    </header>
  );
}

function UserMenu() {
  const clerk = useClerk();
  const navigate = useNavigate();
  const { user } = useUser();

  const handleAccountAction = useCallback(
    key => {
      switch (key) {
        case 'account':
          clerk.openUserProfile();
          break;

        case 'subscriptions':
          navigate('/subscriptions');
          break;

        case 'signout':
          clerk.signOut();
          break;
      }
    },
    [clerk, navigate]
  );

  return (
    <Dropdown className="border border-outline shadow-none">
      <DropdownTrigger>
        <Button
          className="flex"
          color="default"
          fullWidth
          size="md"
          startContent={
            <Image
              className="min-w-5"
              height={20}
              src={user?.imageUrl}
              width={20}
            />
          }
          variant="light"
        >
          <span className="overflow-hidden text-ellipsis">
            {user?.fullName ||
              user?.username ||
              user?.primaryEmailAddress?.emailAddress}
          </span>
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="theme"
        onAction={handleAccountAction}
        selectionMode="none"
      >
        <DropdownSection classNames={{ divider: 'bg-outline' }} showDivider>
          <DropdownItem
            key="subscriptions"
            startContent={
              <span className="material-symbols-outlined">subscriptions</span>
            }
          >
            Subscriptions
          </DropdownItem>
          <DropdownItem
            key="account"
            startContent={
              <span className="material-symbols-outlined text-foreground">
                manage_accounts
              </span>
            }
          >
            Manage account
          </DropdownItem>
        </DropdownSection>
        <DropdownItem
          key="signout"
          startContent={
            <span className="material-symbols-outlined">logout</span>
          }
        >
          Sign out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
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
