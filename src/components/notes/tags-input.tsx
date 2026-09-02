'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { isValidTagName, MAX_TAGS_PER_NOTE } from '@/lib/note-utils';

export function TagsInput({
  selected,
  onChange
}: {
  selected: string[];
  onChange: (tags: string[]) => void
}) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (['Enter', 'Tab', ','].includes(e.key)) {
      e.preventDefault();
      const newTag = input.trim();

      if (selected.length >= MAX_TAGS_PER_NOTE) {
        setError(`Máximo de ${MAX_TAGS_PER_NOTE} tags por nota`);
        return;
      }

      if (!isValidTagName(newTag)) {
        setError('Tags devem ter até 20 caracteres alfanuméricos');
        return;
      }

      if (!selected.includes(newTag)) {
        onChange([...selected, newTag]);
        setInput('');
        setError('');
      } else {
        setError('Tag já adicionada');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(selected.filter(tag => tag !== tagToRemove));
  };

  return (
    <div>
      <Input
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setError('');
        }}
        onKeyDown={handleKeyDown}
        placeholder="Digite tags e pressione Enter..."
        aria-label="Adicionar tags"
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      <div className="flex flex-wrap gap-2 mt-2">
        {selected.map((tag) => (
          <span 
            key={tag} 
            className="bg-secondary px-2 py-1 rounded-md text-sm cursor-pointer hover:bg-secondary/80 transition-colors"
            onClick={() => removeTag(tag)}
            title="Clique para remover"
          >
            {tag} ×
          </span>
        ))}
      </div>
    </div>
  );
}