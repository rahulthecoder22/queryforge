/** Subtle animated mesh behind app content — pointer-events none. */
export function AmbientBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div className="qf-ambient-blob qf-ambient-blob--a absolute -left-1/4 top-0 h-[min(80vh,720px)] w-[min(80vw,720px)] rounded-full opacity-40 blur-[100px]" />
      <div className="qf-ambient-blob qf-ambient-blob--b absolute -right-1/4 bottom-0 h-[min(70vh,600px)] w-[min(70vw,600px)] rounded-full opacity-35 blur-[100px]" />
      <div className="qf-ambient-grid absolute inset-0 opacity-[0.35]" />
    </div>
  );
}
