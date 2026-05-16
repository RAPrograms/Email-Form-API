import { describe, expect, it } from "vitest";
import { FieldValidator } from "../src/fieldValidators";

describe("Type checks", () => {
	it("String", async () => {
		const validator = new FieldValidator({"type": "string"})
		const [isValid, error] = validator.validate("abc")

		expect(isValid)
        expect(error).toBe(undefined)
	});

	it("Valid number", async () => {
		const validator = new FieldValidator({"type": "number"})
		const [isValid, error] = validator.validate("1")

		expect(isValid)
        expect(error).toBe(undefined)
	});

	it("Invalid number", async () => {
		const validator = new FieldValidator({"type": "number"})
		const [isValid, error] = validator.validate("abc3")

		expect(!isValid)
        expect(error).toBe(undefined)
	});

	it("Valid boolean", async () => {
		const validator = new FieldValidator({"type": "bool"})

		for(const string of ["true", "false"]){
			const [isValid, error] = validator.validate(string)

			expect(isValid)
			expect(error).toBe(undefined)
		}
	});

	it("Invalid boolean", async () => {
		const validator = new FieldValidator({"type": "bool"})

		for(const string of ["y", "n", "falks"]){
			const [isValid, error] = validator.validate(string)

			expect(!isValid)
			expect(error).toBe("Requires bool data type")
		}
	});
})

describe("Requirement checks", () => {
	const requiredValidator = new FieldValidator({"required": true})
	const nonRequiredValidator = new FieldValidator({"required": false})
	
	it("Empty value for required field", async () => {
		const [isValid, error] = requiredValidator.validate("")

		expect(!isValid)
        expect(error).toBe("Missing field")
	});

	it("Passed value for required field", async () => {
		const [isValid, error] = requiredValidator.validate("Hi There")

		expect(isValid)
        expect(error).toBe(undefined)
	});

	it("Empty value for non-required field", async () => {
		const [isValid, error] = nonRequiredValidator.validate("")

		expect(isValid)
        expect(error).toBe(undefined)
	});

	it("Passed value for non-required field", async () => {
		const [isValid, error] = nonRequiredValidator.validate("Hi There")

		expect(isValid)
        expect(error).toBe(undefined)
	});
})

/*describe("Pattern checks", () => {

})*/

describe("Pre-defined pattern checks", () => {
	const emailValidator = new FieldValidator({"patten": "email"})

	it("Valid email addresses", async () => {
		for(const email of [
			"john.doe@example.com",
			"support123@domain.co.uk",
			"alex_smith@company.org",
			"sales-department@enterprise.net",
			"info@subdomain.example.com",
			"a@domain.com",
			"customer.service.help@brand.global",
			"1234567890@numeric-domain.com",
			"xyz@a.b.c.d.e.f.g.h.i.j.edu"
		]){
			const [isValid, error] = emailValidator.validate(email)

			expect(isValid)
			expect(error, email).toBe(undefined)
		}
	});

	it("Extreme valid email addresses", async () => {
		for(const email of [
			"user+mailbox123@example.com",
			"much.more.unusual@example.com",
			"user.name+tag+sorting@example.com",
			"admin@123.123.123.123",
			"admin@[123.123.123.123]"
		]){
			const [isValid, error] = emailValidator.validate(email)

			expect(isValid)
			expect(error, email).toBe(undefined)
		}
	});

	it("Invalid email addresses", async () => {
		for(const email of [
			"johndoe.com",
			"john.doe@",
			"@example.com",
			"john.doe@com",
			"john"
		]){
			const [isValid, error] = emailValidator.validate(email)

			expect(!isValid)
			expect(error, email).toBe("Value does not match the pattern (email)")
		}
	});
})

describe("String length validation", () => {
    const validator = new FieldValidator({
        "type": "string",
        "maxlength": 10,
        "minlength": 2
    })

	it("throws an error for being too long", async () => {
		const [isValid, error] = validator.validate("12345678901")

		expect(!isValid)
        expect(error).toBe("This value is longer then 10 characters")
	});

	it("throws an error for being too short", async () => {
		const [isValid, error] = validator.validate("1")

		expect(!isValid)
        expect(error).toBe("This value is shorter then 2 characters")
	});

	it("valid in maximum boundary", async () => {
		const [isValid, error] = validator.validate("1234567890")

		expect(isValid)
        expect(error).toBe(undefined)
	});

	it("valid on minimum boundary", async () => {
		const [isValid, error] = validator.validate("123")

		expect(isValid)
        expect(error).toBe(undefined)
	});
});


describe("Number range check", () => {
	const validator = new FieldValidator({
        "type": "number",
        "maxvalue": 10,
        "minvalue": 1
    })

	it("throws an error for being too large", async () => {
		const [isValid, error] = validator.validate("11")

		expect(!isValid)
        expect(error).toBe("This value is bigger then 10")
	});

	it("throws an error for being too small", async () => {
		const [isValid, error] = validator.validate("0")

		expect(!isValid)
        expect(error).toBe("This value is smaller then 1")
	});

	it("valid in valid boundary", async () => {
		for(let i=1; i<=10; i++){
			const [isValid, error] = validator.validate(String(i))

			expect(isValid)
			expect(error).toBe(undefined)
		}
	});
})