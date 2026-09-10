import { noteSchema } from "@/schemas/notes-schema";
import { describe, expect, it } from "vitest";

describe("noteSchema", () => {
	it("accepts a valid note and applies the defaults", () => {
		// Arrange
		const input = { title: "Minha nota", content: "Conteúdo com dez+" };

		// Act
		const result = noteSchema.parse(input);

		// Assert
		expect(result).toEqual({
			title: "Minha nota",
			content: "Conteúdo com dez+",
			tags: [],
			color: "#ffffff",
			isPinned: false,
		});
	});

	it("rejects a title shorter than 2 characters", () => {
		// Arrange
		const input = { title: "a", content: "Conteúdo com dez+" };

		// Act
		const result = noteSchema.safeParse(input);

		// Assert
		expect(result.success).toBe(false);
		expect(result.error?.issues[0].message).toBe("Mínimo 2 caracteres");
	});

	it("rejects content shorter than 10 characters", () => {
		// Arrange
		const input = { title: "Minha nota", content: "curto" };

		// Act
		const result = noteSchema.safeParse(input);

		// Assert
		expect(result.success).toBe(false);
		expect(result.error?.issues[0].message).toBe("Mínimo 10 caracteres");
	});
});
