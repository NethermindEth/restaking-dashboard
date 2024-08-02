import { formatETH, formatUSD } from '../../shared/formatters';
import { Group } from '@visx/group';
import { Pie } from '@visx/shape';
import { reduceState } from '../../shared/helpers';
import { Text } from '@visx/text';
import { useMutativeReducer } from 'use-mutative';
import { useTailwindBreakpoint } from '../../shared/useTailwindBreakpoint';

export default function LRTDistributionPieChart({
  lrtDistribution,
  lrtTVL,
  ethRate,
  parent
}) {
  const compact = !useTailwindBreakpoint('lg');
  const [state, dispatch] = useMutativeReducer(reduceState, {
    active: null,
    activeColor: null
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
          data={lrtDistribution}
          innerRadius={({ data }) => {
            const shift =
              state.active?.name === data.name ? 50 - shiftDelta : 50;
            return radius - shift;
          }}
          outerRadius={({ data }) => {
            const shift = state.active?.name === data.name ? shiftDelta : 0;
            return radius + shift;
          }}
          padAngle={0.015}
          pieSortValues={() => 1}
          pieValue={data => data.tvl}
        >
          {pie => {
            return pie.arcs.map((arc, i) => {
              const color = `hsl(var(--app-chart-${i + 1}))`;
              return (
                <path
                  className="cursor-pointer"
                  d={pie.path(arc)}
                  fill={color}
                  key={arc.data.name}
                  onPointerEnter={() =>
                    dispatch({
                      active: arc.data,
                      activeColor: color
                    })
                  }
                  onPointerLeave={() =>
                    dispatch({
                      active: null,
                      activeColor: null
                    })
                  }
                ></path>
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
              {formatUSD(state.active.tvl * ethRate)}
            </Text>
            <Text
              className="text-sm"
              dy={10}
              fill="hsl(var(--app-foreground-1))"
              textAnchor="middle"
            >
              {formatETH(state.active.tvl)}
            </Text>
            <Text
              className="text-sm"
              dy={30 + 8}
              fill={state.activeColor}
              textAnchor="middle"
            >
              {state.active.name}
            </Text>
          </>
        ) : (
          <>
            <Text dy={0} fill="hsl(var(--app-foreground))" textAnchor="middle">
              {formatUSD(lrtTVL * ethRate)}
            </Text>
            <Text
              className="text-sm"
              dy={20}
              fill="hsl(var(--app-foreground-1))"
              textAnchor="middle"
            >
              {formatETH(lrtTVL)}
            </Text>
          </>
        )}
      </Group>
    </svg>
  );
}

const shiftDelta = 4;
const margin = {
  top: shiftDelta,
  right: shiftDelta,
  bottom: shiftDelta,
  left: shiftDelta
};
