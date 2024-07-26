import { Link } from '@nextui-org/react';

export default function NotFound() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 rounded-lg border border-outline bg-content1 px-4 pb-36 pt-20 text-center">
        <span className="material-symbols-outlined text-[12rem] text-outline">
          &#xe811;
        </span>
        <div className="mt-4 font-display text-2xl text-foreground-1">
          Whoops, page not found.
        </div>
        <div className="text-foreground-2">
          We looked everywhere, but we couldn't find the page you're looking
          for.
        </div>
        <div className="mt-10">
          <Link href="/" color="secondary">
            Let's take you to all things restaking
          </Link>
        </div>
      </div>
    </div>
  );
}
