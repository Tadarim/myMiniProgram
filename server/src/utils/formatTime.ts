const formatTime = (timeStamp: number | string): string => {
  const time = new Date(Number(timeStamp));
  return time.getHours().toString().padStart(2, "0") + ':' + time.getMinutes().toString().padStart(2, "0");
};

export default formatTime; 