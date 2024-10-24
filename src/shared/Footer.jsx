import './Footer.css';
import { Link } from '@nextui-org/react';

export default function Footer() {
  return (
    <footer className="flex w-full flex-col items-center justify-center">
      <div className="flex w-full flex-row content-center items-start justify-between gap-5 px-4 py-6 text-foreground-2 md:items-center md:gap-8">
        <div>
          <Link href="https://nethermind.io" target="_blank">
            <img
              alt="Powered by Nethermind"
              className="max-h-[61px]"
              srcSet="/images/powered-by.png 1x, /images/powered-by.png 2x"
            />
          </Link>
          <div className="text-xs">&copy;2024 Nethermind</div>
        </div>
        <ul className="flex flex-col gap-2 md:flex-row md:gap-8">
          {mainLinks.map((item, i) => (
            <li className="flex h-6 items-center" key={`footer-main-${i}`}>
              <Link
                className="text-xs text-foreground-2"
                data-matomo-id={item.id}
                href={item.href}
                onPress={() =>
                  item.matomoEventData &&
                  window._paq.push(['trackEvent', ...item.matomoEventData])
                }
                target="_blank"
              >
                {item.title}
                <span className="material-symbols-outlined hidden lg:inline">
                  arrow_right_alt
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <ul className="flex flex-col gap-2 md:flex-row md:gap-8">
          {socialLinks.map((item, i) => (
            <li className="flex h-6 items-center" key={`footer-social-${i}`}>
              <Link
                className={`${item.className} text-xs text-foreground-2`}
                data-matomo-id={item.id}
                href={item.href}
                onPress={() =>
                  item.matomoEventData &&
                  window._paq.push(['trackEvent', ...item.matomoEventData])
                }
                target="_blank"
              >
                <span className="icon"></span>
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-6 text-xs text-foreground-2">
        Asset prices provided by{' '}
        <Link
          className="text-xs text-foreground-2 underline"
          href="https://www.coingecko.com/"
        >
          CoinGecko
        </Link>
      </div>
    </footer>
  );
}

const mainLinks = [
  {
    id: 'audit-smart-contract',
    title: 'Audit smart contract',
    href: 'https://www.nethermind.io/smart-contract-audits',
    matomoEventData: [
      'Contact',
      'Audit smart contract',
      'https://www.nethermind.io/smart-contract-audits'
    ]
  },
  {
    id: 'nethermind-operator',
    title: 'Nethermind operator',
    href: 'https://app.eigenlayer.xyz/operator/0x110af279aaffb0d182697d7fc87653838aa5945e',
    matomoEventData: [
      'Contact',
      'Nethermind operator',
      'https://app.eigenlayer.xyz/operator/0x110af279aaffb0d182697d7fc87653838aa5945e'
    ]
  },
  {
    id: 'legal',
    title: 'Legal',
    href: '/terms-and-conditions'
  },
  {
    id: 'api-docs',
    title: 'API Docs',
    href: `${import.meta.env.VITE_API_BASE_URL}/swagger`,
    matomoEventData: [
      'Contact',
      'API Docs',
      `${import.meta.env.VITE_API_BASE_URL}/swagger`
    ]
  }
];

const socialLinks = [
  {
    id: 'social-x',
    title: 'Follow us',
    className: 'footer-x',
    href: 'https://x.com/restakinginfo',
    matomoEventData: ['Social Media', 'X', 'https://x.com/restakinginfo']
  },
  {
    id: 'social-discord',
    title: 'Join us',
    className: 'footer-discord',
    href: 'https://discord.com/invite/PaCMRFdvWT',
    matomoEventData: [
      'Social Media',
      'Discord',
      'https://discord.com/invite/PaCMRFdvWT'
    ]
  }
];
