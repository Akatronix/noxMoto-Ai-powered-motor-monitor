import { Route, Routes } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import { Toaster } from "sonner";
import ProtectedRoute from "./protectedRoutes/protectedRoute";
import PublicRoute from "./publicRoutes/publicRoute";
import HardwareResigter from "./pages/HardwareResigter";

const App = () => {
  return (
    <div>
      <Routes>
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Homepage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hardware"
          element={
            <ProtectedRoute>
              <HardwareResigter />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
};

export default App;
