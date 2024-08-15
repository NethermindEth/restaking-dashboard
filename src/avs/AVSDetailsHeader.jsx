import CopyButton from '../shared/CopyButton';
import { Link } from '@nextui-org/react';
import ThirdPartyLogo from '../shared/ThirdPartyLogo';
import { truncateAddress } from '../shared/helpers';

export default function AVSDetailsHeader({ avs }) {
  return (
    <div className="rd-box flex w-full flex-row flex-wrap items-center gap-x-5 gap-y-2 break-words p-4">
      <div className="flex basis-full items-center gap-4">
        <ThirdPartyLogo className="size-12 min-w-12" url={avs.metadata?.logo} />
        <span className="font-display text-3xl font-medium text-foreground-1">
          <span>{avs.metadata?.name ?? truncateAddress(avs.address)}</span>
          {/*TODO: implement ranking when coming from list view & accessing directly avs*/}
          {/* <span className="ml-2 inline-block translate-y-[-25%] rounded-md bg-foreground-2 p-1 text-xs text-content1"> */}
          {/*   # 1 */}
          {/* </span> */}
        </span>
      </div>
      <span className="basis-full break-words pt-4 text-xs text-foreground-1">
        {avs.metadata?.description}
      </span>
      <div className="flex basis-full items-center gap-1 lg:basis-0">
        <Link
          className="truncate text-xs text-secondary"
          href={`https://etherscan.io/address/${avs.address}`}
          rel="noreferrer"
          target="_blank"
        >
          {avs.address}
        </Link>
        <CopyButton color="secondary" value={avs.address} />
      </div>
      {avs.metadata?.website && (
        <Link
          className="flex items-center text-secondary"
          href={avs.metadata.website}
          rel="noreferrer"
          size="sm"
          target="_blank"
        >
          <span className="material-symbols-outlined me-1 text-xl text-secondary">
            language
          </span>
          Website
        </Link>
      )}
      {avs.metadata?.twitter && (
        <Link
          className="border-none text-secondary"
          href={avs.metadata.twitter}
          rel="noreferrer"
          size="sm"
          target="_blank"
        >
          <span
            className="me-1 h-4 w-4 bg-secondary"
            style={{
              mask: 'url(/images/x.svg) no-repeat',
              backgroundColor: 'hsl(var(--app-secondary))'
            }}
          ></span>
          @
          {avs.metadata.twitter.substring(
            avs.metadata.twitter.lastIndexOf('/') + 1
          )}
        </Link>
      )}
    </div>
  );
}
