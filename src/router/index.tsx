import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import { useAuth } from "@/common/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner";

const PrivateRoutes = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return token ? <Outlet /> : <Navigate to="/login" />;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<PrivateRoutes />}>
          <Route path="/" element={<DashboardPage />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
};

export default AppRouter;
