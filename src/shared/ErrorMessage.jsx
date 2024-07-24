export default function ErrorMessage({ className, error, message }) {
  return (
    <div
      className={`flex flex-row items-center gap-1 rounded bg-error-200 py-0.5 pe-2 ps-0.5 text-sm text-foreground-invert ${className}`}
    >
      <span className="material-symbols-outlined text-error-800">close</span>
      {error?.message ?? message}
    </div>
  );
}
