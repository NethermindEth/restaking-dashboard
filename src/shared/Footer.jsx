import './Footer.css';
import { Link } from '@nextui-org/react';

export default function Footer() {
  return (
    <footer className="flex flex-row items-start md:items-center gap-8 px-4 py-6 justify-between">
      <Link href="https://nethermind.io" target="_blank">
        <img
          alt="Powered by Nethermind"
          className="max-h-[61px]"
          srcSet="/powered-by.png 1x, /powered-by.png 2x"
        />
      </Link>
      <ul className="flex flex-col md:flex-row gap-2 md:gap-8">
        {mainLinks.map((item, i) => (
          <li key={i} className="inline-block">
            <Link
              key={`footer-item-${i}`}
              className="text-foreground-2 text-xs"
              href={item.href}
            >
              {item.title}
              <span className="material-symbols-outlined hidden lg:inline">
                arrow_right_alt
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <ul>
        <li>
          <Link
            className="footer-x-link text-foreground-2 text-xs"
            href="https://x.com/NethermindEth"
            target="_blank"
          >
            Follow us
          </Link>
        </li>
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
