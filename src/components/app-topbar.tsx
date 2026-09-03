import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppTopbar({ onSearchClick }: { onSearchClick: () => void }) {
  return (
    <div className="flex h-12 shrink-0 items-center gap-1 border-b bg-sidebar px-2 text-sidebar-foreground">
      <SidebarTrigger className="md:hidden" />
      <Button
        variant="ghost"
        size="icon"
        onClick={onSearchClick}
        aria-label="Buscar notas"
        title="Buscar notas (Cmd+K)"
      >
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );
}
