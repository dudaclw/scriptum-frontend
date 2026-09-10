"use client";

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { NoteForm } from '@/components/notes/note-form';
import { Button } from '@/components/ui/button';
import type { Note } from '@/domain/entities/note';
import { useNote } from '@/hooks/use-note';
import type { NoteFormValues } from '@/schemas/notes-schema';

// A nota vem da API com `tags` como objetos; o formulário trabalha com os nomes.
function toFormValues(note: Note): NoteFormValues & { id: string } {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    color: note.color || "#FFFFFF",
    isPinned: note.isPinned ?? false,
    tags: note.tags?.map((tag) => tag.name) ?? [],
  };
}

export default function NoteEditPage({ params }: { params: Promise<{ noteId: string }> }) {
  const { noteId } = use(params);
  const router = useRouter();
  const { note, isLoading } = useNote(noteId);

  const handleSuccess = () => {
    router.push('/');
    router.refresh(); 
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h1 className="text-2xl font-bold">Nota não encontrada</h1>
        <p className="text-muted-foreground">
          A nota que você está tentando editar não existe ou foi removida.
        </p>
        <Button onClick={() => router.push('/mainpage')}>Voltar para o início</Button>
      </div>
    );
  }

  return (
    <NoteForm 
      initialData={toFormValues(note)} 
      onSuccess={handleSuccess}
    />
  );
}
