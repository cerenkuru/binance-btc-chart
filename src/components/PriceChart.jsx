import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

/**
 * Özel Tooltip komponenti
 */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
        <p className="text-sm font-semibold text-foreground">
          ${data.price.toFixed(2)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {data.formattedTime}
        </p>
      </div>
    );
  }
  return null;
};

/**
 * Canlı fiyat grafiğini gösteren komponent
 */
const PriceChart = ({ priceData, isDarkMode }) => {
  if (!priceData || priceData.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-bold text-foreground mb-6">
          Canlı Fiyat Grafiği
        </h3>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">
              Veri bekleniyor...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // İlk ve son fiyatı karşılaştır
  const firstPrice = priceData[0]?.price || 0;
  const lastPrice = priceData[priceData.length - 1]?.price || 0;
  const isPositive = lastPrice >= firstPrice;

  // Gradient renkleri
  const strokeColor = isPositive ? "#10b981" : "#ef4444";
  const fillColor = isPositive ? "url(#colorGreen)" : "url(#colorRed)";

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-20">
        <h3 className="text-xl font-bold text-foreground">
          Canlı Fiyat Grafiği
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {priceData.length} veri noktası
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={priceData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDarkMode ? "#374151" : "#e5e7eb"}
            opacity={0.3}
          />

          <XAxis
            dataKey="formattedTime"
            stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              const parts = value.split(":");
              return `${parts[0]}:${parts[1]}`;
            }}
          />

          <YAxis
            stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
            tick={{ fontSize: 12 }}
            domain={["auto", "auto"]}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />

          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey="price"
            stroke={strokeColor}
            strokeWidth={2}
            fill={fillColor}
            animationDuration={300}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-6 flex items-center justify-center gap-5 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Yükseliş</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Düşüş</span>
        </div>
      </div>
    </div>
  );
};

export default PriceChart;
