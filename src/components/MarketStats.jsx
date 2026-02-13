import { TrendingUp, TrendingDown, BarChart3, DollarSign } from "lucide-react";

/**
 * Piyasa istatistikleri kartı
 */
const MarketStats = ({ stats, currentPrice }) => {
  if (!currentPrice || !stats) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const priceChange24h = currentPrice.price - stats.low24h;
  const priceChange24hPercent = ((priceChange24h / stats.low24h) * 100).toFixed(
    2,
  );
  const isPositive = priceChange24h >= 0;

  const spread = stats.high24h - stats.low24h;
  const spreadPercent = ((spread / stats.low24h) * 100).toFixed(2);

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">
            Piyasa İstatistikleri
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Son 24 Saat
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-1 mb-2">
            {isPositive ? (
              <TrendingUp className="w-3 h-3 text-green-500" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-500" />
            )}
            <span className="text-xs text-gray-600 dark:text-gray-400">
              24h Değişim
            </span>
          </div>
          <p
            className={`text-lg font-bold ${isPositive ? "text-green-500" : "text-red-500"}`}
          >
            {isPositive ? "+" : ""}
            {priceChange24hPercent}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ${priceChange24h.toFixed(2)}
          </p>
        </div>

        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-1 mb-2">
            <BarChart3 className="w-3 h-3 text-blue-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Spread
            </span>
          </div>
          <p className="text-lg font-bold text-foreground">
            ${spread.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {spreadPercent}%
          </p>
        </div>

        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-1 mb-2">
            <DollarSign className="w-3 h-3 text-yellow-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Ortalama
            </span>
          </div>
          <p className="text-lg font-bold text-foreground">
            ${((stats.high24h + stats.low24h) / 2).toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">H+L / 2</p>
        </div>

        <div className="p-3 bg-gradient-to-br from-purple-500/10 to-blue-500/10 dark:from-purple-500/20 dark:to-blue-500/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-1 mb-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Volatilite
            </span>
          </div>
          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {spreadPercent}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {parseFloat(spreadPercent) < 1
              ? "Düşük"
              : parseFloat(spreadPercent) < 2
                ? "Orta"
                : "Yüksek"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarketStats;
