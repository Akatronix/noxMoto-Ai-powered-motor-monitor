import React, { useState, useEffect } from "react";
import { useUserDataStore } from "@/stores/userDataStore";
import { toast } from "sonner";
import api from "@/services/api";
import {
  Zap,
  Thermometer,
  Activity,
  Droplets,
  Save,
  RotateCcw,
  AlertTriangle,
  Settings,
  ChevronRight,
  Gauge,
} from "lucide-react";

const COLORS = {
  bg: "bg-[#0b0e14]",
  card: "bg-[#151921]",
  border: "border-[#1f252e]",
  current: "#f59e0b",
  temp: "#ef4444",
  vibration: "#a855f7",
  flow: "#06b6d4",
  accent: "#10b981",
};

// ─── Default max parameters ─────────────────────────────────────
const DEFAULT_MAX_PARAMS = {
  current: 25,
  temperature: 50,
  vibration: 50,
  flow: 50,
};

// ─── Parameter Card Component ───────────────────────────────
const ParameterCard = ({
  label,
  icon: Icon,
  colorHex,
  value,
  onChange,
  unit,
  description,
  currentReading,
  warningActive,
}) => {
  const percentOfMax = currentReading
    ? Math.min((currentReading / value) * 100, 100)
    : 0;

  return (
    <div
      className={`${COLORS.card} border ${COLORS.border} rounded-2xl p-6 relative overflow-hidden group hover:border-gray-700 transition-all duration-300`}
    >
      {/* Warning indicator */}
      {warningActive && (
        <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/5 rounded-bl-full" />
      )}

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl"
            style={{ backgroundColor: `${colorHex}15` }}
          >
            <Icon className="w-5 h-5" style={{ color: colorHex }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{label}</h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">
              {description}
            </p>
          </div>
        </div>
        {warningActive && (
          <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
        )}
      </div>

      {/* Input Field */}
      <div className="relative mb-4">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full bg-[#0b0e14] border border-gray-700 rounded-xl px-4 py-3 text-2xl font-bold text-white focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all"
          step="0.1"
          min="0"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 uppercase">
          {unit}
        </span>
      </div>

      {/* Current Reading Bar */}
      {currentReading !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Current Reading
            </span>
            <span
              className={`text-[10px] font-bold ${
                warningActive ? "text-red-400" : "text-gray-400"
              }`}
            >
              {currentReading.toFixed(1)} {unit}
            </span>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${percentOfMax}%`,
                backgroundColor: warningActive ? "#ef4444" : colorHex,
              }}
            />
          </div>
          <p className="text-[9px] text-gray-600 mt-1.5">
            {percentOfMax.toFixed(0)}% of max threshold
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Main Settings Page ─────────────────────────────────────
const MotorMaxSettings = () => {
  const { hardwareData } = useUserDataStore();

  const [params, setParams] = useState(DEFAULT_MAX_PARAMS);
  const [originalParams, setOriginalParams] = useState(DEFAULT_MAX_PARAMS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const safeHardwareData = hardwareData || {
    current: 19.5,
    temperature: 46,
    vibration: 2.85,
    flow: 137.9,
  };

  // ─── Fetch params from database on mount ───────────────────
  useEffect(() => {
    const fetchParams = async () => {
      try {
        const response = await api.get("/user/settings/max-params");
        const fetched = response.data || DEFAULT_MAX_PARAMS;
        setParams(fetched);
        setOriginalParams(fetched);
      } catch (error) {
        toast.error("Failed to load parameters from server. Using defaults.");
        setParams(DEFAULT_MAX_PARAMS);
        setOriginalParams(DEFAULT_MAX_PARAMS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParams();
  }, []);

  const hasChanges = JSON.stringify(params) !== JSON.stringify(originalParams);

  const handleParamChange = (key, value) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.post("/user/settings/max-params", params);
      setOriginalParams(params); // Update baseline so hasChanges becomes false
      toast.success("Motor max parameters saved to database");
    } catch (error) {
      toast.error("Failed to save parameters. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Reset all parameters to default values?")) {
      setParams(DEFAULT_MAX_PARAMS);
      toast.info("Parameters reset to defaults. Click Save to apply.");
    }
  };

  const currentWarning = (safeHardwareData.current ?? 0) > params.current;
  const tempWarning = (safeHardwareData.temperature ?? 0) > params.temperature;
  const vibrationWarning = (safeHardwareData.vibration ?? 0) > params.vibration;
  const flowWarning = (safeHardwareData.flow ?? 0) > params.flow;

  const paramConfigs = [
    {
      key: "current",
      label: "Current Limit",
      icon: Zap,
      colorHex: COLORS.current,
      unit: "A",
      description: "Maximum allowable current draw",
      currentReading: safeHardwareData.current ?? 19.5,
      warningActive: currentWarning,
    },
    {
      key: "temperature",
      label: "Temperature Limit",
      icon: Thermometer,
      colorHex: COLORS.temp,
      unit: "°C",
      description: "Maximum operating temperature",
      currentReading: safeHardwareData.temperature ?? 46,
      warningActive: tempWarning,
    },
    {
      key: "vibration",
      label: "Vibration Limit",
      icon: Activity,
      colorHex: COLORS.vibration,
      unit: "mm/s",
      description: "Maximum vibration threshold",
      currentReading: safeHardwareData.vibration ?? 2.85,
      warningActive: vibrationWarning,
    },
    {
      key: "flow",
      label: "Flow Rate Limit",
      icon: Droplets,
      colorHex: COLORS.flow,
      unit: "L/min",
      description: "Maximum flow rate threshold",
      currentReading: safeHardwareData.flow ?? 137.9,
      warningActive: flowWarning,
    },
  ];

  if (isLoading) {
    return (
      <div className={`min-h-screen ${COLORS.bg} flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Loading parameters...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${COLORS.bg} p-6 text-gray-100 font-sans selection:bg-blue-500/30`}
    >
      {/* ── Header ── */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-white flex items-center gap-3">
            <Settings className="w-6 h-6 text-gray-500" />
            MotoX
            <span className="h-4 w-px bg-gray-800" />
            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">
              Motor Max Parameters
            </span>
          </h1>
          <p className="text-gray-600 text-xs mt-2 ml-9">
            Configure safety thresholds for all motor sensors
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-[#151921] px-4 py-2 rounded-xl border border-gray-800">
            <Gauge className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Settings Mode
            </span>
          </div>
        </div>
      </div>

      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 mb-6 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
        <span className="text-gray-500">Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-400">Motor Parameters</span>
      </div>

      {/* ── Active Warnings Banner ── */}
      {(currentWarning || tempWarning || vibrationWarning || flowWarning) && (
        <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-4 mb-8 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-red-400">
              Active Warnings Detected
            </p>
            <p className="text-[10px] text-red-500/70 mt-0.5">
              One or more sensors are currently exceeding their configured
              thresholds. Review readings below.
            </p>
          </div>
        </div>
      )}

      {/* ── Parameter Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {paramConfigs.map((config) => (
          <ParameterCard
            key={config.key}
            label={config.label}
            icon={config.icon}
            colorHex={config.colorHex}
            value={params[config.key]}
            onChange={(val) => handleParamChange(config.key, val)}
            unit={config.unit}
            description={config.description}
            currentReading={config.currentReading}
            warningActive={config.warningActive}
          />
        ))}
      </div>

      {/* ── Summary Card ── */}
      <div
        className={`${COLORS.card} border ${COLORS.border} rounded-2xl p-6 mb-8`}
      >
        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">
          Parameter Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {paramConfigs.map((config) => (
            <div key={config.key} className="text-center">
              <span
                className="text-2xl font-bold block"
                style={{ color: config.colorHex }}
              >
                {params[config.key]}
                <span className="text-xs text-gray-600 ml-1">
                  {config.unit}
                </span>
              </span>
              <span className="text-[9px] font-bold text-gray-600 uppercase tracking-wider mt-1 block">
                {config.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 ${
            hasChanges
              ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
              : "bg-gray-800 text-gray-500 cursor-not-allowed"
          }`}
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Parameters"}
        </button>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider bg-gray-800 hover:bg-gray-700 text-gray-400 transition-all duration-300"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Default
        </button>

        {hasChanges && (
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider animate-pulse">
            Unsaved changes
          </span>
        )}
      </div>

      {/* ── Footer Info ── */}
      <div className="mt-12 pt-6 border-t border-gray-800/50">
        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">
          All changes are saved directly to the database. Parameters are fetched
          from the server on page load.
        </p>
      </div>
    </div>
  );
};

export default MotorMaxSettings;