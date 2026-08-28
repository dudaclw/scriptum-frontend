import { Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { NoteForm } from "@/components/notes/note-form";
import { useNote } from "@/hooks/use-note";

export function NoteEditPage() {
  const navigate = useNavigate();
  const { noteId } = useParams<{ noteId: string }>();
  const { note, isLoading } = useNote(noteId ?? "");

  const handleSuccess = () => {
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <NoteForm
      initialData={note}
      onSuccess={handleSuccess}
      onDelete={() => navigate("/")}
    />
  );
}
