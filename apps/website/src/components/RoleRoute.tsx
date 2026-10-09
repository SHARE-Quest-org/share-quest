import React from "react";
import { useAuth } from "../context/AuthContext";
import { AccessDeniedView } from "../views/dashboard/AccessDeniedView";

interface RoleRouteProps {
  requiredRole: "writer" | "editor" | "authenticated";
  children: React.ReactElement;
}

export function RoleRoute({ requiredRole, children }: RoleRouteProps) {
  const { userRole, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (requiredRole === "editor") {
    if (userRole !== "editor") {
      return <AccessDeniedView requiredRole="editor" />;
    }
  } else if (requiredRole === "writer") {
    if (userRole !== "writer" && userRole !== "editor") {
      return <AccessDeniedView requiredRole="writer" />;
    }
  } else if (requiredRole === "authenticated") {
    if (userRole === "guest") {
      return <AccessDeniedView requiredRole="authenticated" />;
    }
  }

  return children;
}
