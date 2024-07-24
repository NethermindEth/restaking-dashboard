import { Button, Link } from '@nextui-org/react';
import { reduceState } from '../shared/helpers';
import ThirdPartyLogo from '../shared/ThirdPartyLogo';
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
    <div className="w-full break-words rounded-lg border border-outline bg-content1 p-4">
      <div className="flex items-center">
        <ThirdPartyLogo className="size-12 min-w-12" url={avs.metadata?.logo} />
        <div className="ml-2 font-display text-3xl font-medium text-foreground-1">
          <span>{avs.metadata?.name ?? 'N/A'}</span>

          {/*TODO: implement ranking when coming from list view & accessing directly avs*/}
          {/* <span className="ml-2 inline-block translate-y-[-25%] rounded-md bg-foreground-2 p-1 text-xs text-content1"> */}
          {/*   # 1 */}
          {/* </span> */}
        </div>
      </div>
      <div className="my-4 break-words text-xs text-foreground-1">
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
            className="ml-1 border-none text-secondary"
            isIconOnly
            onClick={() => handleCopy(avs.address)}
            size="sm"
            variant="ghost"
          >
            <span className="material-symbols-outlined text-2xl text-secondary">
              {state.isCopied ? 'check' : 'content_copy'}
            </span>
          </Button>
        </div>

        {!!avs.metadata?.twitter && (
          <Link
            className="ml-12 border-none text-secondary"
            href={avs.metadata.twitter}
            rel="noreferrer"
            size="sm"
            target="_blank"
          >
            <span
              className="h-4 w-4 bg-secondary"
              style={{
                mask: 'url(/assets/x.svg) no-repeat',
                backgroundColor: 'hsl(var(--app-secondary))'
              }}
            ></span>
            &nbsp;@
            {avs.metadata.twitter.substring(
              avs.metadata.twitter.lastIndexOf('/') + 1
            )}
          </Link>
        )}
      </div>
    </div>
  );
}
