import { useState, useEffect, useRef, useCallback } from "react";

const BINANCE_WS_URL = "wss://stream.binance.com:9443/ws/btcusdt@trade";
const MAX_DATA_POINTS = 100;
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;
const PRICE_UPDATE_INTERVAL = 1000; // Grafik güncelleme aralığı (ms)

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
  const previousPriceRef = useRef(null);

  // Bağlantıyı kapat
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
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
      };

      ws.onmessage = (event) => {
        try {
          const trade = JSON.parse(event.data);

          // Trade verisi: { e: 'trade', E: timestamp, s: 'BTCUSDT', p: price, q: quantity, ... }
          const price = parseFloat(trade.p);
          const quantity = parseFloat(trade.q);
          const timestamp = trade.T;
          const isBuyerMaker = trade.m; // Satıcı mı alıcı mı?

          // Önceki fiyat referansını güncelle
          if (previousPriceRef.current === null) {
            previousPriceRef.current = price;
          }

          // Mevcut fiyatı güncelle
          setCurrentPrice({
            price,
            timestamp,
            isUp: price > previousPriceRef.current,
            isDown: price < previousPriceRef.current,
            change: price - previousPriceRef.current,
            changePercent:
              ((price - previousPriceRef.current) / previousPriceRef.current) *
              100,
          });

          previousPriceRef.current = price;

          // Grafik verisi güncelle
          setPriceData((prev) => {
            const newData = [
              ...prev,
              {
                time: timestamp,
                price: price,
                formattedTime: new Date(timestamp).toLocaleTimeString("tr-TR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }),
              },
            ];

            // Son 100 veri noktası
            return newData.slice(-MAX_DATA_POINTS);
          });

          // Son işlemler listesi
          setRecentTrades((prev) => {
            const newTrade = {
              id: trade.t,
              price,
              quantity,
              timestamp,
              isBuy: !isBuyerMaker,
              total: price * quantity,
            };

            return [newTrade, ...prev].slice(0, 20); // Son 20 işlem
          });

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
        setError("Bağlantı hatası oluştu");
      };

      ws.onclose = (event) => {
        console.log("🔌 WebSocket bağlantı kapandı:", event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;

        // Otomatik yeniden bağlanma
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current += 1;
          console.log(
            `🔄 Yeniden bağlanılıyor... (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`,
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, RECONNECT_DELAY);
        } else {
          setError("Maksimum yeniden bağlanma denemesi aşıldı");
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error("❌ Bağlantı hatası:", err);
      setError(err.message);
    }
  }, []); // disconnect dependency kaldırıldı

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
