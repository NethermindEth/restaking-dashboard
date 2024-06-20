export default function GraphTimelineSelector({
  timelineTab,
  onTimelineChange
}) {
  return (
    <div className="border border-outline p-2 rounded-lg w-full md:w-fit flex items-center gap-3">
      <div
        className={`text-center text-foreground-2 rounded-md py-1 px-6 min-w-fit w-full md:w-20 cursor-pointer ${
          timelineTab === '7days' &&
          'bg-default border border-outline text-foreground-active'
        }`}
        onClick={() => onTimelineChange('7days')}
      >
        7D
      </div>

      <div
        className={`text-center text-foreground-2 rounded-md py-1 px-6 min-w-fit w-full md:w-20 cursor-pointer ${
          timelineTab === '30days' &&
          'bg-default border border-outline text-foreground-active'
        }`}
        onClick={() => onTimelineChange('30days')}
      >
        30D
      </div>

      <div
        className={`text-center text-foreground-2 rounded-md py-1 px-6 min-w-fit w-full md:w-20 cursor-pointer ${
          timelineTab === 'all' &&
          'bg-default border border-outline text-foreground-active'
        }`}
        onClick={() => onTimelineChange('all')}
      >
        All
      </div>
    </div>
  );
}
