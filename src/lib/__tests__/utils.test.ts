import { cn, getContrastTextColor, getLuminance } from "@/lib/utils";
import { describe, expect, it } from "vitest";

describe("cn", () => {
	it("merges conflicting tailwind classes keeping the last one", () => {
		// Arrange
		const base = "px-2 py-1";
		const override = "px-4";

		// Act
		const result = cn(base, override);

		// Assert
		expect(result).toBe("py-1 px-4");
	});

	it("drops falsy values from the class list", () => {
		// Arrange
		const isActive = false;

		// Act
		const result = cn("text-sm", isActive && "font-bold", undefined, null);

		// Assert
		expect(result).toBe("text-sm");
	});
});

describe("getLuminance", () => {
	it("returns 1 for white", () => {
		expect(getLuminance("#ffffff")).toBe(1);
	});

	it("returns 0 for black", () => {
		expect(getLuminance("#000000")).toBe(0);
	});

	it("accepts a hex value without the leading hash", () => {
		expect(getLuminance("ffffff")).toBe(1);
	});
});

describe("getContrastTextColor", () => {
	it("asks for dark text on a light background", () => {
		expect(getContrastTextColor("#ffffff")).toBe("dark");
	});

	it("asks for light text on a dark background", () => {
		expect(getContrastTextColor("#000000")).toBe("light");
	});

	it("uses light text on a saturated blue background", () => {
		expect(getContrastTextColor("#1d4ed8")).toBe("light");
	});

	it("uses dark text on a pale yellow background", () => {
		expect(getContrastTextColor("#fef08a")).toBe("dark");
	});
});
