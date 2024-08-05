import { formatETH, formatUSD } from '../shared/formatters';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from '@nextui-org/react';
import { lstStrategyAssetMapping } from '../shared/strategies';
import ThirdPartyLogo from '../shared/ThirdPartyLogo';

export default function LSTList({ data, latestRate }) {
  return (
    <div className="rounded-lg border border-outline bg-content1 text-sm">
      <Table
        aria-label="List of LST sorted by TVL"
        classNames={{
          base: 'overflow-x-auto',
          table: 'h-full',
          thead: '[&>tr:last-child]:hidden'
        }}
        layout="fixed"
        removeWrapper
      >
        <TableHeader>
          <TableColumn className="w-64 bg-transparent py-4 ps-6 text-sm font-normal leading-5 text-foreground-1 data-[hover=true]:text-foreground-2 md:w-1/3">
            Protocol
          </TableColumn>
          <TableColumn className="w-48 bg-transparent py-4 text-end text-sm font-normal leading-5 text-foreground-1 data-[hover=true]:text-foreground-2 md:w-1/3">
            Unbonding period
          </TableColumn>
          <TableColumn className="w-48 bg-transparent py-4 pe-8 text-end text-sm font-normal leading-5 text-foreground-1 data-[hover=true]:text-foreground-2 md:w-1/3">
            Total value
          </TableColumn>
        </TableHeader>
        <TableBody>
          {data.map(([address, tvl], i) => {
            return (
              <TableRow
                className="border-t border-outline"
                key={`lst-item-${i}`}
              >
                <TableCell>
                  <div className="flex items-center gap-x-2">
                    <span className="inline-block min-w-4 text-foreground-2">
                      {i + 1}
                    </span>
                    <ThirdPartyLogo
                      className="size-6 min-w-6"
                      url={lstStrategyAssetMapping[address].logo}
                    />
                    <span className="truncate text-foreground-2">
                      {lstStrategyAssetMapping[address].name}
                    </span>

                    <span className="mx-1 text-foreground-1">
                      {lstStrategyAssetMapping[address].symbol}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-end">7 days</TableCell>
                <TableCell className="pe-8 text-end">
                  <div>{formatUSD(tvl * latestRate)}</div>
                  <div className="text-xs text-foreground-2">
                    {formatETH(tvl)}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
