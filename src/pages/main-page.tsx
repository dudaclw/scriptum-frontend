import { Loader2 } from "lucide-react";
import { NotesList } from "@/components/notes/notes-list";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useNotesApi } from "@/hooks/use-notes-api";

const NOTES_TITLE = "Minhas Notas";

export function MainPage() {
  const { isAuthenticated, isChecking } = useAuthGuard();
  const { isLoading, error } = useNotesApi();

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Erro ao carregar notas: {error}
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          <section className="container mx-auto py-8 px-4">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold font-display">{NOTES_TITLE}</h1>
            </div>
            <NotesList />
          </section>
        </main>
      </div>
    </div>
  );
}
