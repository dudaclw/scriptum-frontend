import {
  ArrowLeft,
  Copy,
  Loader2,
  MoreVertical,
  Pin,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TextareaAutosize from "react-textarea-autosize";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Tag } from "@/domain/entities/tag";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useNote } from "@/hooks/use-note";
import { useNotesApi } from "@/hooks/use-notes-api";
import { isValidTagName, MAX_TAGS_PER_NOTE } from "@/lib/note-utils";

const AUTOSAVE_DEBOUNCE_MS = 800;
const DEFAULT_TAG_COLOR = "#6b7280";

function toTagRefs(names: string[]) {
  return names.map((name) => ({ name, color: DEFAULT_TAG_COLOR })) as unknown as Tag[];
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function NotePage() {
  const { isAuthenticated, isChecking } = useAuthGuard();
  const { noteId } = useParams<{ noteId: string }>();
  const { note, isLoading } = useNote(noteId ?? "");
  const { notes, updateNote, deleteNote, createNote } = useNotesApi();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving">("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [linkTag, setLinkTag] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const titleRef = useRef<HTMLHeadingElement>(null);
  const hydratedRef = useRef(false);
  const dirtyRef = useRef(false);
  const latestRef = useRef({ tags, isPinned, color: note?.color });

  // Preenche o estado local só quando a nota carrega (uma vez), e escreve
  // o texto do título direto no DOM em vez de via children — contentEditable
  // controlado por children/props causa salto de cursor a cada tecla.
  useEffect(() => {
    if (!note) return;
    setTitle(note.title || "");
    setContent(note.content || "");
    setTags(note.tags?.map((t) => t.name) || []);
    setIsPinned(note.isPinned || false);
    if (titleRef.current) titleRef.current.textContent = note.title || "";
    hydratedRef.current = true;
  }, [note]);

  useEffect(() => {
    latestRef.current = { tags, isPinned, color: note?.color };
  }, [tags, isPinned, note?.color]);

  // Autosave: só título/conteúdo (digitação contínua) passam pelo debounce.
  // dirtyRef só liga em edição real do usuário (onInput/onChange), não na
  // hidratação inicial — sem isso, todo carregamento de nota dispararia um
  // save "fantasma" reescrevendo os mesmos dados que acabaram de chegar.
  useEffect(() => {
    if (!hydratedRef.current || !dirtyRef.current || !noteId) return;
    setSaveStatus("saving");
    const timeout = setTimeout(async () => {
      try {
        await updateNote(
          noteId,
          {
            title,
            content,
            tags: toTagRefs(latestRef.current.tags),
            isPinned: latestRef.current.isPinned,
            color: latestRef.current.color,
          },
          { silent: true },
        );
        setLastSavedAt(new Date());
      } catch (error) {
        console.error("Falha ao salvar nota:", error);
      } finally {
        setSaveStatus("idle");
      }
    }, AUTOSAVE_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [title, content, noteId, updateNote]);

  // Tags e fixar/desafixar são ações discretas: salvam na hora, sem debounce.
  const saveImmediate = useCallback(
    async (updates: { tags?: string[]; isPinned?: boolean }) => {
      if (!noteId) return;
      const nextTags = updates.tags ?? tags;
      const nextPinned = updates.isPinned ?? isPinned;
      try {
        await updateNote(
          noteId,
          {
            title,
            content,
            tags: toTagRefs(nextTags),
            isPinned: nextPinned,
            color: note?.color,
          },
          { silent: true },
        );
        setLastSavedAt(new Date());
      } catch (error) {
        console.error("Falha ao salvar nota:", error);
      }
    },
    [noteId, title, content, tags, isPinned, note?.color, updateNote],
  );

  const handleAddTag = () => {
    const newTag = tagInput.trim();
    if (!newTag) {
      setIsAddingTag(false);
      return;
    }
    if (tags.length >= MAX_TAGS_PER_NOTE) {
      toast.error(`Máximo de ${MAX_TAGS_PER_NOTE} tags por nota`);
      return;
    }
    if (!isValidTagName(newTag)) {
      toast.error("Tags devem ter até 20 caracteres alfanuméricos");
      return;
    }
    if (tags.includes(newTag)) {
      toast.error("Tag já adicionada");
      return;
    }
    const next = [...tags, newTag];
    setTags(next);
    setTagInput("");
    setIsAddingTag(false);
    saveImmediate({ tags: next });
  };

  const handleRemoveTag = (tag: string) => {
    const next = tags.filter((t) => t !== tag);
    setTags(next);
    saveImmediate({ tags: next });
  };

  const togglePin = () => {
    const next = !isPinned;
    setIsPinned(next);
    saveImmediate({ isPinned: next });
  };

  const handleDuplicate = async () => {
    try {
      const newNote = await createNote({
        title: `${title} (cópia)`,
        content,
        color: note?.color || "#ffffff",
        isPinned: false,
        tags: toTagRefs(tags),
      });
      navigate(`/notes/${newNote.id}`);
    } catch (error) {
      console.error("Falha ao duplicar nota:", error);
    }
  };

  const relatedNotes = useMemo(
    () =>
      linkTag
        ? notes.filter((n) => n.id !== noteId && n.tags?.some((t) => t.name === linkTag))
        : [],
    [linkTag, notes, noteId],
  );

  const handleConfirmDelete = async () => {
    if (!noteId) return;
    try {
      await deleteNote(noteId);
      navigate("/mainpage");
    } catch (error) {
      console.error("Falha ao excluir nota:", error);
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  // Esc volta pra lista, exceto enquanto o usuário está digitando em algo.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const active = document.activeElement;
      const isEditing =
        active instanceof HTMLElement &&
        (active.isContentEditable || active.tagName === "TEXTAREA" || active.tagName === "INPUT");
      if (isEditing) return;
      navigate("/mainpage");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

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

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold mb-4">Nota não encontrada</h1>
        <p className="text-muted-foreground mb-4">
          A nota que você está procurando não existe ou foi removida.
        </p>
        <Button onClick={() => navigate("/mainpage")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para o início
        </Button>
      </div>
    );
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-2 shrink-0">
        <Button variant="ghost" size="sm" onClick={() => navigate("/mainpage")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Minhas Notas
        </Button>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePin}
            aria-label={isPinned ? "Desafixar nota" : "Fixar nota"}
          >
            <Pin className={`h-4 w-4 ${isPinned ? "fill-current" : ""}`} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Mais ações">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDuplicate} className="focus:bg-accent-500 focus:text-white">
                <Copy className="h-4 w-4" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                className="focus:bg-accent-500 focus:text-white"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto bg-background px-8 py-6"
        style={{ viewTransitionName: `note-${noteId}` } as React.CSSProperties}
      >
        <h1
          ref={titleRef}
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => {
            dirtyRef.current = true;
            setTitle(e.currentTarget.textContent || "");
          }}
          data-placeholder="Título da nota"
          className="text-3xl font-bold font-display outline-none mb-3 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground"
        />

        <div className="flex flex-wrap items-center gap-2 mb-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="group flex items-center gap-1 rounded-full bg-muted pl-2 pr-1 py-1 text-xs text-muted-foreground hover:bg-muted/70 transition-colors"
            >
              <button
                type="button"
                onClick={() => setLinkTag(tag)}
                title="Ver notas com esta tag"
              >
                {tag}
              </button>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                aria-label={`Remover tag ${tag}`}
                title="Remover tag"
                className="rounded-full p-0.5 opacity-0 group-hover:opacity-100 hover:bg-background hover:text-destructive transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {isAddingTag ? (
            <input
              autoFocus
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
                if (e.key === "Escape") {
                  e.stopPropagation();
                  setIsAddingTag(false);
                  setTagInput("");
                }
              }}
              onBlur={() => {
                if (!tagInput.trim()) setIsAddingTag(false);
              }}
              placeholder="Nova tag"
              className="w-24 rounded-full border border-border bg-transparent px-2 py-1 text-xs outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
            />
          ) : (
            tags.length < MAX_TAGS_PER_NOTE && (
              <button
                type="button"
                onClick={() => setIsAddingTag(true)}
                aria-label="Adicionar tag"
                className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            )
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-6">
          Editado em: {formatDate(note.modifiedAt)}
        </p>

        <TextareaAutosize
          value={content}
          onChange={(e) => {
            dirtyRef.current = true;
            setContent(e.target.value);
          }}
          placeholder="Comece a escrever..."
          minRows={10}
          className="w-full resize-none border-0 bg-transparent font-mono text-base outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground shrink-0">
        <span>{wordCount} {wordCount === 1 ? "palavra" : "palavras"}</span>
        <span>
          {saveStatus === "saving"
            ? "Salvando..."
            : lastSavedAt
              ? `Salvo às ${formatTime(lastSavedAt)}`
              : ""}
        </span>
      </div>

      <Dialog open={!!linkTag} onOpenChange={(open) => !open && setLinkTag(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notas com a tag "{linkTag}"</DialogTitle>
          </DialogHeader>
          {relatedNotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma outra nota usa esta tag ainda.
            </p>
          ) : (
            <div className="flex max-h-80 flex-col gap-1 overflow-y-auto">
              {relatedNotes.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    setLinkTag(null);
                    navigate(`/notes/${n.id}`);
                  }}
                  className="rounded-md px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                >
                  {n.title || "Sem título"}
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir nota</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta nota? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-danger-500 text-white hover:bg-danger-500/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
