import { describe, expect, it } from 'vitest';

import { RateLimiter } from './rate-limiter.js';

function makeLimiter(
  perHour: number,
  perDay: number,
): {
  limiter: RateLimiter;
  advance: (ms: number) => void;
} {
  let nowMs = 1_700_000_000_000;
  const limiter = new RateLimiter({ perHour, perDay }, () => nowMs);
  return {
    limiter,
    advance: (ms) => {
      nowMs += ms;
    },
  };
}

describe('RateLimiter', () => {
  it('bloque à la limite horaire puis débloque après une heure', () => {
    const { limiter, advance } = makeLimiter(2, 100);
    expect(limiter.consume(['device:a'])).toBe(true);
    expect(limiter.consume(['device:a'])).toBe(true);
    expect(limiter.consume(['device:a'])).toBe(false);

    advance(3_600_001);
    expect(limiter.consume(['device:a'])).toBe(true);
  });

  it('applique aussi la limite journalière', () => {
    const { limiter, advance } = makeLimiter(2, 3);
    expect(limiter.consume(['device:a'])).toBe(true);
    expect(limiter.consume(['device:a'])).toBe(true);
    advance(3_600_001); // nouvelle fenêtre horaire
    expect(limiter.consume(['device:a'])).toBe(true);
    expect(limiter.consume(['device:a'])).toBe(false); // 3/jour atteint

    advance(86_400_001);
    expect(limiter.consume(['device:a'])).toBe(true);
  });

  it('bloque si N’IMPORTE laquelle des clés dépasse (device OU ip)', () => {
    const { limiter } = makeLimiter(1, 100);
    expect(limiter.consume(['device:a', 'ip:1'])).toBe(true);
    // Autre appareil, même IP : l'IP est déjà à sa limite horaire.
    expect(limiter.consume(['device:b', 'ip:1'])).toBe(false);
    // Même appareil b, IP différente : autorisé (b n'a rien consommé).
    expect(limiter.consume(['device:b', 'ip:2'])).toBe(true);
  });

  it('ne comptabilise pas une requête refusée', () => {
    const { limiter } = makeLimiter(1, 2);
    expect(limiter.consume(['device:a', 'ip:1'])).toBe(true);
    expect(limiter.consume(['device:b', 'ip:1'])).toBe(false); // ip pleine, device:b non compté
    expect(limiter.consume(['device:b', 'ip:2'])).toBe(true); // b a encore son quota
  });

  it('isole les clés entre elles', () => {
    const { limiter } = makeLimiter(1, 1);
    expect(limiter.consume(['device:a'])).toBe(true);
    expect(limiter.consume(['device:b'])).toBe(true);
    expect(limiter.consume(['device:a'])).toBe(false);
  });
});
