import React from 'react';

export default function SkeletonGraph() {
  return (
    <div className="bg-content1 rounded-lg border border-outline space-y-4 p-4 flex items-start flex-col justify-center lg:h-96">
      <div className="w-full pl-3 md:pl-8">
        <img src="/assets/graph-loading.svg" className="w-full" />
      </div>
    </div>
  );
}
