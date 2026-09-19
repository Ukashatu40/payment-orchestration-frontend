export interface LiveRegionProps {
  message: string;
  /** assertive interrupts (e.g. circuit breaker OPEN); polite waits its
   * turn (e.g. a new DLQ item, a transaction reaching a terminal state). */
  politeness: "polite" | "assertive";
}

/**
 * Visually-hidden announcer for state changes that arrive without
 * navigation — a toast alone misses screen-reader users entirely. Render
 * with an empty `message` by default and only set real text on an actual
 * transition (not every poll tick), or this becomes noise.
 */
export function LiveRegion({ message, politeness }: LiveRegionProps) {
  return (
    <div
      role={politeness === "assertive" ? "alert" : "status"}
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}
