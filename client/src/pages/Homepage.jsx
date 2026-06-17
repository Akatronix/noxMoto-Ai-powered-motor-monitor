import DashboardContent from "@/components/myComponent/DashboardContent";
import Header from "@/components/myComponent/Header";
import HistoryContent from "@/components/myComponent/History";
import MobileMenu from "@/components/myComponent/mobileMenu";
import Sidebar from "@/components/myComponent/Sidebar";
import UserSettings from "@/components/myComponent/UserSettings";
import api from "@/services/api";
import { useUserDataStore } from "@/stores/userDataStore";
import { useAuthStore } from "@/stores/userStore";
import { useEffect, useState } from "react";

const Homepage = () => {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const { setUserData, setHistoryData, sethardwareData, setChartData } =
    useUserDataStore();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = !!accessToken;

  const user = useAuthStore((state) => state.user);

  if (isAuthenticated && user && !user.hardwareID) {
    return (window.location.href = "/hardware");
  }

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let intervalId;

    if (isAuthenticated) {
      intervalId = setInterval(async () => {
        try {
          const response = await api.get("/user/getData");
          const { user, myhistory, myData, chart } = response.data;
          setHistoryData(myhistory);
          sethardwareData(myData);
          setChartData(chart);
          setUserData(user);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isAuthenticated]);

  return (
    // Changed: Applied the MotoX deep background color to the main container
    <div className="w-screen h-screen flex items-start justify-start overflow-hidden bg-[#0b0e14]">
      {/* Sidebar Container */}
      <div className="h-screen hidden lg:block shrink-0">
        <Sidebar setMenu={setActiveMenu} activeMenu={activeMenu} />
      </div>

      {/* Changed: Swapped bg-gray-100 for the theme-specific background */}
      <div className="bg-[#0b0e14] flex-1 h-full min-w-0 flex flex-col relative">
        {/* Mobile Menu Component */}
        <MobileMenu
          isOpen={isMobileMenuOpen}
          setIsOpen={setIsMobileMenuOpen}
          setMenu={setActiveMenu}
          activeMenu={activeMenu}
        />

        <Header setIsMobileMenuOpen={setIsMobileMenuOpen} />

        {/* Main Content Area */}
        {/* Changed: Added custom scrollbar styling to keep it "stealth" */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
          <div className="max-w-400 mx-auto w-full">
            {activeMenu === "dashboard" && <DashboardContent />}
            {activeMenu === "history" && <HistoryContent />}
            {activeMenu === "settings" && <UserSettings />}
             
          </div>
        </div>

        {/* Optional: Subtle ambient glow at the bottom of the screen */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-blue-500/5 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

export default Homepage;
