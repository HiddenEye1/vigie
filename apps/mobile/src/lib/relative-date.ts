const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

const fullDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
});

/** Date relative en français parlé : « à l'instant », « hier », « il y a 3 jours »… */
export function formatRelativeDate(isoDate: string, now: Date = new Date()): string {
  const date = new Date(isoDate);
  const elapsed = now.getTime() - date.getTime();

  if (elapsed < MINUTE_MS) {
    return 'à l’instant';
  }
  if (elapsed < HOUR_MS) {
    const minutes = Math.floor(elapsed / MINUTE_MS);
    return `il y a ${String(minutes)} min`;
  }

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const dayDiff = Math.round((startOfToday - startOfDate) / DAY_MS);

  if (dayDiff <= 0) {
    const hours = Math.floor(elapsed / HOUR_MS);
    return `il y a ${String(hours)} h`;
  }
  if (dayDiff === 1) {
    return 'hier';
  }
  if (dayDiff < 7) {
    return `il y a ${String(dayDiff)} jours`;
  }
  return fullDateFormatter.format(date);
}
