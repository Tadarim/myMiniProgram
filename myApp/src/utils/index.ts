export const genUrl = (url, params: Record<string, any>) => {
  const queryString = Object.keys(params)
    .map((key) => {
      // 确保值已经是字符串，如果不是则转换
      const value = params[key] == null ? '' : String(params[key]);
      return `${key}=${encodeURIComponent(value)}`;
    })
    .join('&');
  return `${url}?${queryString}`;
};
