import { Link, Image, Button, Skeleton } from '@nextui-org/react';
import React, { useCallback } from 'react';
import { useMutativeReducer } from 'use-mutative';
import { reduceState } from '../shared/helpers';

const formatEtherscanLink = address => {
  return `https://etherscan.io/address/${address}`;
};

export default function AVSDetailsHeader({ avs }) {
  const [state, dispatch] = useMutativeReducer(reduceState, {
    isCopied: false,
    copyTimeout: null
  });

  const handleCopy = useCallback(value => {
    if ('clipboard' in navigator) {
      navigator.clipboard.writeText(value).catch();

      if (state.copyTimeout) {
        clearTimeout(state.copyTimeout);
      }

      dispatch({
        isCopied: true,
        copyTimeout: setTimeout(() => dispatch({ isCopied: false }), 2000)
      });
    }
  }, []);

  return (
    <div className="bg-content1 border border-outline rounded-lg w-full p-4 break-words">
      <div className="flex items-center">
        <AVSLogo avs={avs} />
        <span className="ml-2 text-foreground-1 text-3xl">
          {avs.metadata?.name ?? 'N/A'}
        </span>
      </div>
      <div className="my-4 text-sm text-foreground-1 break-words">
        {avs.metadata?.description ?? 'N/A'}
      </div>

      {avs.metadata?.website && (
        <Link
          href={avs.metadata.website}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-secondary"
        >
          {avs.metadata.website}
        </Link>
      )}

      <div className="flex">
        <div className="flex items-center">
          <Link
            href={formatEtherscanLink(avs.address)}
            target="blank"
            rel="noreferrer"
            className="text-sm text-secondary"
          >
            {avs.address.substr(0, 6)}...
            {avs.address.substr(-4)}
          </Link>
          <Button
            variant="ghost"
            isIconOnly={true}
            className="pd-0 border-none ml-1"
            size="sm"
            onClick={() => handleCopy(avs.address)}
          >
            {state.isCopied ? <CheckIcon /> : <CopyIcon />}
          </Button>
        </div>

        {avs.metadata?.twitter !== '' && (
          <Button
            variant="ghost"
            as={Link}
            href={avs.metadata.twitter}
            target="_blank"
            rel="noreferrer"
            size="sm"
            isIconOnly={true}
            className="ml-4 pd-0 border-none"
          >
            <TwitterIcon />
          </Button>
        )}
      </div>
    </div>
  );
}

function AVSLogo({ avs }) {
  const [state, dispatch] = useMutativeReducer(reduceState, {
    isError: false
  });

  if (state.isError) {
    return (
      <Skeleton
        className="border border-outline rounded-full size-12"
        disableAnimation={state.isError}
      />
    );
  }

  return (
    <Image
      src={avs.metadata?.logo}
      height={48}
      width={48}
      radius="full"
      classNames={{ wrapper: 'border border-outline' }}
      onError={() => dispatch({ isError: true })}
    />
  );
}

function CopyIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="Icons">
        <path
          id="Vector"
          d="M7.54813 14.5832C7.17299 14.5832 6.8559 14.4537 6.59687 14.1946C6.33785 13.9356 6.20833 13.6185 6.20833 13.2434V3.7563C6.20833 3.38116 6.33785 3.06407 6.59687 2.80505C6.8559 2.54602 7.17299 2.4165 7.54813 2.4165H15.0352C15.4103 2.4165 15.7274 2.54602 15.9865 2.80505C16.2455 3.06407 16.375 3.38116 16.375 3.7563V13.2434C16.375 13.6185 16.2455 13.9356 15.9865 14.1946C15.7274 14.4537 15.4103 14.5832 15.0352 14.5832H7.54813ZM4.96479 17.1665C4.58965 17.1665 4.27257 17.037 4.01354 16.778C3.75451 16.5189 3.625 16.2019 3.625 15.8267V5.2563H4.70833V15.8267C4.70833 15.8909 4.73507 15.9496 4.78854 16.003C4.84188 16.0564 4.90062 16.0832 4.96479 16.0832H13.5352V17.1665H4.96479Z"
          className="fill-secondary"
        />
      </g>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="20"
      width="20"
      strokeWidth={2}
      viewBox="0 0 24 24"
      className="stroke-secondary"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg height="20" width="20" viewBox="0 0 24 24" className="fill-secondary">
      <g>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
      </g>
    </svg>
  );
}
