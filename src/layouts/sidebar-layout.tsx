import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { CommandPalette } from "@/components/command-palette";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const SIDEBAR_OPEN_KEY = "sidebar-open";
const MIN_WIDTH = 200;
const MAX_WIDTH = 360;
const DEFAULT_WIDTH = 256;

function readStoredWidth() {
  const stored = Number(localStorage.getItem(SIDEBAR_WIDTH_KEY));
  return stored >= MIN_WIDTH && stored <= MAX_WIDTH ? stored : DEFAULT_WIDTH;
}

function RouteFade({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [location.pathname]);

  return (
    <div className={`h-full transition-opacity duration-150 ${visible ? "opacity-100" : "opacity-0"}`}>
      {children}
    </div>
  );
}

export function SidebarLayout() {
  const [width, setWidth] = useState(readStoredWidth);
  const [open, setOpen] = useState(() => localStorage.getItem(SIDEBAR_OPEN_KEY) !== "false");

  const handleOpenChange = useCallback((value: boolean) => {
    setOpen(value);
    localStorage.setItem(SIDEBAR_OPEN_KEY, String(value));
  }, []);

  const handleResizeWidth = useCallback((clientX: number) => {
    const clamped = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, clientX));
    setWidth(clamped);
    localStorage.setItem(SIDEBAR_WIDTH_KEY, String(clamped));
  }, []);

  return (
    <SidebarProvider
      open={open}
      onOpenChange={handleOpenChange}
      style={{ "--sidebar-width": `${width}px` } as React.CSSProperties}
    >
      <AppSidebar onResizeWidth={handleResizeWidth} />
      <SidebarInset className="overflow-x-hidden">
        {/* No mobile a sidebar fica fechada por padrão (Sheet) e seu próprio
            trigger fica inacessível enquanto fechada — este é o único gatilho
            sempre alcançável fora dela. */}
        <SidebarTrigger className="m-2 md:hidden" />
        <ProtectedRoute>
          <RouteFade>
            <Outlet />
          </RouteFade>
        </ProtectedRoute>
      </SidebarInset>
      <CommandPalette />
    </SidebarProvider>
  );
}
