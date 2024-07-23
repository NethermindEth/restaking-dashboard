export default function ErrorMessage({ className, error, message }) {
  return (
    <div
      className={`bg-error-200 text-foreground-invert flex flex-row items-center gap-1 rounded py-0.5 pe-2 ps-0.5 text-sm ${className}`}
    >
      <span className="material-symbols-outlined text-error-800">close</span>
      {error?.message ?? message}
    </div>
  );
}
