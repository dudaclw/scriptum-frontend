export interface EmptyStateProps {
	title?: string;
	description?: string;
	actionText?: string;
	actionHref?: string;
	// Mapeado no próprio EmptyState; não é o catálogo inteiro do lucide.
	icon?: "note" | "create";
	className?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  links: string[];
  lastEdited?: string;
}