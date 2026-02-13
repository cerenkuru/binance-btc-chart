/**
 * Fiyatı formatlar
 * @param {number|string} price - Fiyat
 * @param {number} decimals - Ondalık basamak sayısı
 * @returns {string} Formatlanmış fiyat
 */
export const formatPrice = (price, decimals = 2) => {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return num.toLocaleString("tr-TR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Miktarı formatlar
 * @param {number|string} quantity - Miktar
 * @param {number} decimals - Ondalık basamak sayısı
 * @returns {string} Formatlanmış miktar
 */
export const formatQuantity = (quantity, decimals = 6) => {
  const num = typeof quantity === "string" ? parseFloat(quantity) : quantity;
  return num.toLocaleString("tr-TR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Timestamp'i saat olarak formatlar
 * @param {number} timestamp - Unix timestamp (ms)
 * @returns {string} HH:MM:SS formatında saat
 */
export const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

/**
 * Timestamp'i kısa saat olarak formatlar
 * @param {number} timestamp - Unix timestamp (ms)
 * @returns {string} HH:MM formatında saat
 */
export const formatTimeShort = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Hacmi kısaltır (1.2K, 1.5M gibi)
 * @param {number} volume - Hacim
 * @returns {string} Kısaltılmış hacim
 */
export const formatVolume = (volume) => {
  if (volume >= 1000000) {
    return (volume / 1000000).toFixed(2) + "M";
  } else if (volume >= 1000) {
    return (volume / 1000).toFixed(2) + "K";
  }
  return volume.toFixed(2);
};

/**
 * Fiyat değişimini hesaplar
 * @param {number} currentPrice - Şu anki fiyat
 * @param {number} previousPrice - Önceki fiyat
 * @returns {object} { change: number, changePercent: number }
 */
export const calculatePriceChange = (currentPrice, previousPrice) => {
  const change = currentPrice - previousPrice;
  const changePercent = (change / previousPrice) * 100;
  return {
    change,
    changePercent,
    isPositive: change >= 0,
  };
};

/**
 * Renk sınıfını döndürür (yeşil/kırmızı)
 * @param {boolean} isPositive - Pozitif mi?
 * @returns {string} Tailwind CSS sınıfları
 */
export const getPriceColorClass = (isPositive) => {
  return isPositive ? "text-green-500" : "text-red-500";
};

/**
 * Arka plan renk sınıfını döndürür
 * @param {boolean} isPositive - Pozitif mi?
 * @returns {string} Tailwind CSS sınıfları
 */
export const getBgColorClass = (isPositive) => {
  return isPositive
    ? "bg-green-500/10 dark:bg-green-500/20"
    : "bg-red-500/10 dark:bg-red-500/20";
};
