"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type NoteFormValues, noteSchema } from "@/schemas/notes-schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import TextareaAutosize from "react-textarea-autosize";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkdownPreview } from "@/components/ui/markdown-preview";
import { useNavigate } from "react-router-dom";
import { TagsInput } from "@/components/notes/tags-input";
import { ColorPicker } from "@/components/notes/color-picker";
import { useNotesApi } from "@/hooks/use-notes-api";
import { useAuthStore } from "@/lib/store/use-auth-store";
import { Note } from "@/domain/entities/note";
import { getContrastTextColor } from "@/lib/utils";

interface NoteFormProps {
  initialData?: NoteFormValues & { id?: string };
  onSuccess?: () => void;
}

type FeedbackType = {
  message: string;
  type: 'success' | 'error';
};

const DEFAULT_NOTE_VALUES: NoteFormValues = {
  title: "",
  content: "",
  isPinned: false,
  color: "#FFFFFF",
  tags: []
};

export function NoteForm({ initialData, onSuccess }: NoteFormProps) {
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackType | null>(null);
  const navigate = useNavigate();
  const { createNote, updateNote, getNoteById } = useNotesApi();
  const { user } = useAuthStore();

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: initialData || DEFAULT_NOTE_VALUES,
  });

  const content = form.watch("content");
  const tags = form.watch("tags");
  const color = form.watch("color");

  // Carrega os dados da nota se for edição
  useEffect(() => {
    if (!initialData?.id) return;
    
    const loadNote = async () => {
      try {
        const note = await getNoteById(initialData.id);
        
        if (note) {
          form.reset({
            title: note.title,
            content: note.content,
            isPinned: note.isPinned || false,
            color: note.color || "#FFFFFF",
            tags: note.tags?.map(tag => tag.name) || []
          });
        }
      } catch (error) {
        console.error("Failed to fetch note data:", error);
        setFeedback({
          message: "Falha ao carregar os dados da nota",
          type: 'error'
        });
      }
    };

    loadNote();
  }, [initialData?.id, form, getNoteById]);

  // Contagem de palavras e caracteres
  useEffect(() => {
    const text = content || "";
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    setCharCount(text.length);
  }, [content]);

  // Feedback temporário
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const onSubmit = useCallback(async (values: NoteFormValues) => {
    if (!user) {
      setFeedback({
        message: "Usuário não autenticado",
        type: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Converter string[] para Tag[] para a API
      const tagsAsTags = values.tags.map(tagName => ({
        id: '', // Será gerado pelo backend
        name: tagName,
        color: '#6b7280', // Cor padrão
        createdAt: new Date(),
        modifiedAt: new Date(),
      }));

      const noteData = {
        title: values.title,
        content: values.content,
        isPinned: values.isPinned,
        color: values.color,
        tags: tagsAsTags,
      };

      if (initialData?.id) {
        // Atualizar nota existente
        await updateNote(initialData.id, noteData);
        setFeedback({
          message: "Nota atualizada com sucesso!",
          type: 'success'
        });
      } else {
        // Criar nova nota
        const newNote = await createNote(noteData);
        setFeedback({
          message: "Nota criada com sucesso!",
          type: 'success'
        });
        onSuccess?.() || navigate(`/notes/${newNote.id}`);
      }
    } catch (error) {
      console.error("Failed to save note:", error);
      setFeedback({
        message: error instanceof Error ? error.message : "Ocorreu um erro ao salvar a nota",
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [initialData?.id, onSuccess, navigate, createNote, updateNote, user]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(e.ctrlKey || e.metaKey)) return;

    const textarea = e.currentTarget;
    const { selectionStart: start, selectionEnd: end, value } = textarea;
    const selectedText = value.substring(start, end);

    let newText = "";
    let cursorOffset = 0;

    switch (e.key) {
      case "b":
        e.preventDefault();
        newText = `**${selectedText}**`;
        cursorOffset = 2;
        break;
      case "i":
        e.preventDefault();
        newText = `_${selectedText}_`;
        cursorOffset = 1;
        break;
      case "1":
        e.preventDefault();
        newText = `\n# ${selectedText}`;
        break;
      default:
        return;
    }

    form.setValue("content", 
      value.substring(0, start) + newText + value.substring(end)
    );
    
    if (cursorOffset) {
      setTimeout(() => {
        textarea.selectionStart = start + cursorOffset;
        textarea.selectionEnd = end + cursorOffset;
      }, 0);
    }
  }, [form]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-8 py-4 flex-1 flex flex-col">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col">
              {/* Feedback Message */}
              {feedback && (
                <div className={`mb-4 p-3 rounded-md text-center ${
                  feedback.type === 'success' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {feedback.message}
                </div>
              )}
              
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Título da nota"
                          className="text-2xl font-bold border-none shadow-none focus-visible:ring-0 px-0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name="isPinned"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-primary"
                          />
                        </FormControl>
                        <FormLabel className="text-sm text-muted-foreground">
                          Fixar
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" size="sm" disabled={isSubmitting}>
                    {isSubmitting ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </div>

              {/* Tags e Cor */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <TagsInput
                            selected={field.value || []}
                            onChange={(tags) => field.onChange(tags)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="w-32">
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor</FormLabel>
                        <FormControl>
                          <ColorPicker
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Editor Area */}
              <Tabs defaultValue="write" className="flex-1 flex flex-col min-h-[500px]">
                <div className="flex justify-between items-center mb-2">
                  <TabsList className="grid w-[200px] grid-cols-2">
                    <TabsTrigger value="write">Editar</TabsTrigger>
                    <TabsTrigger value="preview">Visualizar</TabsTrigger>
                  </TabsList>
                  <div className="text-sm text-muted-foreground">
                    {wordCount} palavras • {charCount} caracteres
                  </div>
                </div>

                <TabsContent value="write" className="flex-1">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <TextareaAutosize
                            {...field}
                            onKeyDown={handleKeyDown}
                            minRows={12}
                            placeholder="Comece a escrever aqui... Use Markdown para formatação."
                            className="w-full p-4 font-mono text-base rounded-lg border-0 bg-muted resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="preview" className="flex-1 min-h-[400px]">
                  <div 
                    className={`h-full p-4 overflow-auto prose max-w-none border rounded-lg ${
                      getContrastTextColor(color || '#ffffff') === 'light'
                        ? 'prose-invert text-white'
                        : 'text-gray-800'
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    <MarkdownPreview
                      content={content || "*Nada para pré-visualizar*"}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {/* Footer */}
              <div className="mt-4 flex items-center justify-between rounded-lg border bg-muted px-3 py-1.5 text-xs text-muted-foreground">
                <button
                  type="button"
                  onClick={() => form.setValue("content", `${content}\n# `)}
                  className="rounded px-2 py-1 hover:bg-accent hover:text-accent-foreground focus-visible:outline-2"
                  title="Cabeçalho 1 (Ctrl+1)"
                >
                  H1
                </button>
                <span>Markdown</span>
              </div>
          </form>
        </Form>
      </div>
    </div>
  );
}