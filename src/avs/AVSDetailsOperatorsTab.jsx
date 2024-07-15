// @ts-check
import {
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Skeleton
} from '@nextui-org/react';
import React, { useEffect, useMemo } from 'react';
import { useMutativeReducer } from 'use-mutative';
import { reduceState } from '../shared/helpers';
import { useServices } from '../@services/ServiceContext';
import { useParams } from 'react-router-dom';
import { ParentSize } from '@visx/responsive';
import OperatorsTabLineChart from './charts/OperatorsTabLineChart';

export default function AVSDetailsOperatorsTab({ operators }) {
  const { address } = useParams();
  const [state, dispatch] = useMutativeReducer(reduceState, {
    points: undefined,
    isChartLoading: true
  });

  const { avsService } = useServices();

  useEffect(() => {
    (async () => {
      dispatch({ isChartLoading: true });

      const response = await avsService.getAVSOperatorsOvertime(address);
      dispatch({ points: response, isChartLoading: false });
    })();
  }, []);

  // our endpoint only returns up to yesterdays data. We need to append today's data point
  // into the graph
  const currentPoint = useMemo(
    () => ({
      timestamp: new Date(),
      operators
    }),
    [operators]
  );

  return (
    <>
      {/*line chart*/}
      {state.isChartLoading ? (
        <div className="bg-content1 border border-outline flex items-center justify-center h-[512px] p-4 rounded-lg w-full">
          <Spinner color="primary" size="lg" />
        </div>
      ) : (
        <ParentSize>
          {parent => (
            <OperatorsTabLineChart
              height={512}
              points={state.points.concat(currentPoint)}
              width={parent.width}
            />
          )}
        </ParentSize>
      )}

      {/*layout*/}
      <div className="flex w-full h-full">
        <div className="w-full mt-4">
          <AVSOperatorsList />
        </div>
      </div>
    </>
  );
}

function AVSOperatorsList() {
  return (
    <Table
      aria-label="List of operators registered for AVS"
      classNames={{
        wrapper: 'border border-outline rounded-lg px-0',
        th: 'border-b border-outline bg-transparent text-sm text-foreground px-4',
        tr: 'border-b border-outline last:border-none'
      }}
      layout="fixed"
      topContent={
        <div className="p-4 text-foreground-1 text-medium">All operators</div>
      }
    >
      <TableHeader>
        <TableColumn className="w-1/3">Operators</TableColumn>
        <TableColumn className="w-1/3 text-center">Share</TableColumn>
        <TableColumn className="w-1/3 text-end">TVL</TableColumn>
      </TableHeader>
      <TableBody>
        {[...new Array(10)].map((_, i) => (
          <TableRow key={i}>
            <TableCell className="">
              <Skeleton className="h-5 w-3/4 rounded-md" />
            </TableCell>
            <TableCell>
              <div className="flex justify-center">
                <Skeleton className="h-5 w-1/2 rounded-md" />
              </div>
            </TableCell>
            <TableCell className="flex justify-end">
              <Skeleton className="h-10 w-1/2 rounded-md" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
