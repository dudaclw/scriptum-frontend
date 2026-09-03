import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { CommandPalette } from "@/components/command-palette";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

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
    <div className={`flex-1 min-h-0 transition-opacity duration-150 ${visible ? "opacity-100" : "opacity-0"}`}>
      {children}
    </div>
  );
}

export function SidebarLayout() {
  const [width, setWidth] = useState(readStoredWidth);
  const [open, setOpen] = useState(() => localStorage.getItem(SIDEBAR_OPEN_KEY) !== "false");
  const [paletteOpen, setPaletteOpen] = useState(false);

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
        <AppTopbar onSearchClick={() => setPaletteOpen(true)} />
        <ProtectedRoute>
          <RouteFade>
            <Outlet />
          </RouteFade>
        </ProtectedRoute>
      </SidebarInset>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </SidebarProvider>
  );
}
