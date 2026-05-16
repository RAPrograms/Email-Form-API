import { describe, expect, it } from "vitest";
import { FieldValidator } from "../src/fieldValidators";

describe("String length validation", () => {
    const validator = new FieldValidator({
        "type": "string",
        "maxlength": 10,
        "minlength": 2
    })

	it("throws an error for being too long", async () => {
		const [result, error] = validator.validate("12345678901")

		expect(!result)
        expect(error).toBe("This value is longer then 10 characters")
	});

	it("throws an error for being too short", async () => {
		const [result, error] = validator.validate("1")

		expect(!result)
        expect(error).toBe("This value is shorter then 2 characters")
	});

	it("valid on maximum boundary", async () => {
		const [result, error] = validator.validate("1234567890")

		expect(result)
        expect(error).toBe(undefined)
	});

	it("valid on minimum boundary", async () => {
		const [result, error] = validator.validate("123")

		expect(result)
        expect(error).toBe(undefined)
	});
});