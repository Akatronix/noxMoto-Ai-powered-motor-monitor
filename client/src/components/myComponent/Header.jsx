import { Menu, Cpu, Bell, Search } from "lucide-react";

// Theme Constants consistent with your Sidebar and Dashboard
const COLORS = {
  bg: "bg-[#0b0e14]",
  card: "bg-[#151921]",
  border: "border-[#1f252e]",
  accent: "#10b981",
};

export const Header = ({ setIsMobileMenuOpen }) => {
  return (
    <header
      className={`${COLORS.bg} border-b ${COLORS.border} px-6 py-4 sticky top-0 z-30 backdrop-blur-md bg-opacity-80`}
    >
      <div className="flex items-center justify-between">
        {/* Left Side: Mobile Menu & Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-gray-800"
          >
            <Menu size={20} className="text-gray-400" />
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex p-1.5 bg-blue-500/10 rounded-lg">
              <Cpu size={18} className="text-blue-500" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-[0.25em] italic">
                System Overview
              </h2>
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest leading-tight">
                Real-time Telemetry
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Added some "MotoX" style utility icons */}
        <div className="flex items-center gap-4">
          <div className="h-6 w-[1px] bg-gray-800 mx-2 hidden sm:block" />

          <div className="hidden sm:block">
            <p className="text-[10px] font-black text-white text-right uppercase tracking-tighter">
              Node-042
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
