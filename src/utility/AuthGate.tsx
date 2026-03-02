// src/components/AuthGate.tsx
import { useUser } from "@/api/auth.query";
import { Navigate } from "react-router-dom";

export const AuthGate = () => {
  const { user } = useUser();
console.log("AuthGate user:", user);
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={"/dashboard"} replace />;
};
