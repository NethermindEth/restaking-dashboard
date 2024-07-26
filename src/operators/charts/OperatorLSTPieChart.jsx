import { formatETH, formatUSD } from '../../shared/formatters';
import { Group } from '@visx/group';
import { Pie } from '@visx/shape';
import { reduceState } from '../../shared/helpers';
import { Text } from '@visx/text';
import { useMutativeReducer } from 'use-mutative';
import { useTailwindBreakpoint } from '../../shared/useTailwindBreakpoint';

export default function OperatorLSTPieChart({
  ethRate,
  lstDistribution,
  lstTVL,
  parent
}) {
  const compact = !useTailwindBreakpoint('lg');
  const [state, dispatch] = useMutativeReducer(reduceState, {
    active: undefined,
    activeColor: undefined
  });

  // minimum height of 300 for when we only have 1 or 2 strategies, causing
  // the card to be too short to display the full pie chart
  const height = Math.max(300, parent.height);
  // set a max width of 300 when we are in larger screens and have a flex col layout
  const width = compact ? parent.width : Math.min(300, parent.width);
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const radius = Math.min(innerWidth, innerHeight) / 2;
  const centerY = innerHeight / 2;
  const centerX = innerWidth / 2;

  return (
    <svg height={height} width={width}>
      <Group
        className="relative"
        left={centerX + margin.left}
        top={centerY + margin.top}
      >
        <Pie
          cornerRadius={0}
          data={lstDistribution}
          innerRadius={radius - 50}
          outerRadius={radius}
          padAngle={0}
          pieSortValues={() => 1}
          pieValue={data => data.tokensInETH}
        >
          {pie => {
            return pie.arcs.map((arc, i) => {
              const color = `hsl(var(--app-chart-${i + 1}))`;
              return (
                <g
                  key={arc.data.symbol}
                  onMouseEnter={() =>
                    dispatch({
                      active: arc.data,
                      activeColor: color
                    })
                  }
                  onMouseLeave={() =>
                    dispatch({
                      active: undefined,
                      activeColor: undefined
                    })
                  }
                  style={{ cursor: 'pointer' }}
                >
                  <path d={pie.path(arc)} fill={color}></path>
                </g>
              );
            });
          }}
        </Pie>

        {state.active ? (
          <>
            <Text
              dy={-10}
              fill="hsl(var(--app-foreground))"
              textAnchor="middle"
            >
              {formatUSD(state.active.tokensInETH * ethRate, true)}
            </Text>

            <Text
              className="text-xs"
              dy={10}
              fill={state.activeColor}
              textAnchor="middle"
            >
              {formatETH(state.active.tokensInETH, true)}
            </Text>

            <Text
              className="text-sm"
              dy={30 + 8}
              fill="hsl(var(--app-foreground-1))"
              textAnchor="middle"
            >
              {state.active.symbol}
            </Text>
          </>
        ) : (
          <>
            <Text dy={0} fill="hsl(var(--app-foreground))" textAnchor="middle">
              {formatUSD(lstTVL * ethRate, true)}
            </Text>

            <Text
              className="text-sm"
              dy={20}
              fill="hsl(var(--app-success))"
              textAnchor="middle"
            >
              {formatETH(lstTVL, true)}
            </Text>
          </>
        )}
      </Group>
    </svg>
  );
}

const margin = { top: 0, right: 0, bottom: 0, left: 0 };
