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
import {
  SignedIn,
  SignedOut,
  useAuth,
  useClerk,
  useUser
} from '@clerk/clerk-react';
import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { reduceState } from './helpers';
import RestakingLogo from './ResatkingLogo';
import { useMutativeReducer } from 'use-mutative';
import { useServices } from '../@services/ServiceContext';

export default function Sidebar({ onOpenChange }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { subscriptionService } = useServices();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    isSubscribed: true
  });
  const { isSignedIn } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const subscription = await subscriptionService.getUserSubscription();
        if (subscription.subscription.status === 'active') {
          dispatch({ isSubscribed: true });
        }
      } catch (e) {
        dispatch({ isSubscribed: false });
      }
    })();
  }, [dispatch, subscriptionService, isSignedIn]);

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
              {item.isNew && <div className='bg-default-2 rounded p-1 text-content1 text-sm ms-2'>New</div>}
            </Link>
          );
        })}
      </nav>

      {!state.isSubscribed && (
        <div className="mx-5 mb-5 flex flex-col gap-y-2 rounded-sm bg-content2 p-3">
          <span className="text-foreground-1">Like what you see?</span>
          <p className="text-xs text-foreground-2">
            If you find our dashboard helpful and would like to help our ongoing
            development, your support would be massive!
          </p>

          <Button
            className="rounded-md border border-foreground-2"
            data-matomo-id="support-us-btn"
            onPress={() => {
              window._paq.push([
                'trackEvent',
                'Support us',
                'Support us button clicked',
                ''
              ]);
              navigate('/subscriptions');
            }}
            variant="bordered"
          >
            Support Us
          </Button>
        </div>
      )}

      <div className="basis-0 px-5 pb-5">
        <SignedOut>
          <Button
            className="hover:!text-content1"
            color="primary"
            data-matomo-id="signin-nav-btn"
            fullWidth
            onClick={() => {
              window._paq.push([
                'trackEvent',
                'Sign In',
                'Sign In button clicked',
                ''
              ]);
              navigate('/login');
            }}
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
  },
  {
    title: 'Rewards',
    href: '/rewards',
    icon: 'stars',
    isNew: true,
  }
];
