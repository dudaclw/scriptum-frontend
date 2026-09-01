import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { EmptyStateProps } from '@/domain/types/types';

function BlankPageIcon() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="14" y="6" width="36" height="52" rx="3" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" />
      <line x1="21" y1="22" x2="43" y2="22" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="21" y1="30" x2="43" y2="30" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="21" y1="38" x2="35" y2="38" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyState({
  title = 'A página ainda está em branco',
  description = 'Escreva sua primeira nota',
  actionText = 'Criar Nota',
  actionHref = "/notes/new",
  className = '',
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center gap-4 p-8 text-center rounded-lg',
      'bg-muted/50 text-muted-foreground',
      className
    )}>
      <div className="flex flex-col items-center justify-center gap-3">
        <BlankPageIcon />
        <div className="space-y-1">
          <h3 className="text-lg font-medium text-foreground">{title}</h3>
          <p className="text-sm max-w-md">{description}</p>
        </div>
      </div>

      {actionText && actionHref && (
        <Button asChild className="mt-4 bg-accent-500 text-white hover:bg-accent-500/90">
          <Link to={actionHref}>{actionText}</Link>
        </Button>
      )}
    </div>
  );

}
