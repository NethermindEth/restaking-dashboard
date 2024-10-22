import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from '@nextui-org/react';


export const RewardAccordianContent = ({ reward, ethRate }) => {
  return (
    <div>
      <Table
        aria-label="Rewards sub list text-foreground-2"
        removeWrapper
      >
        <TableHeader className='py-4'>
          <TableColumn
            className={`bg-transparent border-t border-outline text-sm my-2 font-normal leading-5 text-foreground-2 transition-colors data-[hover=true]:text-foreground-2`}
          >
            Asset
          </TableColumn>
          <TableColumn
            className={`bg-transparent text-center border-t border-outline text-sm my-2 font-normal leading-5 text-foreground-2 transition-colors data-[hover=true]:text-foreground-2`}
          >
            <div className='border-x border-x-outline w-full'>
              Token Amount
            </div>
          </TableColumn>

          <TableColumn
            className={`bg-transparent text-right border-t border-outline text-sm my-2 font-normal leading-5 text-foreground-2 transition-colors data-[hover=true]:text-foreground-2`}
          >
            Value
          </TableColumn>
        </TableHeader>
        <TableBody>
          {reward.tokens.map((token, i) => {
            return (
              <TableRow className="border-t border-outline text-foreground-2" key={`token ${i}`}>
                <TableCell>
                  <div className='flex items-center gap-2 text-foreground-2'>
                    <div className='w-4 h-4 rounded-full'>
                      {
                        !!token.symbol && (
                          <img
                            alt={token.symbol.toLowerCase()}
                            src={`/images/${token.symbol.toLowerCase()}.png`}
                            className='w-full h-full rounded-full object-cover'
                          />
                        )
                      }
                    </div>
                    <p>
                      <span className='mr-2'>
                        {token.name}
                      </span>
                      <span className="text-foreground">
                        {token.symbol}
                      </span>
                    </p>
                  </div>
                </TableCell>
                <TableCell className='text-center'>{Number(token.amount).toFixed(3)}</TableCell>
                <TableCell className='text-right'>+ $ {parseFloat(token.amountETH * ethRate).toFixed(2)} - {parseFloat(token.amountETH).toFixed(2)} ETH</TableCell>
              </TableRow>
            )
          })
          }
        </TableBody>
      </Table>
    </div>
  )
}
