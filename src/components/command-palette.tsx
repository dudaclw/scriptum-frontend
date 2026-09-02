import { FileText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useNotesApi } from "@/hooks/use-notes-api";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { notes } = useNotesApi();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((note) => (note.title || "").toLowerCase().includes(q));
  }, [notes, query]);

  const handleSelect = (id: string) => {
    setOpen(false);
    navigate(`/notes/${id}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0 top-[20%] translate-y-0" showCloseButton={false}>
        <DialogTitle className="sr-only">Buscar notas</DialogTitle>
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar notas..."
          aria-label="Buscar notas"
          className="h-12 rounded-none border-0 border-b px-4 focus-visible:ring-0"
        />
        <div className="max-h-80 overflow-y-auto py-2">
          {filteredNotes.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Nenhuma nota encontrada
            </p>
          )}
          {filteredNotes.map((note) => (
            <button
              key={note.id}
              type="button"
              onClick={() => handleSelect(note.id)}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors hover:bg-accent-500 hover:text-white"
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span className="truncate">{note.title || "Sem título"}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
