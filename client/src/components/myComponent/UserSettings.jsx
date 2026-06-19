import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Save,
  Zap,
  Thermometer,
  Activity,
  Droplets,
  RotateCcw,
  AlertTriangle,
  Settings,
  ChevronRight,
  Gauge,
  SlidersHorizontal,
} from "lucide-react";
import api from "@/services/api";
import { useUserDataStore } from "@/stores/userDataStore";
import { toast } from "sonner";

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

// ─── Parameter Card Component ───────────────────────────────
const ParameterCard = ({
  label,
  icon: Icon,
  colorHex,
  value, // This is the user's current input/state limit
  onChange,
  unit,
  description,
  currentReading, // Live fluctuating sensor value
  maxLimit, // The saved threshold coming from the backend database
  warningActive,
  isLoading,
  hasData,
}) => {
  // Calculate percentage based on live reading vs max limit from database
  const percentOfMax =
    maxLimit > 0 && currentReading > 0
      ? Math.min((currentReading / maxLimit) * 100, 100)
      : 0;

  return (
    <div
      className={`${COLORS.card} border ${COLORS.border} rounded-2xl p-6 relative overflow-hidden group hover:border-gray-700 transition-all duration-300`}
    >
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

      {/* Input Field - Max Limit Configuration */}
      <div className="relative mb-4">
        <input
          type="number"
          value={isLoading ? "" : value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          disabled={isLoading}
          className="w-full bg-[#0b0e14] border border-gray-700 rounded-xl px-4 py-3 text-2xl font-bold text-white focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          step="0.1"
          min="0"
          placeholder={isLoading ? "---" : "0"}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 uppercase">
          {unit}
        </span>
      </div>

      {/* Current Reading Bar - Displays Live Thresholds from Backend */}
      {!isLoading && hasData && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Current Reading
            </span>
            {/* Displays the Max Configured Database Value dynamically */}
            <span
              className={`text-[10px] font-bold ${
                warningActive ? "text-red-400" : "text-white"
              }`}
              style={{ color: warningActive ? "#f87171" : colorHex }}
            >
              {maxLimit.toFixed(1)} {unit}
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

      {/* No Data Message */}
      {!isLoading && !hasData && (
        <div className="mt-4 py-3 text-center">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">
            No backend parameters loaded
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Main Settings Page ─────────────────────────────────────
const UserSettings = () => {
  const { userData, hardwareData, setHardwareData } = useUserDataStore();

  // ─── User Profile State ───────────────────────────────────
  const [formData, setFormData] = useState({
    fullName: userData ? userData.username : "",
    email: userData ? userData.email : "",
  });
  const [userError, setUserError] = useState("");

  // ─── Motor Parameters State ───────────────────────────────
  const [params, setParams] = useState({
    current: 0,
    temperature: 0,
    vibration: 0,
    flow: 0,
  });
  const [originalParams, setOriginalParams] = useState(null);
  const [paramsLoading, setParamsLoading] = useState(true);
  const [paramsSaving, setParamsSaving] = useState(false);

  // ─── Fetch motor max thresholds from database on mount ────
  useEffect(() => {
    const fetchParams = async () => {
      try {
        const response = await api.get("/meter/max-params");
        const fetched = response.data?.data;

        if (fetched && typeof fetched === "object") {
          const normalized = {
            current: Number(fetched.current) || 0,
            temperature: Number(fetched.temperature) || 0,
            vibration: Number(fetched.vibration) || 0,
            flow: Number(fetched.flow) || 0,
          };
          setParams(normalized);
          setOriginalParams(normalized);
        } else {
          toast.error("Invalid parameters received from server");
        }
      } catch (error) {
        toast.error("Failed to load motor parameters from server.");
      } finally {
        setParamsLoading(false);
      }
    };

    fetchParams();
  }, []);

  const paramsChanged =
    originalParams !== null &&
    JSON.stringify(params) !== JSON.stringify(originalParams);

  // ─── User Profile Handlers ────────────────────────────────
  const handleUserChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim()) {
      setUserError("Please fill in all fields");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setUserError("Please enter a valid email address");
      return;
    }

    try {
      const response = await api.post("/user/updateUserInfo", {
        username: formData.fullName,
        email: formData.email,
      });

      if (response.status === 200) {
        setUserError("");
        toast.success("User information updated successfully");
      }
    } catch (err) {
      toast.error("Failed to update user information");
    }
  };

  // ─── Motor Parameter Handlers ───────────────────────────────
  const handleParamChange = (key, value) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleParamsSave = async () => {
    setParamsSaving(true);
    try {
      await api.post("/meter/max-params", params);
      setOriginalParams(params);
      toast.success("Motor max parameters saved to database");
    } catch (error) {
      toast.error("Failed to save motor parameters.");
    } finally {
      setParamsSaving(false);
    }
  };

  const handleParamsReset = () => {
    if (window.confirm("Reset all motor parameters to default values?")) {
      setParams({ current: 0, temperature: 0, vibration: 0, flow: 0 });
      toast.info("Parameters reset. Click Save to apply.");
    }
  };

  // ─── Sensor Evaluation ───────────────────────────────────
  const sensorCurrent = hardwareData?.current ?? 0;
  const sensorTemp = hardwareData?.temperature ?? 0;
  const sensorVibration = hardwareData?.vibration ?? 0;
  const sensorFlow = hardwareData?.flow ?? 0;

  // Verify backend params are loaded correctly
  const hasBackendData = originalParams !== null;

  const currentWarning = sensorCurrent > params.current && params.current > 0;
  const tempWarning = sensorTemp > params.temperature && params.temperature > 0;
  const vibrationWarning =
    sensorVibration > params.vibration && params.vibration > 0;
  const flowWarning = sensorFlow > params.flow && params.flow > 0;

  const paramConfigs = [
    {
      key: "current",
      label: "Current Limit",
      icon: Zap,
      colorHex: COLORS.current,
      unit: "A",
      description: "Maximum allowable current draw",
      currentReading: sensorCurrent,
      maxLimit: params.current, // Dynamic Max Value from Database
      warningActive: currentWarning,
      hasData: hasBackendData,
    },
    {
      key: "temperature",
      label: "Temperature Limit",
      icon: Thermometer,
      colorHex: COLORS.temp,
      unit: "°C",
      description: "Maximum operating temperature",
      currentReading: sensorTemp,
      maxLimit: params.temperature, // Dynamic Max Value from Database
      warningActive: tempWarning,
      hasData: hasBackendData,
    },
    {
      key: "vibration",
      label: "Vibration Limit",
      icon: Activity,
      colorHex: COLORS.vibration,
      unit: "mm/s",
      description: "Maximum vibration threshold",
      currentReading: sensorVibration,
      maxLimit: params.vibration, // Dynamic Max Value from Database
      warningActive: vibrationWarning,
      hasData: hasBackendData,
    },
    // {
    //   key: "flow",
    //   label: "Flow Rate Limit",
    //   icon: Droplets,
    //   colorHex: COLORS.flow,
    //   unit: "L/min",
    //   description: "Maximum flow rate threshold",
    //   currentReading: sensorFlow,
    //   maxLimit: params.flow, // Dynamic Max Value from Database
    //   warningActive: flowWarning,
    //   hasData: hasBackendData,
    // },
  ];

  return (
    <div className={`min-h-screen ${COLORS.bg} p-6 text-gray-100 font-sans`}>
      {/* ── Header ── */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-white flex items-center gap-3">
            <Settings className="w-6 h-6 text-gray-500" />
            noxMoto
            <span className="h-4 w-px bg-gray-800" />
            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">
              Settings
            </span>
          </h1>
          <p className="text-gray-600 text-xs mt-2 ml-9">
            Manage your account and motor safety thresholds
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
      <div className="flex items-center gap-2 mb-8 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
        <span className="text-gray-500">Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-400">Settings</span>
      </div>

      {/* ── SECTION 1: Account Settings ── */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <User className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Account Settings
            </h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">
              Update your profile information
            </p>
          </div>
        </div>

        <form
          onSubmit={handleUserSubmit}
          className={`${COLORS.card} border ${COLORS.border} rounded-2xl p-6 space-y-5 shadow-2xl max-w-md`}
        >
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600">
                <User className="w-4 h-4" strokeWidth={2} />
              </div>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => {
                  handleUserChange("fullName", e.target.value);
                  setUserError("");
                }}
                className="w-full py-3 pl-11 pr-4 bg-[#0b0e14] border border-[#1f252e] rounded-xl text-white text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600">
                <Mail className="w-4 h-4" strokeWidth={2} />
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  handleUserChange("email", e.target.value);
                  setUserError("");
                }}
                className="w-full py-3 pl-11 pr-4 bg-[#0b0e14] border border-[#1f252e] rounded-xl text-white text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none"
                placeholder="Enter your email"
              />
            </div>
            {userError && (
              <div className="flex items-center gap-1.5 mt-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                  {userError}
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-black text-sm uppercase tracking-widest bg-[#10b981] hover:bg-[#10b981]/90 text-black shadow-[0_0_20px_rgba(16,185,129,0.2)] mt-2"
          >
            <Save className="w-4 h-4" strokeWidth={2.5} />
            Save Changes
          </button>
        </form>
      </div>

      {/* ── SECTION 2: Motor Max Parameters ── */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <SlidersHorizontal className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Motor Max Parameters
            </h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">
              Configure safety thresholds for all motor sensors
            </p>
          </div>
        </div>

        {/* Active Warnings Banner */}
        {(currentWarning || tempWarning || vibrationWarning || flowWarning) && (
          <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-red-400">
                Active Warnings Detected
              </p>
              <p className="text-[10px] text-red-500/70 mt-0.5">
                One or more sensors are currently exceeding their configured
                thresholds.
              </p>
            </div>
          </div>
        )}

        {/* Parameter Cards */}
        {paramsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`${COLORS.card} border ${COLORS.border} rounded-2xl p-6 animate-pulse`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gray-800" />
                  <div className="space-y-2">
                    <div className="w-24 h-3 bg-gray-800 rounded" />
                    <div className="w-32 h-2 bg-gray-800 rounded" />
                  </div>
                </div>
                <div className="h-14 bg-gray-800 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                  maxLimit={config.maxLimit}
                  warningActive={config.warningActive}
                  isLoading={paramsLoading}
                  hasData={config.hasData}
                />
              ))}
            </div>

            {/* Summary Card */}
            <div
              className={`${COLORS.card} border ${COLORS.border} rounded-2xl p-6 mb-6`}
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

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleParamsSave}
                disabled={paramsSaving || !paramsChanged}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 ${
                  paramsChanged
                    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
                    : "bg-gray-800 text-gray-500 cursor-not-allowed"
                }`}
              >
                <Save className="w-4 h-4" />
                {paramsSaving ? "Saving..." : "Save Parameters"}
              </button>

              {/* <button
                onClick={handleParamsReset}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider bg-gray-800 hover:bg-gray-700 text-gray-400 transition-all duration-300"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Default
              </button> */}

              {paramsChanged && (
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider animate-pulse">
                  Unsaved changes
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-gray-800/50">
        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">
          Account changes update your profile. Motor parameters are saved
          directly to the database.
        </p>
      </div>
    </div>
  );
};

export default UserSettings;
