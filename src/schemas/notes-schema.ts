import { z } from "zod";

export const noteSchema = z.object({
	title: z.string().min(2, { message: "Mínimo 2 caracteres" }),
	content: z.string().min(10, { message: "Mínimo 10 caracteres" }),
	tags: z.string().array().default([]),
	color: z.string().default("#ffffff"),
	isPinned: z.boolean().default(false),
});

// `color`, `tags` e `isPinned` têm default, então o tipo de entrada do
// formulário aceita esses campos ausentes e o de saída sempre os contém.
export type NoteFormInput = z.input<typeof noteSchema>;
export type NoteFormValues = z.output<typeof noteSchema>;
