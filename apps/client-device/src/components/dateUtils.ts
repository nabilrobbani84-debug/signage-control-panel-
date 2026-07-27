/**
 * Minimal date formatter to avoid adding date-fns to the client bundle.
 * Returns a human-readable HH:mm:ss timestamp.
 */
export function format(date: Date): string {
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}
