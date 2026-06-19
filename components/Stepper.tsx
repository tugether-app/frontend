// Wizard progress: compact dots + (optional) numbered step rail. Per UI reference.

export function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-2.5">
      {Array.from({ length: total }, (_, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <span
            key={i}
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: done || active ? 30 : 8,
              background: done || active ? "#F4B740" : "#E6DECF",
            }}
          />
        );
      })}
    </div>
  );
}

export function StepRail({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center gap-3">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex flex-1 items-center gap-3 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full font-display font-bold ${
                  done
                    ? "bg-success text-white"
                    : active
                      ? "bg-gold text-ink"
                      : "bg-[#F1ECE2] text-[#BCB4A8]"
                }`}
              >
                {done ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-[11px] font-bold ${active || done ? "text-ink" : "text-[#BCB4A8]"}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="-mt-5 h-[3px] flex-1 rounded" style={{ background: done ? "#F4B740" : "#ECE7DE" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
