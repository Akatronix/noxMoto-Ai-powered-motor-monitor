import React, { useState } from "react";
import { Cpu, Save } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import { useAuthStore } from "@/stores/userStore";

const COLORS = {
  bg: "bg-[#0b0e14]",
  card: "bg-[#151921]",
  border: "border-[#1f252e]",
  accent: "#10b981",
};

const HardwareResigter = () => {
  const [formData, setFormData] = useState({
    hardwareID: "",
  });

  const setNewAuth = useAuthStore((state) => state.setNewAuth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setError("");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.hardwareID.trim()) {
      setError("Please enter a device ID");
      toast.error("Please enter a device ID");
      return;
    }

    const formDataToSend = {
      hardwareID: formData.hardwareID.trim(),
    };

    try {
      setLoading(true);
      const response = await api.post("/meter/create", formDataToSend);

      if (response.status === 201) {
        const { accessToken, user } = response.data;
        toast.success("Device registered successfully");
        setFormData({
          hardwareID: "",
        });

        setLoading(false);
        setNewAuth(user);
        window.location.href = "/";
      } else {
        setLoading(false);
        toast.error("Failed to register device");
      }
    } catch (error) {
      setLoading(false);
      const errorMessage =
        error.response?.data?.message || "An error occurred. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <div
      className={`min-h-screen ${COLORS.bg} flex items-center justify-center p-4 text-gray-100 font-sans selection:bg-blue-500/30`}
    >
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tighter text-white flex items-center gap-3">
            noxMoto
            <span className="h-4 w-[1px] bg-gray-800" />
            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">
              Hardware Register
            </span>
          </h1>
          <p className="text-gray-600 text-[10px] font-bold uppercase mt-2 tracking-widest">
            Add a new motor monitoring device to your dashboard
          </p>
        </div>

        {/* Form Card */}
        <form
          className={`${COLORS.card} border ${COLORS.border} rounded-2xl p-6 shadow-2xl space-y-5`}
          onSubmit={handleFormSubmit}
        >
          {/* Device ID Field */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
              Device ID
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600">
                <Cpu className="w-4 h-4" strokeWidth={2} />
              </div>
              <input
                type="text"
                value={formData.hardwareID}
                onChange={(e) => handleChange("hardwareID", e.target.value)}
                className="w-full py-3 pl-11 pr-4 bg-[#0b0e14] border border-[#1f252e] rounded-xl text-white text-sm font-medium placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-colors"
                placeholder="Enter device ID"
              />
            </div>

            {/* Error State */}
            {error && (
              <div className="flex items-center gap-1.5 mt-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                  {error}
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all bg-[#10b981] hover:bg-[#10b981]/90 text-black shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              "Registering..."
            ) : (
              <>
                <Save className="w-4 h-4" strokeWidth={2.5} />
                Register Device
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HardwareResigter;
