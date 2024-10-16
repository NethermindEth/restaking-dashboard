import { useMemo } from "react";

export const RewardVisualizer = ({ reward = { tokens: [] } }) => {
  const colors = ['#FB8C00', '#C9A9E9', '#7828C8', '#FFCC80', '#FB8C00', '#AE7EDE', '#EF6C00'];

  const totalAmount = useMemo(() => {
    return reward.tokens.reduce((sum, token) => +sum + +token.amountETH, 0);
  }, [reward.tokens]);

  const TokenPercentages = () => (
    <>
      {reward.tokens.map((token, i) => {
        const percentage = ((token.amountETH / totalAmount) * 100).toFixed(2);
        const bgColor = colors[i % colors.length];
        return (
          <div
            key={`percentage-${i}`}
            className='h-full'
            style={{ width: `${percentage}%`, backgroundColor: bgColor }}
          ></div>
        );
      })}
    </>
  );

  return (
    <div className='mb-4 px-4'>
      <div className='mb-3'>
        <div className='h-[9px] rounded flex w-full overflow-hidden relative'>
          <TokenPercentages />
        </div>
      </div>

      <div className='text-sm flex items-center justify-between'>
        {reward.tokens.map((token, i) => {
          const percentage = parseFloat((token.amountETH / totalAmount) * 100).toFixed(2);
          const bgColor = colors[i % colors.length];
          return (

            <div className='flex items-center gap-1' key={`token-${i}`}>
              <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: bgColor }}></div>
              <div>
                <p>
                  {token.name} <span className='text-[#7A86A5]'>({percentage}%)</span>
                </p>
              </div>
            </div>

          );
        })}
      </div>
    </div>
  );
};