import { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Zap,
  Thermometer,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/userStore";
import api from "@/services/api";

const COLORS = {
  bg: "bg-[#0b0e14]",
  card: "bg-[#151921]",
  border: "border-[#1f252e]",
  current: "#f59e0b",
  temp: "#ef4444",
  accent: "#10b981",
};

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", formData);
      const { accessToken, user } = response.data;

      toast.success("Login successful!");
      setAuth(user, accessToken);
      navigate("/");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "An error occurred. Please try again.";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${COLORS.bg} flex items-center justify-center p-4 text-gray-100 font-sans selection:bg-blue-500/30`}
    >
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col items-start space-y-8">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3 mb-2">
              noxMoto
              <span className="h-4 w-[1px] bg-gray-800" />
              <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                Motor Intelligence
              </span>
            </h1>
          </div>

          <h2 className="text-4xl font-black text-white leading-tight tracking-tight">
            Welcome Back to{" "}
            <span className="text-[#10b981]">Smart Monitoring</span>
          </h2>

          <p className="text-base text-gray-500 leading-relaxed max-w-md">
            Access your dashboard to monitor motor current, temperature and
            vibration for optimal performance and predictive maintenance.
          </p>

          <div className="space-y-4 w-full max-w-md">
            <div
              className={`${COLORS.card} border ${COLORS.border} rounded-2xl p-4 flex items-center gap-4`}
            >
              <div
                className="p-2.5 rounded-xl shrink-0"
                style={{ backgroundColor: `${COLORS.current}15` }}
              >
                <Zap
                  className="w-5 h-5"
                  style={{ color: COLORS.current }}
                  strokeWidth={2}
                />
              </div>
              <div>
                <p className="font-bold text-white text-sm tracking-tight">
                  Motor Diagnostics
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Real-time current & vibration tracking
                </p>
              </div>
            </div>

            <div
              className={`${COLORS.card} border ${COLORS.border} rounded-2xl p-4 flex items-center gap-4`}
            >
              <div
                className="p-2.5 rounded-xl shrink-0"
                style={{ backgroundColor: `${COLORS.temp}15` }}
              >
                <Thermometer
                  className="w-5 h-5"
                  style={{ color: COLORS.temp }}
                  strokeWidth={2}
                />
              </div>
              <div>
                <p className="font-bold text-white text-sm tracking-tight">
                  Environmental Controls
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Thermal & Vibration alerts
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div
          className={`${COLORS.card} border ${COLORS.border} rounded-2xl p-8 shadow-2xl w-full max-w-md mx-auto lg:max-w-none`}
        >
          {/* Mobile Header */}
          <div className="lg:hidden mb-8">
            <h1 className="text-2xl font-black tracking-tighter text-white flex items-center gap-3">
              MotoX
              <span className="h-4 w-[1px] bg-gray-800" />
              <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                Login
              </span>
            </h1>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-black text-white tracking-tight">
              Welcome Back
            </h2>
            <p className="text-gray-600 text-[10px] font-bold uppercase mt-1.5 tracking-widest">
              Sign in to access your motor dashboard
            </p>

            {/* Error State */}
            {error && (
              <div className="flex items-center gap-1.5 mt-4 bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                  {error}
                </p>
              </div>
            )}
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600">
                  <Mail className="w-4 h-4" strokeWidth={2} />
                </div>
                <input
                  type="email"
                  placeholder="operator@example.com"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setError(null);
                  }}
                  className="w-full pl-11 pr-4 py-3 bg-[#0b0e14] border border-[#1f252e] rounded-xl text-white text-sm font-medium placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600">
                  <Lock className="w-4 h-4" strokeWidth={2} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    setError(null);
                  }}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-[#0b0e14] border border-[#1f252e] rounded-xl text-white text-sm font-medium placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" strokeWidth={2} />
                  ) : (
                    <Eye className="w-4 h-4" strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all bg-[#10b981] hover:bg-[#10b981]/90 text-black shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Logging in..." : "Login"}
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </form>

          {/* Signup Link */}
          <p className="text-center text-xs text-gray-600 mt-6 font-medium">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-[#10b981] hover:text-[#10b981]/80 font-bold uppercase tracking-wider"
            >
              Create account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
