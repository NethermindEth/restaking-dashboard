import { Image } from '@nextui-org/react';

/**
 * @param {{ className: string, url: string }} props
 */
export default function ThirdPartyLogo({ className, url }) {
  if (!url) {
    return (
      <span
        className={`material-symbols-outlined flex items-center justify-center rounded-full bg-foreground-2 ${className}`}
      >
        question_mark
      </span>
    );
  }

  return (
    <Image
      className={`rounded-full border-2 border-foreground-2 bg-foreground-2 ${className}`}
      src={url}
    />
  );
}
