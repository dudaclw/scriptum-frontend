import { useNavigate } from "react-router-dom";
import { NoteForm } from "@/components/notes/note-form";

export function NewNotePage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/");
  };

  return <NoteForm onSuccess={handleSuccess} />;
}
