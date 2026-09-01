import { z } from "zod";

export const noteSchema = z.object({
	title: z.string().min(2, { message: "Mínimo 2 caracteres" }),
	content: z.string().default(""),
	tags: z.string().array().max(5, { message: "Máximo de 5 tags" }).default([]),
	color: z.string().default("#ffffff"),
	isPinned: z.boolean().default(false),
});

export type NoteFormValues = z.infer<typeof noteSchema>;
