import { parse as parseToml } from "smol-toml";

import config from "../validation.toml";
import load from "./fieldValidators";

const validators = load(parseToml(config))

export default {
	async fetch(request, env, ctx): Promise<Response> {

		console.log(validators)

		return new Response("Hello World!");
	},
} satisfies ExportedHandler<Env>;
