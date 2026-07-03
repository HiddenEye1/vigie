const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

/** Au-delà de ce nombre de clés, un balayage global purge les entrées expirées. */
const SWEEP_THRESHOLD = 50_000;

export interface RateLimits {
  readonly perHour: number;
  readonly perDay: number;
}

/**
 * Limiteur en mémoire à fenêtres glissantes (heure + jour), par clé.
 * Une requête n'est comptée que si TOUTES les clés (device_id ET IP) sont
 * sous leurs limites (§6). Suffisant pour une instance unique en v1 —
 * le passage multi-instances est consigné dans BACKLOG.md.
 */
export class RateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly limits: RateLimits,
    private readonly now: () => number = () => Date.now(),
  ) {}

  /** Retourne true si la requête est autorisée (et la comptabilise). */
  consume(keys: readonly string[]): boolean {
    const timestamp = this.now();
    const dayFloor = timestamp - DAY_MS;
    const hourFloor = timestamp - HOUR_MS;

    if (this.hits.size > SWEEP_THRESHOLD) {
      this.sweep(dayFloor);
    }

    const windows = keys.map((key) => {
      const kept = (this.hits.get(key) ?? []).filter((t) => t > dayFloor);
      this.hits.set(key, kept);
      return kept;
    });

    const allowed = windows.every(
      (window) =>
        window.length < this.limits.perDay &&
        window.filter((t) => t > hourFloor).length < this.limits.perHour,
    );

    if (allowed) {
      for (const window of windows) {
        window.push(timestamp);
      }
    }
    return allowed;
  }

  private sweep(dayFloor: number): void {
    for (const [key, timestamps] of this.hits) {
      const kept = timestamps.filter((t) => t > dayFloor);
      if (kept.length === 0) {
        this.hits.delete(key);
      } else {
        this.hits.set(key, kept);
      }
    }
  }
}
