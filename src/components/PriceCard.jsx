import React from "react";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import {
  formatPrice,
  getPriceColorClass,
  getBgColorClass,
} from "../utils/formatters";

/**
 * Fiyat bilgilerini gösteren kart komponenti
 */
const PriceCard = ({ currentPrice, stats }) => {
  if (!currentPrice) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const isPositive = currentPrice.isUp;
  const priceColorClass = getPriceColorClass(isPositive);
  const bgColorClass = getBgColorClass(isPositive);

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">₿</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">BTC/USDT</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Binance Spot
            </p>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 px-4 py-2 ${bgColorClass} rounded-lg`}
        >
          {isPositive ? (
            <TrendingUp className={`w-5 h-5 ${priceColorClass}`} />
          ) : (
            <TrendingDown className={`w-5 h-5 ${priceColorClass}`} />
          )}
          <span className={`font-semibold ${priceColorClass}`}>
            {isPositive ? "+" : ""}
            {currentPrice.changePercent.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Güncel Fiyat */}
        <div
          className={`${currentPrice.isUp ? "animate-pulse-green" : currentPrice.isDown ? "animate-pulse-red" : ""}`}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Güncel Fiyat
          </p>
          <p className={`text-4xl font-bold ${priceColorClass}`}>
            ${formatPrice(currentPrice.price, 2)}
          </p>
        </div>

        {/* İstatistikler Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              24s Yüksek
            </p>
            <p className="text-lg font-semibold text-green-500">
              ${formatPrice(stats.high24h, 2)}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              24s Düşük
            </p>
            <p className="text-lg font-semibold text-red-500">
              ${formatPrice(stats.low24h, 2)}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              İşlem Sayısı
            </p>
            <p className="text-lg font-semibold text-foreground flex items-center gap-1">
              <Activity className="w-4 h-4" />
              {stats.trades24h.toLocaleString("tr-TR")}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Toplam Hacim
            </p>
            <p className="text-lg font-semibold text-foreground">
              ${(stats.volume24h / 1000000).toFixed(2)}M
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceCard;
