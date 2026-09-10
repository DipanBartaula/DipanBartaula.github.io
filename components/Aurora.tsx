/**
 * Soft, slowly drifting colour fields behind a section — indigo (compute),
 * cyan (signal) and amber (energy). Pure CSS; frozen under reduced motion via
 * the global media query in globals.css.
 */
export default function Aurora({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`aurora pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <span className="aurora-blob aurora-a" />
      <span className="aurora-blob aurora-b" />
      <span className="aurora-blob aurora-c" />
    </div>
  );
}
