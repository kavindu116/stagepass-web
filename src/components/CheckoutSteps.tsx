const steps = ["Seats", "Details", "Payment"];

export function CheckoutSteps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="flex flex-1 flex-wrap justify-center gap-2.5 text-sm text-muted">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li key={label} className="flex items-center gap-2.5">
            {i > 0 && <span aria-hidden>—</span>}
            <span className={active ? "font-bold text-accent" : undefined} aria-current={active ? "step" : undefined}>
              {n} {label}
              {done && " ✓"}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
