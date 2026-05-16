interface Constraints {
    type?: "string" | "number" | "bool" 
    required?: boolean
    pattern?: string | "email"

    // String validations
    maxlength?: number
    minlength?: number

    // Number validations
    maxvalue?: number
    minvalue?: number
}

const patterns = Object.freeze({
    "email": /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
}) as Record<string, RegExp>

export class FieldValidator{
    #typeValidator: (value: any) => [boolean, string?] = (value: any) => [true, undefined]
    #constraints: Constraints

    constructor(constraints: Constraints){
        this.#constraints = constraints

        if(constraints["type"] == undefined)
            this.#constraints["type"] = "string"

        if(constraints["required"] == undefined)
            this.#constraints["required"] = true

        switch(this.#constraints["type"]){
            case "string":
                this.#typeValidator = this.#validateString
                break

            case "number":
                this.#typeValidator = this.#validateNumber
                break
        }
    }

    #castType(value: string): string | Number | boolean | undefined {
        try {
            switch(this.#constraints["type"]){
                case "string":
                    return value

                case "number":
                    return Number(value)

                case "bool":
                    value = value.toLowerCase()

                    if(!["true", "false"].includes(value))
                        throw new Error("Invalid boolean")

                    return value == "true"
            }
        } catch (error) {}
    }

    #validatePattern(value: string): boolean {
        const pattern = this.#constraints["pattern"]
        if(pattern == undefined)
            return true

        // Gets pre-defined regexes if found, else loads the provided regex
        const regex = (patterns[pattern] != undefined)?
            patterns[pattern] : new RegExp(pattern)
        
        return regex.test(value)
    }

    #validateString(value: string): [boolean, string?]{
        const maxlength = this.#constraints["maxlength"]
        if(maxlength && value.length > maxlength)
            return [false, `This value is longer then ${maxlength} characters`]

        const minlength = this.#constraints["minlength"]
        if(minlength && value.length < minlength)
            return [false, `This value is shorter then ${minlength} characters`]

        return [true, undefined]
    }

    #validateNumber(value: number): [boolean, string?]{
        const maxvalue = this.#constraints["maxvalue"]
        if(maxvalue && value > maxvalue)
            return [false, `This value is bigger then ${maxvalue}`]

        const minvalue = this.#constraints["minvalue"]
        if(minvalue && value < minvalue)
            return [false, `This value is smaller then ${minvalue}`]

        return [true, undefined]
    }

    validate(value: string): [boolean, string?]{
        if(this.#constraints["required"] && value == "")
            return [false, "Missing field"]

        if(!this.#validatePattern(value))
            return [false, `Value does not match the pattern (${this.#constraints["pattern"]})`]

        const data = this.#castType(value)
        if(data == undefined)
            return [false, `Requires ${this.#constraints["type"]} data type`]

        const typeValidationResults = this.#typeValidator(data)
        if(!typeValidationResults[0])
            return typeValidationResults

        return [true, undefined]
    }
}

export default function load(config: Record<string, any>): Record<string, FieldValidator> {
    const output: Record<string, FieldValidator> = {}

    for(const [name, constraints] of Object.entries(config)){
        output[name] = new FieldValidator(constraints)
    }

    return output
}