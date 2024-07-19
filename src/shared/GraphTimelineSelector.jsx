import React from 'react';

export default function GraphTimelineSelector({
  timelineTab,
  onTimelineChange
}) {
  return (
    <div className="flex w-full items-center gap-3 rounded-lg border border-outline p-2 md:w-fit">
      <div
        className={`w-full min-w-fit cursor-pointer rounded-md px-6 py-1 text-center text-foreground-2 md:w-20 ${
          timelineTab === '7days' &&
          'border border-outline bg-default text-foreground-active'
        }`}
        onClick={() => onTimelineChange('7days')}
      >
        7D
      </div>

      <div
        className={`w-full min-w-fit cursor-pointer rounded-md px-6 py-1 text-center text-foreground-2 md:w-20 ${
          timelineTab === '30days' &&
          'border border-outline bg-default text-foreground-active'
        }`}
        onClick={() => onTimelineChange('30days')}
      >
        30D
      </div>

      <div
        className={`w-full min-w-fit cursor-pointer rounded-md px-6 py-1 text-center text-foreground-2 md:w-20 ${
          timelineTab === 'all' &&
          'border border-outline bg-default text-foreground-active'
        }`}
        onClick={() => onTimelineChange('all')}
      >
        All
      </div>
    </div>
  );
}
