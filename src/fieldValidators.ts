interface Constraints {
    type?: "string" | "number" | "bool" 
    required?: boolean
    patten?: string

    // String validations
    maxlength?: number
    minlength?: number

    // Number validations
    maxvalue?: number
    minvalue?: number
}

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
                    return Boolean(value)
            }
        } catch (error) {}
    }

    #validatePattern(value: string): boolean {
        const pattern = this.#constraints["patten"]
        if(pattern == undefined)
            return true

        const regex = new RegExp(pattern)
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
        if(maxvalue && value < maxvalue)
            return [false, `This value is bigger then ${maxvalue}`]

        const minvalue = this.#constraints["minvalue"]
        if(minvalue && value > minvalue)
            return [false, `This value is smaller then ${maxvalue}`]

        return [true, undefined]
    }

    validate(value: string): [boolean, string?]{
        if(this.#constraints["required"] && value == "")
            return [false, "Missing field"]

        if(!this.#validatePattern(value))
            return [false, `Value does not match the pattern (${this.#constraints["patten"]})`]

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