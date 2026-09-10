import { z } from "zod";

export const noteSchema = z.object({
	title: z.string().min(2, { message: "Mínimo 2 caracteres" }),
	content: z.string().default(""),
	tags: z.string().array().max(5, { message: "Máximo de 5 tags" }).default([]),
	color: z.string().default("#ffffff"),
	isPinned: z.boolean().default(false),
});

// `content`, `color`, `tags` e `isPinned` têm default, então o tipo de entrada
// do formulário aceita esses campos ausentes e o de saída sempre os contém.
export type NoteFormInput = z.input<typeof noteSchema>;
export type NoteFormValues = z.output<typeof noteSchema>;
