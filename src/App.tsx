import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import WorkOrders from "@/pages/WorkOrders";
import Planning from "@/pages/Planning";
import Drone from "@/pages/Drone";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import MainLayout from "@/components/layout/MainLayout";
import { useAppStore } from "@/store";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAppStore((s) => s.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

function AuthRedirect() {
  const user = useAppStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location.state]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <>
              <AuthRedirect />
              <Login />
            </>
          }
        />
        <Route
          path="/"
          element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="workorders" element={<WorkOrders />} />
          <Route path="planning" element={<Planning />} />
          <Route path="drone" element={<Drone />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
