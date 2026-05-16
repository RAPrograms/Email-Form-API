import { parse as parseToml } from "smol-toml";

import config from "../validation.toml";
import load from "./fieldValidators";

const validators = load(parseToml(config))

export default {
	async fetch(request, env, ctx): Promise<Response> {
		if(request.method.toLowerCase() != "post")
			return new Response("This is a post endpoint", {status: 400})

		const data = await request.formData()
		const errors: Record<string, string> = {}

		const output: Record<string, string> = {}

		// Go though all feilds to check for errors
		for(const [name, validator] of Object.entries(validators)){
			const value = (data.get(name) || "") as string
			
			const [valid, error] = validator.validate(value)
			if(!valid){
				errors[name] = error!
				continue
			}

			output[name] = value
		}

		// Returns all errors if any were detected
		if(Object.keys(errors).length > 0)
			return Response.json({
				message: "Invalid form data",
				details: errors
			}, {status: 422})

			
		return new Response("Hello World!");
	},
} satisfies ExportedHandler<Env>;
