import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export function SidebarLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger />
        <ProtectedRoute>
          <Outlet />
        </ProtectedRoute>
      </main>
    </SidebarProvider>
  );
}
