import React from "react";

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  disabled,
}) => {
  const variants = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700",
    outline:
      "bg-transparent hover:bg-gray-50 text-gray-600 border border-gray-200",
    danger:
      "bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-600",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-2.5",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
