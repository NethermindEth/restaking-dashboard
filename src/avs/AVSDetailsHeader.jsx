import { Button, Image, Link, Skeleton } from '@nextui-org/react';
import { reduceState } from '../shared/helpers';
import { useCallback } from 'react';
import { useMutativeReducer } from 'use-mutative';

export default function AVSDetailsHeader({ avs }) {
  const [state, dispatch] = useMutativeReducer(reduceState, {
    isCopied: false,
    copyTimeout: null
  });

  const handleCopy = useCallback(
    value => {
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
    },
    [dispatch, state.copyTimeout]
  );

  return (
    <div className="bg-content1 border border-outline rounded-lg w-full p-4 break-words">
      <div className="flex items-center">
        <AVSLogo avs={avs} />
        <div className="ml-2 text-foreground-1 text-3xl font-display font-medium">
          <span>{avs.metadata?.name ?? 'N/A'}</span>

          {/*TODO: implement ranking when coming from list view & accessing directly avs*/}
          <span className="inline-block text-xs ml-2 p-1 rounded-md bg-foreground-2 text-content1 translate-y-[-25%]">
            # 1
          </span>
        </div>
      </div>
      <div className="my-4 text-xs text-foreground-1 break-words">
        {avs.metadata?.description ?? 'N/A'}
      </div>

      {avs.metadata?.website && (
        <Link
          className="text-xs text-secondary"
          href={avs.metadata.website}
          rel="noreferrer"
          target="_blank"
        >
          {avs.metadata.website}
        </Link>
      )}

      <div className="flex">
        <div className="flex items-center">
          <Link
            className="text-xs text-secondary"
            href={`https://etherscan.io/address/${avs.address}`}
            rel="noreferrer"
            target="_blank"
          >
            {avs.address.substr(0, 6)}...
            {avs.address.substr(-4)}
          </Link>
          <Button
            className="border-none ml-1 text-secondary"
            isIconOnly
            onClick={() => handleCopy(avs.address)}
            size="sm"
            variant="ghost"
          >
            <span className="material-symbols-outlined text-secondary text-2xl">
              {state.isCopied ? 'check' : 'content_copy'}
            </span>
          </Button>
        </div>

        {!!avs.metadata?.twitter && (
          <Button
            as={Link}
            className="ml-12 border-none text-secondary"
            href={avs.metadata.twitter}
            rel="noreferrer"
            size="sm"
            target="_blank"
            variant="ghost"
          >
            <span
              className="bg-secondary h-4 w-4"
              style={{
                mask: 'url(/assets/x.svg) no-repeat',
                backgroundColor: 'hsl(var(--app-secondary))'
              }}
            ></span>
            @
            {avs.metadata.twitter.substring(
              avs.metadata.twitter.lastIndexOf('/') + 1
            )}
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
        className="border border-outline rounded-full h-12 max-w-12 w-full"
        disableAnimation={state.isError}
      />
    );
  }

  return (
    <Image
      classNames={{
        wrapper: 'border border-outline',
        // override tailwind's base img styling that doesn't respect specified dimensions
        img: 'object-contain bg-foreground-2 h-12 w-12 max-w-none'
      }}
      height={48}
      onError={() => dispatch({ isError: true })}
      radius="full"
      src={avs.metadata?.logo}
      width={48}
    />
  );
}
