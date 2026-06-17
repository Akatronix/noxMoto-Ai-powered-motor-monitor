import { Home, History, Settings, LogOut, ChevronRight } from "lucide-react";
import imageLogo from "@/assets/logo.png";
import { useAuthStore } from "@/stores/userStore";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import api from "@/services/api";
import { useUserDataStore } from "@/stores/userDataStore";

const COLORS = {
  bg: "bg-[#0b0e14]",
  sidebar: "bg-[#0b0e14]",
  card: "bg-[#151921]",
  border: "border-[#1f252e]",
  accent: "#10b981",
};

export const Sidebar = ({ setMenu, activeMenu }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const { userData } = useUserDataStore();

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

  const NavButton = ({ id, icon: Icon, label }) => {
    const isActive = activeMenu === id;
    return (
      <button
        onClick={() => setMenu(id)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
          isActive
            ? "bg-[#10b981]/10 text-[#10b981]"
            : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon
            size={20}
            className={
              isActive ? "text-[#10b981]" : "group-hover:text-gray-300"
            }
          />
          <span className="text-sm font-bold uppercase tracking-widest">
            {label}
          </span>
        </div>
        {isActive && (
          <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_10px_#10b981]" />
        )}
      </button>
    );
  };

  return (
    <aside
      className={`relative h-screen w-72 shrink-0 ${COLORS.sidebar} border-r ${COLORS.border} hidden lg:flex flex-col`}
    >
      {/* Logo Section */}
      <div className="p-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={imageLogo}
              alt="AgriSense Logo"
              className="w-10 h-10 object-cover rounded-xl grayscale brightness-125"
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#10b981] border-2 border-[#0b0e14] rounded-full" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tighter uppercase italic">
              noxMoto
            </h1>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">
              System Pro
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        <div className="px-4 mb-4">
          <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em]">
            Main Menu
          </p>
        </div>
        <NavButton id="dashboard" icon={Home} label="Dashboard" />
        <NavButton id="history" icon={History} label="History" />
      </nav>

      {/* Bottom Section */}
      <div className={`p-4 border-t ${COLORS.border} bg-[#0e1218]`}>
        <div className="space-y-1 mb-6">
          <button
            onClick={() => setMenu("settings")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-colors ${
              activeMenu === "settings"
                ? "text-[#10b981]"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Settings size={18} />
            Settings
          </button>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-rose-500/70 hover:text-rose-400 hover:bg-rose-500/5 text-sm font-bold uppercase tracking-widest transition-all mt-2"
          >
            <LogOut size={18} />
            {isLoggingOut ? "Closing..." : "Logout"}
          </button>
        </div>

        {/* User Profile Card */}
        <div
          className={`${COLORS.card} border ${COLORS.border} p-3 rounded-2xl`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center border border-white/10 text-white font-black text-xs">
              {userData ? userData.username.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white uppercase tracking-tighter truncate">
                {userData ? userData.username : "Guest User"}
              </p>
              <p className="text-xs font-black text-gray-500 truncate">
                {userData ? userData.email : ""}
              </p>
            </div>
            <ChevronRight size={14} className="text-gray-700" />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
