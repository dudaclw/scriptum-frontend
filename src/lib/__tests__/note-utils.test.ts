import type { Note } from "@/domain/entities/note";
import {
	cleanMarkdownText,
	formatBrazilianDate,
	sortNotes,
} from "@/lib/note-utils";
import { describe, expect, it } from "vitest";

function makeNote(overrides: Partial<Note> = {}): Note {
	return {
		id: "note-1",
		title: "Título",
		content: "Conteúdo",
		color: "#ffffff",
		tags: [],
		isPinned: false,
		userId: "user-1",
		createdAt: new Date("2024-01-01T00:00:00.000Z"),
		modifiedAt: new Date("2024-01-01T00:00:00.000Z"),
		...overrides,
	};
}

describe("cleanMarkdownText", () => {
	it("removes markdown symbols from the text", () => {
		// Arrange
		const markdown = "# Título **negrito** com `código` e [link]";

		// Act
		const result = cleanMarkdownText(markdown);

		// Assert
		expect(result).toBe(" Título negrito com código e link");
	});

	it("truncates the result to 200 characters", () => {
		// Arrange
		const longText = "a".repeat(500);

		// Act
		const result = cleanMarkdownText(longText);

		// Assert
		expect(result).toHaveLength(200);
	});

	it("returns an empty string when the input is not a string", () => {
		// Arrange
		const invalidInput = undefined as unknown as string;

		// Act
		const result = cleanMarkdownText(invalidInput);

		// Assert
		expect(result).toBe("");
	});
});

describe("formatBrazilianDate", () => {
	it("formats a Date using the pt-BR short-month style", () => {
		// Arrange
		const date = new Date(2024, 0, 15);

		// Act
		const result = formatBrazilianDate(date);

		// Assert
		expect(result).toMatch(/^15 de \S+ de 2024$/);
	});

	it("parses an ISO date string as local time, keeping the calendar day", () => {
		// Arrange
		const isoDate = "2024-01-15";

		// Act
		const result = formatBrazilianDate(isoDate);

		// Assert
		expect(result).toMatch(/^15 de \S+ de 2024$/);
	});

	it("throws an explicit error when the input is not a valid date", () => {
		// Arrange
		const invalidDate = "not-a-date";

		// Act & Assert
		expect(() => formatBrazilianDate(invalidDate)).toThrow(
			/Formato de data inválido/,
		);
	});
});

describe("sortNotes", () => {
	it("places pinned notes before unpinned ones", () => {
		// Arrange
		const notes = [
			makeNote({ id: "unpinned", isPinned: false }),
			makeNote({ id: "pinned", isPinned: true }),
		];

		// Act
		const result = sortNotes(notes);

		// Assert
		expect(result.map((note) => note.id)).toEqual(["pinned", "unpinned"]);
	});

	it("orders notes with the same pin state by newest createdAt first", () => {
		// Arrange
		const notes = [
			makeNote({ id: "older", createdAt: new Date("2024-01-01T00:00:00Z") }),
			makeNote({ id: "newer", createdAt: new Date("2024-06-01T00:00:00Z") }),
		];

		// Act
		const result = sortNotes(notes);

		// Assert
		expect(result.map((note) => note.id)).toEqual(["newer", "older"]);
	});

	it("accepts createdAt values that arrive from the API as strings", () => {
		// Arrange
		const notes = [
			makeNote({
				id: "older",
				createdAt: "2024-01-01T00:00:00Z" as unknown as Date,
			}),
			makeNote({
				id: "newer",
				createdAt: "2024-06-01T00:00:00Z" as unknown as Date,
			}),
		];

		// Act
		const result = sortNotes(notes);

		// Assert
		expect(result.map((note) => note.id)).toEqual(["newer", "older"]);
	});

	it("does not mutate the array it receives", () => {
		// Arrange
		const notes = [
			makeNote({ id: "unpinned", isPinned: false }),
			makeNote({ id: "pinned", isPinned: true }),
		];

		// Act
		sortNotes(notes);

		// Assert
		expect(notes.map((note) => note.id)).toEqual(["unpinned", "pinned"]);
	});
});
