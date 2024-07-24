export default function NotFound() {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 font-display text-3xl font-medium text-foreground-1">
        Not found
      </div>
      <div className="flex-1 content-center rounded-lg border border-outline bg-content1 p-4 text-center">
        <span className="material-symbols-outlined text-[12rem] text-outline">
          &#xe811;
        </span>
      </div>
    </div>
  );
}
