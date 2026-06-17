import React from "react";

export const Badge = ({ children, type = "neutral" }) => {
  const colors = {
    neutral: "bg-gray-100 text-gray-600",
    success: "bg-emerald-50 text-emerald-600",
    warning: "bg-amber-50 text-amber-600",
    danger: "bg-rose-50 text-rose-600 animate-pulse",
    active: "bg-blue-50 text-blue-600",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${colors[type]}`}
    >
      {children}
    </span>
  );
};

export default Badge;
