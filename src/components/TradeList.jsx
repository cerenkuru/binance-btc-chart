import { ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";
import { formatPrice, formatQuantity, formatTime } from "../utils/formatters";

/* Son işlemler */
const TradeList = ({ recentTrades }) => {
  if (!recentTrades || recentTrades.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-lg h-96">
        <h3 className="text-xl font-bold text-foreground mb-4">Son İşlemler</h3>
        <div className="flex items-center justify-center h-80">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">
              İşlemler bekleniyor...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-foreground">Son İşlemler</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span>Canlı</span>
        </div>
      </div>

      <div className="space-y-1 overflow-y-auto max-h-[500px] pr-2 scroll-smooth">
        <div className="grid grid-cols-4 gap-4 pb-2 border-b border-border text-xs font-semibold text-gray-500 dark:text-gray-400 sticky top-0 bg-card">
          <div>Fiyat (USDT)</div>
          <div className="text-right">Miktar (BTC)</div>
          <div className="text-right">Toplam (USDT)</div>
          <div className="text-right">Zaman</div>
        </div>

        {recentTrades.map((trade, index) => {
          const isBuy = trade.isBuy;
          const colorClass = isBuy ? "text-green-500" : "text-red-500";

          return (
            <div
              key={`${trade.id}-${index}`}
              className={`grid grid-cols-4 gap-4 py-2 px-2 rounded transition-all duration-200`}
            >
              <div
                className={`flex items-center gap-1 font-semibold ${colorClass}`}
              >
                {isBuy ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                <span className="text-sm">{formatPrice(trade.price, 2)}</span>
              </div>

              <div className="text-right text-sm text-foreground">
                {formatQuantity(trade.quantity, 6)}
              </div>

              <div className="text-right text-sm text-gray-600 dark:text-gray-400">
                {formatPrice(trade.total, 2)}
              </div>

              <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                {formatTime(trade.timestamp)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Alış</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Satış</span>
          </div>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Toplam: {recentTrades.length} işlem
        </div>
      </div>
    </div>
  );
};

export default TradeList;
