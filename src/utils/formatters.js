export const formatPrice = (price, decimals = 2) => {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return num.toLocaleString("tr-TR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatQuantity = (quantity, decimals = 6) => {
  const num = typeof quantity === "string" ? parseFloat(quantity) : quantity;
  return num.toLocaleString("tr-TR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const formatTimeShort = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatVolume = (volume) => {
  if (volume >= 1000000) {
    return (volume / 1000000).toFixed(2) + "M";
  } else if (volume >= 1000) {
    return (volume / 1000).toFixed(2) + "K";
  }
  return volume.toFixed(2);
};

export const calculatePriceChange = (currentPrice, previousPrice) => {
  const change = currentPrice - previousPrice;
  const changePercent = (change / previousPrice) * 100;
  return {
    change,
    changePercent,
    isPositive: change >= 0,
  };
};

export const getPriceColorClass = (isPositive) => {
  return isPositive ? "text-green-500" : "text-red-500";
};

export const getBgColorClass = (isPositive) => {
  return isPositive
    ? "bg-green-500/10 dark:bg-green-500/20"
    : "bg-red-500/10 dark:bg-red-500/20";
};
