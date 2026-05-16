import { parse as parseToml } from "smol-toml";
import { env } from "cloudflare:workers";
import { Resend } from 'resend';

import config from "../validation.toml";
import load from "./fieldValidators";

const resend = new Resend(env.RESENT_API_SECRET);
const validators = load(parseToml(config))

export default {
	async fetch(request, env, ctx): Promise<Response> {
		if(request.method.toLowerCase() != "post")
			return new Response("This is a post endpoint", {status: 400})

		const formdata = await request.formData()
		const errors: Record<string, string> = {}

		const requestData: Record<string, string> = {}

		// Go though all feilds to check for errors
		for(const [name, validator] of Object.entries(validators)){
			const value = (formdata.get(name) || "") as string
			
			const [valid, error] = validator.validate(value)
			if(!valid){
				errors[name] = error!
				continue
			}

			requestData[name] = value
		}

		// Returns all errors if any were detected
		if(Object.keys(errors).length > 0)
			return Response.json({
				message: "Invalid form data",
				details: errors
			}, {status: 422})


		// Send email
		const { error } = await resend.emails.send({
			replyTo: requestData["email"],
			from: `Inquiries <${env.SERVICE_EMAIL}>`,

			to: [env.RECEIVING_EMAIL],
			subject: `Inquiry: ${requestData["subject"]}`,
			html: '<strong>It works!</strong>',
		});

		if (error) {
			console.error("Email sending error:", error)
			return Response.json({
				message: "Unable to send email"
			}, {status: 500})
		}
		
		return new Response("Submitted");
	},
} satisfies ExportedHandler<Env>;
