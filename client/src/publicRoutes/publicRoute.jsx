import { useAuthStore } from "@/stores/userStore";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = !!accessToken;

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;
