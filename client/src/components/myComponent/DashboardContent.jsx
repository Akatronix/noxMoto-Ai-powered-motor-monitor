import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  Zap,
  Thermometer,
  Activity,
  Power,
  Bell,
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  Gauge,
  ChevronRight,
  ShieldAlert,
  Clock,
  RotateCcw,
} from "lucide-react";
import { useUserDataStore } from "@/stores/userDataStore";
import { toast } from "sonner";
import api from "@/services/api";

const COLORS = {
  bg: "bg-[#0b0e14]",
  card: "bg-[#151921]",
  border: "border-[#1f252e]",
  current: "#f59e0b",
  temp: "#ef4444",
  vibration: "#a855f7",
  accent: "#10b981",
  ai: "#3b82f6",
  warning: "#f59e0b",
  danger: "#ef4444",
  success: "#10b981",
};

const MAX_DATA_POINTS = 20;

const MOTOR_DATA = [
  { time: "01:39 PM", current: 15, temp: 42, vibration: 2.1 },
  { time: "01:39:30", current: 18, temp: 45, vibration: 2.8 },
  { time: "01:40 PM", current: 19.5, temp: 46, vibration: 2.85 },
  { time: "01:40:30", current: 17, temp: 44, vibration: 2.4 },
  { time: "01:41 PM", current: 19, temp: 47, vibration: 2.9 },
  { time: "01:41:30", current: 20.2, temp: 48, vibration: 3.1 },
];

const cn = (...classes) => classes.filter(Boolean).join(" ");

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1f29] border border-gray-700 p-3 rounded-lg shadow-xl">
        <p className="text-gray-400 text-[10px] font-bold mb-2 uppercase">
          {label}
        </p>
        {payload.map((entry, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-sm font-medium"
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-300">{entry.name}:</span>
            <span className="text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const MetricCard = ({
  title,
  value,
  unit,
  status,
  trend,
  icon: Icon,
  colorHex,
  statusColor,
  maxValue,
}) => (
  <div
    className={`${COLORS.card} ${COLORS.border} border rounded-2xl p-5 relative overflow-hidden group hover:border-gray-700 transition-colors`}
  >
    <div className="flex justify-between items-start mb-4">
      <div
        className="p-2.5 rounded-xl"
        style={{ backgroundColor: `${colorHex}15` }}
      >
        <Icon className="w-6 h-6" style={{ color: colorHex }} />
      </div>
      <span
        className={`text-[10px] font-bold px-2 py-1 rounded-md bg-gray-800/50 ${trend >= 0 ? "text-green-400" : "text-red-400"}`}
      >
        {trend >= 0 ? "↗" : "↘"} {Math.abs(trend)}%
      </span>
    </div>
    <div>
      <p className="text-gray-500 text-[10px] font-bold mb-1 uppercase tracking-widest">
        {title}
      </p>
      <div className="flex items-baseline gap-1">
        <h3 className="text-2xl font-bold text-white tracking-tight">
          {value}
        </h3>
        <span className="text-gray-600 text-xs font-medium">{unit}</span>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">
            {status}
          </span>
        </div>
        {maxValue !== undefined && (
          <span className="text-[9px] font-bold text-gray-600">
            MAX: {maxValue}
          </span>
        )}
      </div>
    </div>
  </div>
);

const ChartCard = ({ title, legend, children }) => (
  <div className={`${COLORS.card} rounded-2xl p-5 border ${COLORS.border}`}>
    <div className="flex items-center justify-between mb-6">
      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
        {title}
      </h4>
      {legend && (
        <div className="flex gap-4">
          {legend.map((l) => (
            <div key={l.n} className="flex items-center gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: l.c }}
              />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {l.n}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
    {children}
  </div>
);

// ─── Health Score Ring with smooth transitions ──────────────────
const HealthScoreRing = ({ score, status }) => {
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 80) return COLORS.success;
    if (score >= 50) return COLORS.warning;
    return COLORS.danger;
  };

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg className="transform -rotate-90 w-32 h-32">
        <circle
          cx="64"
          cy="64"
          r="54"
          stroke="#1f252e"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="64"
          cy="64"
          r="54"
          stroke={getColor()}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-black text-white">{score}</span>
        <span className="text-[9px] font-bold text-gray-500 uppercase">
          /100
        </span>
      </div>
    </div>
  );
};

// ─── AI Analysis Tab ────────────────────────────────────────────
const AIAnalysisTab = ({ hardwareData, chartData, thresholds }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [displayedResult, setDisplayedResult] = useState(null);
  const hasInitialized = useRef(false);

  const currentVal = hardwareData?.current ?? 0;
  const tempVal = hardwareData?.temperature ?? 0;
  const vibVal = hardwareData?.vibration ?? 0;

  // ─── Core AI Calculation (pure, memoized) ───────────────────
  const calculateHealthScore = useCallback(() => {
    const currentRatio = Math.min((currentVal / thresholds.current) * 100, 100);
    const tempRatio = Math.min((tempVal / thresholds.temperature) * 100, 100);
    const vibRatio = Math.min((vibVal / thresholds.vibration) * 100, 100);

    const weights = { current: 0.25, temp: 0.45, vibration: 0.3 };
    const stressScore =
      currentRatio * weights.current +
      tempRatio * weights.temp +
      vibRatio * weights.vibration;

    const healthScore = Math.max(0, Math.round(100 - stressScore));

    return { healthScore, currentRatio, tempRatio, vibRatio };
  }, [currentVal, tempVal, vibVal, thresholds]);

  const generateRecommendations = useCallback(
    (score, ratios) => {
      const recommendations = [];

      if (score >= 90) {
        recommendations.push({
          type: "success",
          icon: CheckCircle2,
          title: "Motor Operating Normally",
          desc: "All parameters within optimal range. Continue standard maintenance schedule.",
          action: "No action needed",
        });
      } else if (score >= 70) {
        recommendations.push({
          type: "warning",
          icon: Clock,
          title: "Preventive Attention Required",
          desc: "Motor showing early signs of stress. Monitor closely over next 24 hours.",
          action: "Schedule inspection within 48hrs",
        });
      } else if (score >= 50) {
        recommendations.push({
          type: "caution",
          icon: AlertTriangle,
          title: "Performance Degradation Detected",
          desc: "Multiple parameters approaching limits. Risk of overheating or bearing wear.",
          action: "Reduce load & schedule maintenance",
        });
      } else {
        recommendations.push({
          type: "danger",
          icon: ShieldAlert,
          title: "CRITICAL: Immediate Action Required",
          desc: "Motor operating beyond safe limits. Permanent damage risk if continued.",
          action: "STOP MOTOR IMMEDIATELY",
        });
      }

      if (ratios.tempRatio > 85) {
        recommendations.push({
          type: "danger",
          icon: Thermometer,
          title: "Thermal Overload Risk",
          desc: `Temperature at ${tempVal.toFixed(1)}°C is near max limit (${thresholds.temperature}°C). Insulation damage likely.`,
          action: "Check cooling system & reduce load",
        });
      } else if (ratios.tempRatio > 70) {
        recommendations.push({
          type: "warning",
          icon: Thermometer,
          title: "Elevated Temperature",
          desc: "Temperature trending high. Monitor for sustained operation.",
          action: "Verify ventilation & ambient conditions",
        });
      }

      if (ratios.vibRatio > 80) {
        recommendations.push({
          type: "danger",
          icon: Activity,
          title: "Excessive Vibration Detected",
          desc: `Vibration at ${vibVal.toFixed(2)} mm/s indicates bearing failure or misalignment.`,
          action: "Inspect bearings & shaft alignment",
        });
      } else if (ratios.vibRatio > 60) {
        recommendations.push({
          type: "warning",
          icon: Activity,
          title: "Increasing Vibration",
          desc: "Vibration levels above normal. Early bearing wear suspected.",
          action: "Schedule vibration analysis",
        });
      }

      if (ratios.currentRatio > 85) {
        recommendations.push({
          type: "warning",
          icon: Zap,
          title: "High Current Draw",
          desc: `Current at ${currentVal.toFixed(1)}A approaching max (${thresholds.current}A). Possible overload or winding issue.`,
          action: "Check for mechanical binding",
        });
      }

      if (chartData && chartData.length >= 3) {
        const recent = chartData.slice(-3);
        const tempTrend = recent[2].temperature - recent[0].temperature;
        const vibTrend = recent[2].vibration - recent[0].vibration;

        if (tempTrend > 5 || vibTrend > 2) {
          recommendations.push({
            type: "prediction",
            icon: TrendingUp,
            title: "AI Prediction: Degradation Trend",
            desc: `Temperature rising ${tempTrend > 0 ? "+" : ""}${tempTrend.toFixed(1)}°C and vibration ${vibTrend > 0 ? "+" : ""}${vibTrend.toFixed(1)} mm/s in last 3 readings.`,
            action: "Predicted failure within 72hrs if trend continues",
          });
        }
      }

      return recommendations;
    },
    [currentVal, tempVal, vibVal, thresholds, chartData],
  );

  // ─── Build result object (memoized, no state changes) ──────
  const aiResult = useMemo(() => {
    const { healthScore, currentRatio, tempRatio, vibRatio } =
      calculateHealthScore();
    const recommendations = generateRecommendations(healthScore, {
      currentRatio,
      tempRatio,
      vibRatio,
    });

    return {
      score: healthScore,
      status:
        healthScore >= 80
          ? "Healthy"
          : healthScore >= 50
            ? "Caution"
            : "Critical",
      metrics: [
        {
          name: "Current Stress",
          value: Math.round(currentRatio),
          color: COLORS.current,
        },
        {
          name: "Thermal Stress",
          value: Math.round(tempRatio),
          color: COLORS.temp,
        },
        {
          name: "Vibration Stress",
          value: Math.round(vibRatio),
          color: COLORS.vibration,
        },
      ],
      recommendations,
      timestamp: new Date().toLocaleTimeString(),
    };
  }, [calculateHealthScore, generateRecommendations]);

  // ─── Only show loader on first mount or manual refresh ──────
  const runAnalysis = useCallback(() => {
    setIsAnalyzing(true);
    setDisplayedResult(null);

    setTimeout(() => {
      setDisplayedResult(aiResult);
      setIsAnalyzing(false);
    }, 800);
  }, [aiResult]);

  // Initialize once on mount
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      runAnalysis();
    }
  }, [runAnalysis]);

  // Smoothly update displayed result when data changes (no loading flash)
  useEffect(() => {
    if (displayedResult && !isAnalyzing) {
      setDisplayedResult(aiResult);
    }
  }, [aiResult, isAnalyzing, displayedResult]);

  const radarData =
    displayedResult?.metrics.map((m) => ({
      subject: m.name.replace(" Stress", ""),
      A: m.value,
      fullMark: 100,
    })) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* AI Header */}
      <div className={`${COLORS.card} rounded-2xl p-6 border ${COLORS.border}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10">
              <Brain className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">
                AI Motor Health Analysis
              </h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Neural Network Diagnostic Engine v1.0
              </p>
            </div>
          </div>
          <button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 text-xs font-bold uppercase tracking-wider hover:bg-blue-500/20 transition-colors disabled:opacity-50"
          >
            <RotateCcw
              className={`w-4 h-4 ${isAnalyzing ? "animate-spin" : ""}`}
            />
            {isAnalyzing ? "Analyzing..." : "Re-Analyze"}
          </button>
        </div>

        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold text-gray-400">
              Processing sensor data...
            </p>
            <p className="text-[10px] text-gray-600 mt-1">
              Analyzing current, thermal & vibration patterns
            </p>
          </div>
        ) : displayedResult ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Health Score */}
            <div className="flex flex-col items-center justify-center">
              <HealthScoreRing
                score={displayedResult.score}
                status={displayedResult.status}
              />
              <div className="mt-4 text-center">
                <span
                  className={`text-sm font-black uppercase tracking-wider ${
                    displayedResult.score >= 80
                      ? "text-green-400"
                      : displayedResult.score >= 50
                        ? "text-amber-400"
                        : "text-red-400"
                  }`}
                >
                  {displayedResult.status}
                </span>
                <p className="text-[10px] text-gray-600 mt-1">
                  Last updated: {displayedResult.timestamp}
                </p>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#1f252e" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "#6b7280", fontSize: 10, fontWeight: 700 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: "#374151", fontSize: 9 }}
                  />
                  <Radar
                    name="Stress Level"
                    dataKey="A"
                    stroke={COLORS.ai}
                    fill={COLORS.ai}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Metric Breakdown */}
            <div className="space-y-3">
              {displayedResult.metrics.map((metric) => (
                <div key={metric.name} className="bg-[#0b0e14] rounded-xl p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      {metric.name}
                    </span>
                    <span
                      className="text-xs font-black"
                      style={{ color: metric.color }}
                    >
                      {metric.value}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${metric.value}%`,
                        backgroundColor:
                          metric.value > 80
                            ? COLORS.danger
                            : metric.value > 60
                              ? COLORS.warning
                              : metric.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Recommendations */}
      {displayedResult && (
        <div className="grid grid-cols-1 gap-4">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">
            AI Recommendations & Actions
          </h3>
          {displayedResult.recommendations.map((rec, idx) => (
            <div
              key={idx}
              className={`${COLORS.card} rounded-xl p-5 border ${COLORS.border} hover:border-gray-700 transition-all duration-300`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-2.5 rounded-xl ${
                    rec.type === "success"
                      ? "bg-green-500/10"
                      : rec.type === "warning"
                        ? "bg-amber-500/10"
                        : rec.type === "caution"
                          ? "bg-orange-500/10"
                          : rec.type === "danger"
                            ? "bg-red-500/10"
                            : "bg-blue-500/10"
                  }`}
                >
                  <rec.icon
                    className={`w-5 h-5 ${
                      rec.type === "success"
                        ? "text-green-400"
                        : rec.type === "warning"
                          ? "text-amber-400"
                          : rec.type === "caution"
                            ? "text-orange-400"
                            : rec.type === "danger"
                              ? "text-red-400"
                              : "text-blue-400"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-white">
                      {rec.title}
                    </h4>
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed mb-2">
                    {rec.desc}
                  </p>
                  <div className="flex items-center gap-2">
                    <Wrench className="w-3 h-3 text-gray-500" />
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider ${
                        rec.type === "danger" ? "text-red-400" : "text-blue-400"
                      }`}
                    >
                      {rec.action}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Predictive Insights */}
      {displayedResult && (
        <div
          className={`${COLORS.card} rounded-2xl p-6 border ${COLORS.border}`}
        >
          <div className="flex items-center gap-3 mb-4">
            <Gauge className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Predictive Insights
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0b0e14] rounded-xl p-4 text-center">
              <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">
                Estimated Remaining Life
              </p>
              <p className="text-xl font-black text-white">
                {displayedResult.score >= 80
                  ? "~2,400 hrs"
                  : displayedResult.score >= 60
                    ? "~1,200 hrs"
                    : displayedResult.score >= 40
                      ? "~400 hrs"
                      : "< 100 hrs"}
              </p>
              <p className="text-[9px] text-gray-600 mt-1">
                Based on current stress levels
              </p>
            </div>
            <div className="bg-[#0b0e14] rounded-xl p-4 text-center">
              <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">
                Next Service Due
              </p>
              <p className="text-xl font-black text-white">
                {displayedResult.score >= 80
                  ? "90 days"
                  : displayedResult.score >= 60
                    ? "45 days"
                    : displayedResult.score >= 40
                      ? "14 days"
                      : "IMMEDIATE"}
              </p>
              <p className="text-[9px] text-gray-600 mt-1">
                Recommended maintenance window
              </p>
            </div>
            <div className="bg-[#0b0e14] rounded-xl p-4 text-center">
              <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">
                Failure Probability
              </p>
              <p className="text-xl font-black text-white">
                {displayedResult.score >= 80
                  ? "< 5%"
                  : displayedResult.score >= 60
                    ? "15%"
                    : displayedResult.score >= 40
                      ? "45%"
                      : "> 80%"}
              </p>
              <p className="text-[9px] text-gray-600 mt-1">
                Within next 30 days
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────
const DashboardContent = () => {
  const { hardwareData, chartData } = useUserDataStore();
  const [activeTab, setActiveTab] = useState("dashboard");

  const [alerts, setAlerts] = useState({
    current: false,
    temp: false,
    vibration: false,
  });

  const [isShuttingDown, setIsShuttingDown] = useState(false);
  const [isRunning, setIsRunning] = useState(hardwareData?.isRunning ?? false);

  useEffect(() => {
    if (hardwareData && hardwareData.isRunning !== undefined) {
      setIsRunning(hardwareData.isRunning);
    }
  }, [hardwareData]);

  const safeHardwareData = hardwareData || {
    current: 19.5,
    temperature: 46,
    vibration: 2.85,
    isRunning: false,
    maxCurrent: 38,
    maxTemperature: 70,
    maxVibration: 25,
  };

  const thresholds = useMemo(
    () => ({
      current: safeHardwareData.maxCurrent ?? 38,
      temperature: safeHardwareData.maxTemperature ?? 70,
      vibration: safeHardwareData.maxVibration ?? 25,
    }),
    [
      safeHardwareData.maxCurrent,
      safeHardwareData.maxTemperature,
      safeHardwareData.maxVibration,
    ],
  );

  const transformedChartData = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return MOTOR_DATA;
    }

    const processed = chartData.map((item) => {
      const date = new Date(item.timestamp);
      const time = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

      return {
        time,
        current: item.current || item.nitrogen || 0,
        temp: item.temperature || item.temp || 0,
        vibration: item.vibration || 0,
      };
    });

    return processed.slice(-MAX_DATA_POINTS);
  }, [chartData]);

  const currentVal = safeHardwareData.current ?? 19.5;
  const tempVal = safeHardwareData.temperature ?? 46;
  const vibVal = safeHardwareData.vibration ?? 2.85;

  const currentWarning = currentVal > thresholds.current;
  const tempWarning = tempVal > thresholds.temperature;
  const vibrationWarning = vibVal > thresholds.vibration;

  const anyCritical = currentWarning || tempWarning || vibrationWarning;

  useEffect(() => {
    if (!anyCritical || !isRunning || isShuttingDown) return;

    const shutdownPump = async () => {
      setIsShuttingDown(true);
      toast.error(
        "🚨 CRITICAL: Threshold exceeded! Emergency shutdown initiated...",
        { duration: 5000 },
      );

      try {
        await api.post("/user/toggle", { state: false });
        setIsRunning(false);
        toast.success("Pump emergency stopped successfully");
      } catch (err) {
        toast.error("Emergency shutdown failed! Please stop manually.");
      } finally {
        setIsShuttingDown(false);
      }
    };

    shutdownPump();
  }, [anyCritical, isRunning, isShuttingDown]);

  useEffect(() => {
    if (currentVal > thresholds.current && !alerts.current) {
      toast.error(
        `⚠️ High Current Alert: ${currentVal.toFixed(1)}A (Max: ${thresholds.current}A)`,
      );
      setAlerts((prev) => ({ ...prev, current: true }));
    } else if (currentVal <= thresholds.current && alerts.current) {
      setAlerts((prev) => ({ ...prev, current: false }));
    }

    if (tempVal > thresholds.temperature && !alerts.temp) {
      toast.error(
        `🌡️ High Temperature Alert: ${tempVal.toFixed(1)}°C (Max: ${thresholds.temperature}°C)`,
      );
      setAlerts((prev) => ({ ...prev, temp: true }));
    } else if (tempVal <= thresholds.temperature && alerts.temp) {
      setAlerts((prev) => ({ ...prev, temp: false }));
    }

    if (vibVal > thresholds.vibration && !alerts.vibration) {
      toast.error(
        `📳 High Vibration Alert: ${vibVal.toFixed(1)} (Max: ${thresholds.vibration})`,
      );
      setAlerts((prev) => ({ ...prev, vibration: true }));
    } else if (vibVal <= thresholds.vibration && alerts.vibration) {
      setAlerts((prev) => ({ ...prev, vibration: false }));
    }
  }, [currentVal, tempVal, vibVal, thresholds, alerts]);

  const handlePowerToggle = async () => {
    if (!isRunning && anyCritical) {
      toast.error("Cannot start pump: Critical thresholds exceeded!");
      return;
    }

    const newState = !isRunning;
    setIsRunning(newState);

    try {
      await api.post("/user/toggle", { state: newState });
      toast.success(
        newState ? "Pump started successfully" : "Pump stopped successfully",
      );
    } catch {
      toast.error("Failed to toggle pump. Retrying...");
      setIsRunning(!newState);
    }
  };

  return (
    <div
      className={`min-h-screen ${COLORS.bg} p-6 text-gray-100 font-sans selection:bg-blue-500/30`}
    >
      {/* Header */}
      {/* <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-white flex items-center gap-3">
            noxMoto
            <span className="h-4 w-px bg-gray-800" />
            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">
              Motor Intelligence v2.0
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-[#151921] rounded-xl border border-gray-800 p-1">
            <button 
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === "dashboard"
                  ? "bg-gray-700 text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                activeTab === "ai"
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Brain className="w-3 h-3" />
              AI Analysis
            </button>
          </div> */}


      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8">
  <div>
    <h1 className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-white">
      <span className="text-xl sm:text-2xl font-black tracking-tighter">
        noxMoto
      </span>

      <span className="hidden sm:block h-4 w-px bg-gray-800" />

      <span className="text-gray-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
        Motor Intelligence v2.0
      </span>
    </h1>
  </div>

  <div className="w-full lg:w-auto">
    <div className="flex w-full lg:w-auto bg-[#151921] rounded-xl border border-gray-800 p-1">
      <button
        onClick={() => setActiveTab("dashboard")}
        className={`flex-1 lg:flex-none px-3 sm:px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
          activeTab === "dashboard"
            ? "bg-gray-700 text-white"
            : "text-gray-500 hover:text-gray-300"
        }`}
      >
        Dashboard
      </button>

      <button
        onClick={() => setActiveTab("ai")}
        className={`flex-1 lg:flex-none px-3 sm:px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
          activeTab === "ai"
            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
            : "text-gray-500 hover:text-gray-300"
        }`}
      >
        <Brain className="w-3 h-3" />
        AI Analysis
      </button>
    </div>
  </div>
</div>


      

          <div className="flex items-center gap-3 bg-[#151921] px-4 py-2 rounded-xl border border-gray-800">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              System Online
            </span>
          </div>
        </div>
      </div>

      {activeTab === "dashboard" ? (
        <>
          {/* Warnings */}
          {(currentWarning || tempWarning || vibrationWarning) && (
            <div className="grid grid-cols-1 gap-3 mb-8">
              {currentWarning && (
                <div className="bg-red-950/30 border border-red-700 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-red-500" />
                    <p className="text-xs font-bold text-red-300">
                      Current exceeded {thresholds.current}A (
                      {currentVal.toFixed(1)}A)
                    </p>
                  </div>
                  <span className="text-[10px] font-black text-red-400 bg-red-950/50 px-2 py-1 rounded">
                    EMERGENCY STOP
                  </span>
                </div>
              )}

              {tempWarning && (
                <div className="bg-amber-950/30 border border-amber-700 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-amber-500" />
                    <p className="text-xs font-bold text-amber-300">
                      Temperature exceeded {thresholds.temperature}°C (
                      {tempVal.toFixed(1)}°C)
                    </p>
                  </div>
                  <span className="text-[10px] font-black text-amber-400 bg-amber-950/50 px-2 py-1 rounded">
                    EMERGENCY STOP
                  </span>
                </div>
              )}

              {vibrationWarning && (
                <div className="bg-purple-950/30 border border-purple-700 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-purple-500" />
                    <p className="text-xs font-bold text-purple-300">
                      Vibration exceeded {thresholds.vibration} (
                      {vibVal.toFixed(1)})
                    </p>
                  </div>
                  <span className="text-[10px] font-black text-purple-400 bg-purple-950/50 px-2 py-1 rounded">
                    EMERGENCY STOP
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <MetricCard
              title="Current"
              value={currentVal.toFixed(1)}
              unit="A"
              status={currentWarning ? "Warning" : "Normal"}
              statusColor={currentWarning ? "bg-red-500" : "bg-green-500"}
              trend={2.4}
              icon={Zap}
              colorHex={COLORS.current}
              maxValue={thresholds.current}
            />
            <MetricCard
              title="Temperature"
              value={tempVal.toFixed(0)}
              unit="°C"
              status={tempWarning ? "Warning" : "Normal"}
              statusColor={tempWarning ? "bg-red-500" : "bg-green-500"}
              trend={2.4}
              icon={Thermometer}
              colorHex={COLORS.temp}
              maxValue={thresholds.temperature}
            />
            <MetricCard
              title="Vibration"
              value={vibVal.toFixed(2)}
              unit="mm/s"
              status={vibrationWarning ? "Warning" : "Normal"}
              statusColor={vibrationWarning ? "bg-red-500" : "bg-green-500"}
              trend={0.0}
              icon={Activity}
              colorHex={COLORS.vibration}
              maxValue={thresholds.vibration}
            />
          </div>

          {/* Main Chart + Power Control */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div
              className={`lg:col-span-2 ${COLORS.card} rounded-3xl p-6 border ${COLORS.border} shadow-2xl`}
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-black text-xs uppercase tracking-[0.2em] text-gray-500">
                  Sensor Live Trends
                </h3>
                <div className="flex gap-4">
                  {[
                    { n: "Current", c: COLORS.current },
                    { n: "Temp", c: COLORS.temp },
                  ].map((l) => (
                    <div key={l.n} className="flex items-center gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: l.c }}
                      />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {l.n}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={transformedChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#1f252e"
                    />
                    <XAxis
                      dataKey="time"
                      stroke="#374151"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#374151"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="current"
                      stroke={COLORS.current}
                      fill="transparent"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="temp"
                      stroke={COLORS.temp}
                      fill="transparent"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Power Control */}
            <div
              className={`${COLORS.card} rounded-3xl p-8 border ${COLORS.border} flex flex-col items-center justify-between shadow-2xl relative overflow-hidden`}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
              <div className="flex items-center gap-2 self-start mb-4">
                <Activity className="w-4 h-4 text-blue-500" />
                <span className="font-black text-[10px] uppercase tracking-widest text-gray-400">
                  Power Logic
                </span>
              </div>

              {anyCritical && (
                <div className="absolute inset-0 bg-red-950/10 z-10 pointer-events-none flex items-center justify-center">
                  <div className="bg-red-950/80 border border-red-700 px-4 py-2 rounded-lg">
                    <span className="text-red-400 text-xs font-black uppercase tracking-widest">
                      Critical Condition
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handlePowerToggle}
                disabled={isShuttingDown}
                className={`group relative w-36 h-36 rounded-full flex items-center justify-center transition-all duration-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  isRunning
                    ? "bg-green-500/5 shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)]"
                    : "bg-red-500/5 shadow-[0_0_50px_-12px_rgba(239,68,68,0.3)]"
                }`}
              >
                <div
                  className={`absolute inset-0 rounded-full border-2 transition-all duration-700 ${
                    isRunning
                      ? "border-green-500/40 animate-[spin_4s_linear_infinite]"
                      : "border-red-500/40"
                  }`}
                  style={{ borderStyle: "dashed" }}
                />
                <div
                  className={`absolute inset-4 rounded-full border-[6px] ${
                    isRunning
                      ? "border-green-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                      : "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                  } transition-colors duration-700`}
                />
                <Power
                  className={`w-12 h-12 relative z-10 ${isRunning ? "text-green-500" : "text-red-500"} transition-colors duration-700`}
                />
              </button>

              <div className="mt-8">
                <h2 className="text-3xl font-black uppercase tracking-tighter italic">
                  {isRunning ? "Running" : "Stopped"}
                </h2>
                <p className="text-gray-500 text-[10px] font-bold uppercase mt-1 tracking-widest">
                  Mode: Standard Operation
                </p>
                {anyCritical && (
                  <p className="text-red-500 text-[10px] font-black uppercase mt-1">
                    Start Blocked: Threshold Exceeded
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8 w-full pt-6 border-t border-gray-800/50">
                <div className="text-center">
                  <span className="text-[9px] font-black text-gray-600 uppercase block mb-1">
                    Uptime
                  </span>
                  <p className="text-sm font-mono font-bold text-blue-400 tracking-widest">
                    02:34:12
                  </p>
                </div>
                <div className="text-center">
                  <span className="text-[9px] font-black text-gray-600 uppercase block mb-1">
                    Last Start
                  </span>
                  <p className="text-sm font-bold text-gray-300">08:15 AM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <ChartCard
              title="Thermal Dynamics"
              legend={[{ n: "Temp", c: COLORS.temp }]}
            >
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={transformedChartData}>
                    <Line
                      type="step"
                      dataKey="temp"
                      stroke={COLORS.temp}
                      strokeWidth={2}
                      dot={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard
              title="Vibration Analysis"
              legend={[{ n: "Vibration", c: COLORS.vibration }]}
            >
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={transformedChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#1f252e"
                    />
                    <XAxis
                      dataKey="time"
                      stroke="#374151"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="vibration" radius={[4, 4, 0, 0]}>
                      {transformedChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.vibration > thresholds.vibration
                              ? COLORS.temp
                              : COLORS.vibration
                          }
                          fillOpacity={0.7}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          {/* Current Draw Chart */}
          <ChartCard
            title="Current Draw Over Time"
            legend={[{ n: "Current", c: COLORS.current }]}
          >
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={transformedChartData}>
                  <defs>
                    <linearGradient
                      id="colorCurrentGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={COLORS.current}
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor={COLORS.current}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#1f252e"
                  />
                  <XAxis
                    dataKey="time"
                    stroke="#374151"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#374151"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="current"
                    stroke={COLORS.current}
                    strokeWidth={2.5}
                    fill="url(#colorCurrentGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </>
      ) : (
        <AIAnalysisTab
          hardwareData={safeHardwareData}
          chartData={chartData}
          thresholds={thresholds}
        />
      )}
    </div>
  );
};

export default DashboardContent;
