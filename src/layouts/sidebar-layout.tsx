import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function SidebarLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <ProtectedRoute>
          <Outlet />
        </ProtectedRoute>
      </SidebarInset>
    </SidebarProvider>
  );
}
