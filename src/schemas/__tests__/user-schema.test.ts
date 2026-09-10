import {
	loginSchema,
	userSchema,
	userSchemaWithPassword,
} from "@/schemas/user-schema";
import { describe, expect, it } from "vitest";

describe("userSchema", () => {
	it("accepts a valid name and e-mail", () => {
		// Arrange
		const input = { name: "Rafael", email: "rafael@example.com" };

		// Act
		const result = userSchema.safeParse(input);

		// Assert
		expect(result.success).toBe(true);
	});

	it("rejects a malformed e-mail", () => {
		// Arrange
		const input = { name: "Rafael", email: "rafael@" };

		// Act
		const result = userSchema.safeParse(input);

		// Assert
		expect(result.success).toBe(false);
		expect(result.error?.issues[0].message).toBe("Formato de e-mail inválido.");
	});

	it("treats avatarUrl as optional", () => {
		// Arrange
		const input = { name: "Rafael", email: "rafael@example.com" };

		// Act
		const result = userSchema.safeParse(input);

		// Assert
		expect(result.success).toBe(true);
	});

	it("accepts an avatarUrl that is not a well-formed URL", () => {
		// Arrange: a validação de URL foi removida de propósito.
		const input = {
			name: "Rafael",
			email: "rafael@example.com",
			avatarUrl: "avatar.png",
		};

		// Act
		const result = userSchema.safeParse(input);

		// Assert
		expect(result.success).toBe(true);
	});

	it("rejects a name shorter than 2 characters", () => {
		// Arrange
		const input = { name: "R", email: "rafael@example.com" };

		// Act
		const result = userSchema.safeParse(input);

		// Assert
		expect(result.success).toBe(false);
		expect(result.error?.issues[0].message).toBe(
			"Nome deve ter pelo menos 2 caracteres.",
		);
	});
});

describe("userSchemaWithPassword", () => {
	it("accepts a password with at least 8 characters mixing letters and digits", () => {
		// Arrange
		const input = {
			name: "Rafael",
			email: "rafael@example.com",
			password: "senha1234",
		};

		// Act
		const result = userSchemaWithPassword.safeParse(input);

		// Assert
		expect(result.success).toBe(true);
	});

	it("rejects a password without digits", () => {
		// Arrange
		const input = {
			name: "Rafael",
			email: "rafael@example.com",
			password: "somenteletras",
		};

		// Act
		const result = userSchemaWithPassword.safeParse(input);

		// Assert
		expect(result.success).toBe(false);
		expect(result.error?.issues[0].message).toBe(
			"Senha deve conter letras e números.",
		);
	});

	it("rejects a password shorter than 8 characters", () => {
		// Arrange
		const input = {
			name: "Rafael",
			email: "rafael@example.com",
			password: "abc123",
		};

		// Act
		const result = userSchemaWithPassword.safeParse(input);

		// Assert
		expect(result.success).toBe(false);
		expect(result.error?.issues[0].message).toBe(
			"Senha deve ter pelo menos 8 caracteres.",
		);
	});
});

describe("loginSchema", () => {
	it("accepts valid credentials", () => {
		// Arrange
		const input = { email: "rafael@example.com", password: "senha1234" };

		// Act
		const result = loginSchema.safeParse(input);

		// Assert
		expect(result.success).toBe(true);
	});

	it("does not require the name field", () => {
		// Arrange
		const input = { email: "rafael@example.com", password: "senha1234" };

		// Act
		const result = loginSchema.parse(input);

		// Assert
		expect(result).not.toHaveProperty("name");
	});
});
