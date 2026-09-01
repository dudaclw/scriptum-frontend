export interface EmptyStateProps {
	title?: string;
	description?: string;
	actionText?: string;
	actionHref?: string;
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