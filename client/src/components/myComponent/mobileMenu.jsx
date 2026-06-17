import { LogOut, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Home, History, ChevronRight, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserDataStore } from "@/stores/userDataStore";
import { useAuthStore } from "@/stores/userStore";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const COLORS = {
  bg: "bg-[#0b0e14]",
  card: "bg-[#151921]",
  border: "border-[#1f252e]",
  accent: "#10b981",
};

const navigationItems = [
  {
    name: "Dashboard",
    value: "dashboard",
    icon: Home,
  },
  {
    name: "History",
    value: "history",
    icon: History,
  },
  {
    name: "Settings",
    value: "settings",
    icon: Settings,
  },
];

const MobileMenu = ({ isOpen, setIsOpen, setMenu, activeMenu }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { userData } = useUserDataStore();
  const logout = useAuthStore((state) => state.logout);

  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest(".mobile-menu-container")) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, setIsOpen]);

  const handleMenuItemClick = (menuValue) => {
    setMenu(menuValue);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`);
      localStorage.removeItem("accessToken");
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("An error occurred during logout.");
    } finally {
      logout();
      navigate("/login");
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Menu Panel */}
      <div className="mobile-menu-container fixed inset-y-0 left-0 z-50 w-64 max-w-xs bg-[#0f1219] border-r border-[#1f252e] shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col">
        {/* Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1f252e]">
          <h1 className="text-lg font-black tracking-tighter text-white">
            noxMoto
          </h1>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg bg-[#151921] border border-[#1f252e] hover:border-gray-700 transition-colors focus:outline-none"
            aria-label="Close menu"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Section Label */}
        <div className="px-4 pt-5 pb-2">
          <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">
            Navigation
          </span>
        </div>

        {/* Navigation Items */}
        <nav
          className="flex-1 overflow-y-auto px-3"
          aria-label="Main navigation"
        >
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.value;

              return (
                <button
                  key={item.value}
                  onClick={() => handleMenuItemClick(item.value)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all focus:outline-none",
                    isActive
                      ? "bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20"
                      : "text-gray-500 hover:bg-[#151921] hover:text-gray-300 border border-transparent",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon
                    className="w-4 h-4 shrink-0"
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className="truncate text-[13px] font-bold tracking-tight">
                    {item.name}
                  </span>
                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 ml-auto shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-[#1f252e] p-3 space-y-1">
          {/* Logout */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/5 hover:text-red-300 text-[13px] font-bold tracking-tight transition-colors disabled:opacity-50"
          >
            <LogOut size={16} strokeWidth={2} />
            {isLoggingOut ? "Signing out..." : "Logout"}
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#151921] border border-[#1f252e] mt-1">
            <div className="w-9 h-9 bg-linear-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-black text-xs shrink-0 shadow-lg shadow-blue-500/10">
              {userData?.username
                ? userData.username.charAt(0).toUpperCase()
                : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate tracking-tight">
                {userData ? userData.username : "Guest"}
              </p>
              <p className="text-[10px] text-gray-600 truncate">
                {userData ? userData.email : "Please login"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
