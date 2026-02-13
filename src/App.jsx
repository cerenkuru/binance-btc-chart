import React, { useState, useEffect } from "react";
import { Moon, Sun, Wifi, WifiOff, RefreshCw, Github } from "lucide-react";
import useBinanceWebSocket from "./hooks/useBinanceWebSocket";
import PriceCard from "./components/PriceCard";
import PriceChart from "./components/PriceChart";
import TradeList from "./components/TradeList";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : true;
  });

  const {
    isConnected,
    currentPrice,
    priceData,
    recentTrades,
    stats,
    error,
    reconnect,
  } = useBinanceWebSocket();

  // Dark mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo ve Başlık */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">₿</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Binance BTC/USDT
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Canlı Fiyat Takibi
                </p>
              </div>
            </div>

            {/* Sağ Kontroller */}
            <div className="flex items-center gap-3">
              {/* Bağlantı Durumu */}
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <>
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 dark:bg-green-500/20 rounded-lg">
                      <Wifi className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600 dark:text-green-400 hidden sm:inline">
                        Bağlı
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 dark:bg-red-500/20 rounded-lg">
                      <WifiOff className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-red-600 dark:text-red-400 hidden sm:inline">
                        Bağlantı Yok
                      </span>
                    </div>
                    <button
                      onClick={reconnect}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Yeniden Bağlan"
                    >
                      <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </>
                )}
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={isDarkMode ? "Açık Tema" : "Koyu Tema"}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* GitHub Link */}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="GitHub"
              >
                <Github className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </a>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 dark:bg-red-500/20 border border-red-500 rounded-lg">
            <div className="flex items-center gap-2">
              <WifiOff className="w-5 h-5 text-red-500" />
              <p className="text-red-600 dark:text-red-400 font-medium">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol Kolon - Fiyat Kartı */}
          <div className="lg:col-span-1">
            <PriceCard currentPrice={currentPrice} stats={stats} />
          </div>

          {/* Orta Kolon - Grafik */}
          <div className="lg:col-span-2">
            <PriceChart priceData={priceData} isDarkMode={isDarkMode} />
          </div>
        </div>

        {/* İşlem Listesi - Full Width */}
        <div className="mt-6">
          <TradeList recentTrades={recentTrades} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
              © 2025 Binance BTC/USDT Tracker. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <a href="#" className="hover:text-foreground transition-colors">
                Gizlilik
              </a>
              <span>•</span>
              <a href="#" className="hover:text-foreground transition-colors">
                Kullanım Koşulları
              </a>
              <span>•</span>
              <a
                href="https://www.binance.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Binance API
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
