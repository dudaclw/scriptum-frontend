"use client";

import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, X } from "lucide-react";
import { useNotesApi } from "@/hooks/use-notes-api";
import { useTagsApi } from "@/hooks/use-tags-api";
import { Note } from "@/domain/entities/note";

interface SearchNotesProps {
  onSearchResults: (notes: Note[]) => void;
  onClearSearch: () => void;
}

const SEARCH_DEBOUNCE_MS = 300;

export function SearchNotes({ onSearchResults, onClearSearch }: SearchNotesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { searchNotesByTitle, searchNotesByContent, getNotesByTag } = useNotesApi();
  const { searchTagsByName } = useTagsApi();

  const runSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      onClearSearch();
      return;
    }

    setIsSearching(true);
    try {
      // Buscar por título, conteúdo e tag
      const [titleResults, contentResults, matchingTags] = await Promise.all([
        searchNotesByTitle(term),
        searchNotesByContent(term),
        searchTagsByName(term),
      ]);

      const tagResults = (
        await Promise.all(matchingTags.map((tag) => getNotesByTag(tag.id)))
      ).flat();

      // Combinar resultados e remover duplicatas
      const allResults = [...titleResults, ...contentResults, ...tagResults];
      const uniqueResults = allResults.filter((note, index, self) =>
        index === self.findIndex(n => n.id === note.id)
      );

      onSearchResults(uniqueResults);
    } catch (error) {
      console.error("Erro na busca:", error);
    } finally {
      setIsSearching(false);
    }
  }, [searchNotesByTitle, searchNotesByContent, searchTagsByName, getNotesByTag, onSearchResults, onClearSearch]);

  // Busca em tempo real: refiltra a lista conforme o usuário digita
  useEffect(() => {
    const timeout = setTimeout(() => runSearch(searchTerm), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [searchTerm, runSearch]);

  const handleClear = useCallback(() => {
    setSearchTerm("");
    onClearSearch();
  }, [onClearSearch]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      runSearch(searchTerm);
    }
  }, [runSearch, searchTerm]);

  return (
    <div className="flex gap-2 mb-6">
      <div className="relative flex-1">
        {isSearching ? (
          <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 animate-spin" />
        ) : (
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        )}
        <Input
          type="text"
          placeholder="Buscar notas..."
          aria-label="Buscar notas por título, conteúdo ou tag"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-10 focus-visible:border-accent-500 focus-visible:ring-accent-500/50"
        />
      </div>
      {searchTerm && (
        <Button
          onClick={handleClear}
          variant="ghost"
          size="icon"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
