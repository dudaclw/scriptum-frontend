import { noteSchema } from "@/schemas/notes-schema";
import { describe, expect, it } from "vitest";

describe("noteSchema", () => {
	it("accepts a valid note and applies the defaults", () => {
		// Arrange
		const input = { title: "Minha nota", content: "Conteúdo da nota" };

		// Act
		const result = noteSchema.parse(input);

		// Assert
		expect(result).toEqual({
			title: "Minha nota",
			content: "Conteúdo da nota",
			tags: [],
			color: "#ffffff",
			isPinned: false,
		});
	});

	it("rejects a title shorter than 2 characters", () => {
		// Arrange
		const input = { title: "a", content: "Conteúdo da nota" };

		// Act
		const result = noteSchema.safeParse(input);

		// Assert
		expect(result.success).toBe(false);
		expect(result.error?.issues[0].message).toBe("Mínimo 2 caracteres");
	});

	it("defaults content to an empty string when omitted", () => {
		// Arrange
		const input = { title: "Nota sem corpo" };

		// Act
		const result = noteSchema.parse(input);

		// Assert
		expect(result.content).toBe("");
	});

	it("accepts exactly 5 tags", () => {
		// Arrange
		const input = {
			title: "Minha nota",
			tags: ["a", "b", "c", "d", "e"],
		};

		// Act
		const result = noteSchema.safeParse(input);

		// Assert
		expect(result.success).toBe(true);
	});

	it("rejects more than 5 tags", () => {
		// Arrange
		const input = {
			title: "Minha nota",
			tags: ["a", "b", "c", "d", "e", "f"],
		};

		// Act
		const result = noteSchema.safeParse(input);

		// Assert
		expect(result.success).toBe(false);
		expect(result.error?.issues[0].message).toBe("Máximo de 5 tags");
	});
});
