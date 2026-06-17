import {
  AlertTriangle,
  CheckCircle2,
  Zap,
  Clock,
  Thermometer,
  Activity,
  Droplets,
} from "lucide-react";
import { useUserDataStore } from "@/stores/userDataStore";
import { useMemo } from "react";

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

const HistoryContent = () => {
  const { historyData } = useUserDataStore();

  const transformedHistoryData = useMemo(() => {
    if (
      !historyData ||
      !Array.isArray(historyData) ||
      historyData.length === 0
    ) {
      return [];
    }

    // CHANGE: Use [...historyData].reverse() to display the latest event at the top
    return [...historyData].reverse().map((item) => {
      const date = new Date(item.timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dateLabel;
      if (date.toDateString() === today.toDateString()) {
        dateLabel = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateLabel = "Yesterday";
      } else {
        dateLabel = date.toLocaleDateString();
      }

      const time = `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;

      // Motor-themed icons based on event type
      let Icon = Zap;
      if (
        (item.title && item.title.toLowerCase().includes("moisture")) ||
        item.title.toLowerCase().includes("flow")
      ) {
        Icon = Droplets;
      } else if (
        (item.title && item.title.toLowerCase().includes("temperature")) ||
        item.title.toLowerCase().includes("thermal")
      ) {
        Icon = Thermometer;
      } else if (item.title && item.title.toLowerCase().includes("vibration")) {
        Icon = Activity;
      } else if (item.title && item.title.toLowerCase().includes("resolved")) {
        Icon = CheckCircle2;
      } else if (
        (item.title && item.title.toLowerCase().includes("alert")) ||
        item.title.toLowerCase().includes("critical")
      ) {
        Icon = AlertTriangle;
      }

      // Determine type based on title
      let type = "info";
      if (item.title && item.title.toLowerCase().includes("resolved")) {
        type = "success";
      } else if (item.title && item.title.toLowerCase().includes("critical")) {
        type = "error";
      } else if (item.title && item.title.toLowerCase().includes("warning")) {
        type = "warning";
      }

      return {
        id: item._id,
        time,
        date: dateLabel,
        event: item.title || "Unknown Event",
        details: item.description || "No details available",
        type,
        icon: Icon,
      };
    });
  }, [historyData]);

  const getIconStyle = (type) => {
    switch (type) {
      case "success":
        return { bg: `${COLORS.accent}15`, color: COLORS.accent };
      case "error":
        return { bg: `${COLORS.temp}15`, color: COLORS.temp };
      case "warning":
        return { bg: `${COLORS.current}15`, color: COLORS.current };
      default:
        return { bg: `${COLORS.flow}15`, color: COLORS.flow };
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "success":
        return "text-green-400 border-green-500/20 bg-green-500/5";
      case "error":
        return "text-red-400 border-red-500/20 bg-red-500/5";
      case "warning":
        return "text-amber-400 border-amber-500/20 bg-amber-500/5";
      default:
        return "text-cyan-400 border-cyan-500/20 bg-cyan-500/5";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "success":
        return "Resolved";
      case "error":
        return "Critical";
      case "warning":
        return "Warning";
      default:
        return "Info";
    }
  };

  return (
    <div
      className={`min-h-screen ${COLORS.bg} p-6 text-gray-100 font-sans selection:bg-blue-500/30 max-w-5xl mx-auto`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-white flex items-center gap-3">
            MotoX
            <span className="h-4 w-[1px] bg-gray-800" />
            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">
              Event History
            </span>
          </h1>
          <p className="text-gray-600 text-[10px] font-bold uppercase mt-2 tracking-widest">
            Motor monitoring logs · Power · Thermal · Vibration · Flow
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#151921] px-4 py-2 rounded-xl border border-gray-800">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            {transformedHistoryData.length} Events
          </span>
        </div>
      </div>

      {/* History List */}
      <div
        className={`${COLORS.card} rounded-2xl border ${COLORS.border} overflow-hidden shadow-2xl`}
      >
        {/* List Header */}
        <div className="p-4 border-b border-gray-800/50 flex items-center justify-between">
          <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-500">
            Recent Events
          </h3>
          <div className="flex gap-2">
            {["info", "warning", "error", "success"].map((t) => (
              <span
                key={t}
                className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${getTypeBadge(t)}`}
              >
                {getTypeLabel(t)}
              </span>
            ))}
          </div>
        </div>

        {transformedHistoryData.length > 0 ? (
          <div className="divide-y divide-[#1f252e]">
            {transformedHistoryData.map((item) => {
              const Icon = item.icon;
              const iconStyle = getIconStyle(item.type);

              return (
                <div
                  key={item.id}
                  className="p-4 hover:bg-[#1a1f29]/50 transition-colors flex items-start gap-4 group"
                >
                  {/* Icon */}
                  <div
                    className="p-2.5 rounded-xl shrink-0 transition-colors"
                    style={{ backgroundColor: iconStyle.bg }}
                  >
                    <Icon
                      size={16}
                      style={{ color: iconStyle.color }}
                      strokeWidth={2}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold text-white text-sm tracking-tight">
                          {item.event}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {item.details}
                        </p>
                      </div>
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0 ${getTypeBadge(item.type)}`}
                      >
                        {getTypeLabel(item.type)}
                      </span>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-4 mt-3">
                      <span className="flex items-center gap-1.5 text-[10px] text-gray-600 font-medium">
                        <Clock size={10} className="text-gray-700" />
                        <span className="font-mono tracking-widest">
                          {item.time}
                        </span>
                      </span>
                      <span className="w-[1px] h-2.5 bg-gray-800" />
                      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                        {item.date}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-800/30 border border-gray-800 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-7 h-7 text-gray-700" />
            </div>
            <h3 className="text-lg font-bold text-gray-400 mb-1">
              No history data
            </h3>
            <p className="text-sm text-gray-600">
              No motor events have been recorded yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryContent;
