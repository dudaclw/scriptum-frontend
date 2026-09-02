import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getContrastTextColor } from '@/lib/utils'

function navigateWithViewTransition(path: string, navigate: (path: string) => void) {
  const doc = document as Document & { startViewTransition?: (callback: () => void) => void }
  if (doc.startViewTransition) {
    doc.startViewTransition(() => navigate(path))
  } else {
    navigate(path)
  }
}

interface NoteCardProps {
  id: string
  title: string
  content: string
  tags: string[]
  links: string[]
  lastEdited?: string
  color?: string
  className?: string
  onEdit: () => void
  onDelete: () => void
}

export function NoteCard({
  id,
  title,
  content,
  tags,
  links,
  lastEdited,
  color = '#ffffff',
  className = '',
  onEdit,
  onDelete
}: NoteCardProps) {
  const textColor = getContrastTextColor(color);
  const isLightText = textColor === 'light';
  const sortedTags = [...tags].sort((a, b) => a.localeCompare(b));
  const navigate = useNavigate();

  const handleOpen = () => {
    navigateWithViewTransition(`/notes/${id}`, navigate);
  };

  return (
    <div
      className={`relative w-full max-w-md group ${className}`}
      style={{ viewTransitionName: `note-${id}` } as React.CSSProperties}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpen();
          }
        }}
        className="rounded-lg border border-border p-6 h-full shadow-md hover:shadow-lg transition-shadow cursor-pointer"
        style={{ backgroundColor: color }}
      >
        <h3 className={`text-lg font-semibold font-display mb-2 ${
          isLightText ? 'text-white' : 'text-gray-800'
        }`}>
          {title}
        </h3>
        <p className={`text-sm mb-4 line-clamp-3 ${
          isLightText ? 'text-gray-200' : 'text-gray-600'
        }`}>
          {content}
        </p>

        {sortedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {sortedTags.map(tag => (
              <span
                key={`${id}-${tag}`}
                className={`px-2 py-1 text-xs rounded-full ${
                  isLightText
                    ? 'bg-white/20 text-white'
                    : 'bg-black/5 text-gray-600'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {lastEdited && (
          <p className={`text-xs mt-4 ${
            isLightText ? 'text-gray-300' : 'text-gray-500'
          }`}>
            Editado em: {new Date(lastEdited).toLocaleDateString()}
          </p>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-60 transition-opacity bg-black/10 hover:bg-accent-500 hover:text-white text-current backdrop-blur-sm z-20 h-8 w-8"
            aria-label={`Mais ações para a nota ${title}`}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit} className="focus:bg-accent-500 focus:text-white">
            <Pencil className="h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="focus:bg-accent-500 focus:text-white">
            <Trash2 className="h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
