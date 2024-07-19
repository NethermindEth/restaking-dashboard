import './Footer.css';
import { Link } from '@nextui-org/react';

export default function Footer() {
  return (
    <footer className="flex flex-row items-start content-center md:items-center gap-5 md:gap-8 px-4 py-6 justify-between text-foreground-2">
      <div>
        <Link href="https://nethermind.io" target="_blank">
          <img
            alt="Powered by Nethermind"
            className="max-h-[61px]"
            srcSet="/assets/powered-by.png 1x, /assets/powered-by.png 2x"
          />
        </Link>
        <div className="text-xs">&copy;2024 Nethermind</div>
      </div>
      <ul className="flex flex-col md:flex-row gap-2 md:gap-8">
        {mainLinks.map((item, i) => (
          <li key={`footer-main-${i}`} className="flex items-center h-6">
            <Link className="text-foreground-2 text-xs" href={item.href}>
              {item.title}
              <span className="material-symbols-outlined hidden lg:inline">
                arrow_right_alt
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <ul className="flex flex-col md:flex-row gap-2 md:gap-8">
        {socialLinks.map((item, i) => (
          <li key={`footer-social-${i}`} className="flex items-center h-6">
            <Link
              className={`${item.className} text-foreground-2 text-xs`}
              href={item.href}
            >
              <span className="icon"></span>
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </footer>
  );
}

const mainLinks = [
  {
    title: 'Audit smart contract',
    href: 'https://www.nethermind.io/smart-contract-audits'
  },
  {
    title: 'Nethermind operator',
    href: 'https://app.eigenlayer.xyz/operator/0x110af279aaffb0d182697d7fc87653838aa5945e'
  },
  {
    title: 'Legal',
    href: 'https://nethermind.io/legal'
  }
];

const socialLinks = [
  {
    title: 'Follow us',
    className: 'footer-x',
    href: 'https://x.com/NethermindEth'
  },
  {
    title: 'Join us',
    className: 'footer-discord',
    href: 'https://discord.com/invite/PaCMRFdvWT'
  }
];
