export function inXHours(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}
