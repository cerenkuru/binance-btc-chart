import { useState, useEffect, useRef, useCallback } from "react";

const BINANCE_WS_URL = "wss://stream.binance.com:9443/ws/btcusdt@trade";
const MAX_DATA_POINTS = 100;
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;
const CHART_UPDATE_INTERVAL = 2000;
const PRICE_UPDATE_INTERVAL = 500;
const TRADE_UPDATE_INTERVAL = 1000;

/**
 * WebSocket close kodlarına göre hata mesajı döndürür
 */
const getCloseErrorMessage = (code) => {
  switch (code) {
    case 1002:
      return "WebSocket protokol hatası";
    case 1003:
      return "Desteklenmeyen veri formatı";
    case 1006:
      return "Bağlantı beklenmedik şekilde kapandı";
    case 1007:
      return "Geçersiz veri alındı";
    case 1008:
      return "Politika ihlali nedeniyle bağlantı kapatıldı";
    case 1009:
      return "Mesaj çok büyük";
    case 1010:
      return "Sunucu uzantısı gerekli";
    case 1011:
      return "Sunucu hatası";
    case 1012:
      return "Sunucu yeniden başlatılıyor";
    case 1013:
      return "Sunucu meşgul, lütfen tekrar deneyin";
    case 1014:
      return "Geçersiz gateway yanıtı";
    case 1015:
      return "TLS el sıkışma hatası";
    default:
      return `Bağlantı hatası (kod: ${code})`;
  }
};

/**
 * Binance WebSocket bağlantısını yöneten custom hook
 * @returns {object} WebSocket state ve verileri
 */
const useBinanceWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceData, setPriceData] = useState([]);
  const [recentTrades, setRecentTrades] = useState([]);
  const [stats, setStats] = useState({
    high24h: 0,
    low24h: Infinity,
    volume24h: 0,
    trades24h: 0,
  });
  const [error, setError] = useState(null);

  const wsRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef(null);
  const errorTimeoutRef = useRef(null);
  const previousPriceRef = useRef(null);

  // Buffer sistemi için ref'ler
  const priceBufferRef = useRef([]);
  const tradeBufferRef = useRef([]);
  const chartUpdateIntervalRef = useRef(null);
  const priceUpdateIntervalRef = useRef(null);
  const tradeUpdateIntervalRef = useRef(null);
  const latestPriceRef = useRef(null);
  const connectRef = useRef(null);
  const priceHistoryRef = useRef([]); // Son 1 dakikalık fiyatlar

  // Bağlantıyı kapat
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    if (chartUpdateIntervalRef.current) {
      clearInterval(chartUpdateIntervalRef.current);
    }

    if (priceUpdateIntervalRef.current) {
      clearInterval(priceUpdateIntervalRef.current);
    }

    if (tradeUpdateIntervalRef.current) {
      clearInterval(tradeUpdateIntervalRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  // WebSocket bağlantısını başlat
  const connect = useCallback(() => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        return;
      }

      console.log("🔌 Binance WebSocket bağlanıyor...");
      const ws = new WebSocket(BINANCE_WS_URL);

      ws.onopen = () => {
        console.log("✅ WebSocket bağlantı başarılı");
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;

        // Hata timeout'unu iptal et (bağlantı kuruldu)
        if (errorTimeoutRef.current) {
          clearTimeout(errorTimeoutRef.current);
          errorTimeoutRef.current = null;
        }

        // Grafik güncelleme interval'ını başlat (her 2 saniyede bir)
        chartUpdateIntervalRef.current = setInterval(() => {
          if (priceBufferRef.current.length > 0) {
            // Buffer'daki fiyatların ortalamasını al
            const avgPrice =
              priceBufferRef.current.reduce((sum, p) => sum + p.price, 0) /
              priceBufferRef.current.length;
            const lastTimestamp =
              priceBufferRef.current[priceBufferRef.current.length - 1]
                .timestamp;

            setPriceData((prev) => {
              const newData = [
                ...prev,
                {
                  time: lastTimestamp,
                  price: avgPrice,
                  formattedTime: new Date(lastTimestamp).toLocaleTimeString(
                    "tr-TR",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    },
                  ),
                },
              ];

              return newData.slice(-MAX_DATA_POINTS);
            });

            priceBufferRef.current = [];
          }
        }, CHART_UPDATE_INTERVAL);

        // Fiyat güncelleme interval'ını başlat (daha sık ama smooth)
        priceUpdateIntervalRef.current = setInterval(() => {
          if (latestPriceRef.current) {
            const price = latestPriceRef.current.price;
            const timestamp = latestPriceRef.current.timestamp;

            // Fiyat geçmişine ekle
            priceHistoryRef.current.push({ price, timestamp });

            // 1 dakikadan eski verileri temizle
            const oneMinuteAgo = timestamp - 60000;
            priceHistoryRef.current = priceHistoryRef.current.filter(
              (p) => p.timestamp > oneMinuteAgo,
            );

            // 1 dakika önceki fiyatı bul
            let priceOneMinuteAgo = price;
            if (priceHistoryRef.current.length > 0) {
              priceOneMinuteAgo = priceHistoryRef.current[0].price;
            }

            if (previousPriceRef.current === null) {
              previousPriceRef.current = price;
            }

            setCurrentPrice({
              price,
              timestamp,
              isUp: price > previousPriceRef.current,
              isDown: price < previousPriceRef.current,
              change: price - priceOneMinuteAgo,
              changePercent:
                ((price - priceOneMinuteAgo) / priceOneMinuteAgo) * 100,
            });

            previousPriceRef.current = price;
          }
        }, PRICE_UPDATE_INTERVAL);

        // Trade güncelleme interval'ını başlat (1 saniyede bir)
        tradeUpdateIntervalRef.current = setInterval(() => {
          if (tradeBufferRef.current.length > 0) {
            // Buffer'daki trade'leri al ve state'e ekle
            const newTrades = [...tradeBufferRef.current];

            setRecentTrades((prev) => {
              // En fazla 3 yeni trade ekle (daha smooth)
              const tradesToAdd = newTrades.slice(0, 3);
              const updated = [...tradesToAdd, ...prev].slice(0, 20);
              return updated;
            });

            // Buffer'ı temizle
            tradeBufferRef.current = [];
          }
        }, TRADE_UPDATE_INTERVAL);
      };

      ws.onmessage = (event) => {
        try {
          const trade = JSON.parse(event.data);

          const price = parseFloat(trade.p);
          const quantity = parseFloat(trade.q);
          const timestamp = trade.T;
          const isBuyerMaker = trade.m;

          // En son fiyatı sakla (interval'da kullanılacak)
          latestPriceRef.current = { price, timestamp };

          // Fiyatı buffer'a ekle (grafik için)
          priceBufferRef.current.push({ price, timestamp });

          // Trade'i buffer'a ekle (interval'da eklenecek)
          const newTrade = {
            id: trade.t,
            price,
            quantity,
            timestamp,
            isBuy: !isBuyerMaker,
            total: price * quantity,
          };

          tradeBufferRef.current.push(newTrade);

          // 24 saat istatistikleri
          setStats((prev) => ({
            high24h: Math.max(prev.high24h, price),
            low24h: Math.min(prev.low24h, price),
            volume24h: prev.volume24h + price * quantity,
            trades24h: prev.trades24h + 1,
          }));
        } catch (err) {
          console.error("❌ Mesaj parse hatası:", err);
        }
      };

      ws.onerror = (event) => {
        console.error("❌ WebSocket hatası:", event);

        // Önceki hata timeout'unu temizle
        if (errorTimeoutRef.current) {
          clearTimeout(errorTimeoutRef.current);
        }

        // Hata mesajını 2 saniye gecikmeyle göster
        // Eğer bu süre içinde bağlantı kurulursa onopen'da iptal edilecek
        errorTimeoutRef.current = setTimeout(() => {
          // Bağlantı durumuna göre hata mesajı
          if (ws.readyState === WebSocket.CLOSED) {
            setError("WebSocket bağlantısı kapatıldı");
          } else if (ws.readyState === WebSocket.CLOSING) {
            setError("WebSocket bağlantısı kapatılıyor");
          } else {
            setError(
              "Binance WebSocket'e bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.",
            );
          }
        }, 2000);
      };

      ws.onclose = (event) => {
        console.log("🔌 WebSocket bağlantı kapandı:", event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;

        // Interval'ları ve timeout'ları temizle
        if (chartUpdateIntervalRef.current) {
          clearInterval(chartUpdateIntervalRef.current);
        }
        if (priceUpdateIntervalRef.current) {
          clearInterval(priceUpdateIntervalRef.current);
        }
        if (tradeUpdateIntervalRef.current) {
          clearInterval(tradeUpdateIntervalRef.current);
        }
        if (errorTimeoutRef.current) {
          clearTimeout(errorTimeoutRef.current);
          errorTimeoutRef.current = null;
        }

        // Close kod kontrolü - Normal kapanma değilse hata göster
        if (event.code !== 1000 && event.code !== 1001) {
          const errorMessage = event.reason || getCloseErrorMessage(event.code);
          setError(errorMessage);
        }

        // Otomatik yeniden bağlanma
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current += 1;
          console.log(
            `🔄 Yeniden bağlanılıyor... (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`,
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            if (connectRef.current) {
              connectRef.current();
            }
          }, RECONNECT_DELAY);
        } else {
          setError(
            "Maksimum yeniden bağlanma denemesi aşıldı. Lütfen sayfayı yenileyin.",
          );
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error("❌ Bağlantı hatası:", err);

      // Önceki hata timeout'unu temizle
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }

      // Hata mesajını 2 saniye gecikmeyle göster
      errorTimeoutRef.current = setTimeout(() => {
        setError(err.message);
      }, 2000);
    }
  }, []);

  // Connect fonksiyonunu ref'e sakla
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  // Manuel yeniden bağlanma
  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    setError(null);
    connect();
  }, [connect, disconnect]);

  // Component mount/unmount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    currentPrice,
    priceData,
    recentTrades,
    stats,
    error,
    reconnect,
    disconnect,
  };
};

export default useBinanceWebSocket;
