const computeTimeAgo = (publishTime: number | string): number => {
  const now = new Date().getTime();
  return Math.floor((now - Number(publishTime)) / 86400000);
};

export default computeTimeAgo; 