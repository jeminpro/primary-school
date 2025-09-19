export function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (diff < minute) return "Just now";
  if (diff < hour) return `${Math.floor(diff / minute)} minute${Math.floor(diff / minute) === 1 ? '' : 's'} ago`;
  if (diff < day) return `${Math.floor(diff / hour)} hour${Math.floor(diff / hour) === 1 ? '' : 's'} ago`;
  if (diff < week) return `${Math.floor(diff / day)} day${Math.floor(diff / day) === 1 ? '' : 's'} ago`;
  if (diff < month) return `${Math.floor(diff / week)} week${Math.floor(diff / week) === 1 ? '' : 's'} ago`;
  if (diff < year) return `${Math.floor(diff / month)} month${Math.floor(diff / month) === 1 ? '' : 's'} ago`;
  return `${Math.floor(diff / year)} year${Math.floor(diff / year) === 1 ? '' : 's'} ago`;
}