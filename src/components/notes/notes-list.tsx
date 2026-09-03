'use client';

import { useState } from 'react';
import { useNotesApi } from '@/hooks/use-notes-api';
import { NoteCard } from './note-card';
import { EmptyState } from './empty-state';
import { sortNotes } from '@/lib/note-utils';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const NotesList = () => {
  const { isAuthenticated, isChecking } = useAuthGuard();
  const { notes, isLoading, error, deleteNote, updateNote } = useNotesApi();
  const navigate = useNavigate();
  const [noteIdToDelete, setNoteIdToDelete] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    if (!noteIdToDelete) return;
    try {
      await deleteNote(noteIdToDelete);
    } catch (error) {
      console.error('Erro ao deletar nota:', error);
    } finally {
      setNoteIdToDelete(null);
    }
  };

  const handleTogglePin = async (id: string) => {
    try {
      const note = notes.find(n => n.id === id);
      if (note) {
        await updateNote(id, { isPinned: !note.isPinned });
      }
    } catch (error) {
      console.error('Erro ao fixar/desfixar nota:', error);
    }
  };

  // Aguardar verificação de autenticação
  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
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

  if (notes.length === 0) {
    return <EmptyState />;
  }

  const responsiveGridClasses = 'grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 w-full';

  return (
    <div className={responsiveGridClasses}>
      {sortNotes(notes).map((note) => (
        <NoteCard
          key={note.id}
          id={note.id || ''}
          title={note.title || 'Sem título'}
          content={note.content || ''}
          tags={note.tags?.map(tag => tag.name) || []}
          links={[]}
          color={note.color || '#ffffff'}
          lastEdited={note.modifiedAt ? new Date(note.modifiedAt).toISOString() : undefined}
          onEdit={() => navigate(`/notes/${note.id}`)}
          onDelete={() => setNoteIdToDelete(note.id)}
        />
      ))}

      <AlertDialog open={!!noteIdToDelete} onOpenChange={(open) => !open && setNoteIdToDelete(null)}>
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
};