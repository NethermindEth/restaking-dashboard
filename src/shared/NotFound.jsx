export default function NotFound() {
  return (
    <div className="flex flex-col h-full">
      <div className="font-display font-medium mb-4 text-foreground-1 text-3xl">
        Not found
      </div>
      <div className="bg-content1 border border-outline content-center flex-1 p-4 rounded-lg text-center">
        <span className="material-symbols-outlined text-outline text-[12rem]">
          &#xe811;
        </span>
      </div>
    </div>
  );
}
