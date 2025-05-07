export const formatTimeAgo = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}秒前`;
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}分钟前`;
  } else if (seconds < 86400) {
    return `${Math.floor(seconds / 3600)}小时前`;
  } else {
    return `${Math.floor(seconds / 86400)}天前`;
  }
};
