import { parse as parseToml } from "smol-toml";
import { env } from "cloudflare:workers";
import { Liquid } from 'liquidjs';
import { Resend } from 'resend';

import load from "./fieldValidators";

import allowed_origins from "../allowed_origins.json";
import config from "../schema.toml";

async function validateTurnstileToken(
	token: string,
	secret: string,
	userIP: string | undefined = undefined
): Promise<{success: boolean, "error-codes": any[]}>{
	try {
		const response = await fetch(
		"https://challenges.cloudflare.com/turnstile/v0/siteverify",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					secret: secret,
					response: token,
					remoteip: userIP,
				}),
			},
		);
	
		return await response.json();
	} catch (error) {
		console.error("Turnstile validation error:", error);
		return { success: false, "error-codes": ["internal-error"] };
	}
}

async function processSubmission(request, env, resHeaders: Record<string, any>): Promise<Response>{
	// Gets all data from request
	const formdata = await request.formData()


	// Check for Cloudflare Turnstile token
	const turnstileToken: string = formdata.get("cf-turnstile-response") as string
	if(turnstileToken == undefined)
		return Response.json({
			success: false,
			message: "Missing Cloudflare Turnstile token",
			details: undefined
		}, {
			status: 422,
			headers: resHeaders
		})

	// Started now to allow it to run async
	const validTurnstileRequest = validateTurnstileToken(
		turnstileToken,
		env.CF_TURNSTILE_SECRET,
		request.headers.get('CF-Connecting-IP')!
	)

	// Define form validators
	const validators = load(parseToml(config))


	// Outputs after validation
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

	// Setup resend 
	const resend = new Resend(env.RESENT_API_SECRET);

	// Fetch email template preemptively
	const templateRequest = await env.TEMPLATES.fetch("http://templates/email.html")

	// Returns all errors if any were detected
	if(Object.keys(errors).length > 0)
		return Response.json({
			success: false,
			message: "Invalid form data",
			details: errors
		}, {
			status: 422,
			headers: resHeaders
		})


	const { success: isValidTurnstile, "error-codes": turnstileError } = await validTurnstileRequest
	// Check turnstile (now that it should have finished)
	if(isValidTurnstile == false)
		return Response.json({
			success: false,
			message: "Invalid Cloudflare Turnstile token",
			details: turnstileError
		}, {
			status: 422,
			headers: resHeaders
		})

	
	// Get template content
	const templateRaw = await templateRequest.text()

	// Setup template engine
	const engine = new Liquid();

	// Render email template
	const htmlResult = await engine.parseAndRender(templateRaw, {data: requestData});

	// Send email
	const { error } = await resend.emails.send({
		replyTo: requestData["email"],
		from: `Inquiries <${env.SERVICE_EMAIL}>`,

		to: [env.RECEIVING_EMAIL],
		subject: `Inquiry: ${requestData["subject"]}`,
		html: htmlResult,
	});

	if (error) {
		console.error("Email sending error:", error)
		return Response.json({
			success: false,
			message: "Unable to send email",
			details: undefined
		}, {
			status: 500,
			headers: resHeaders
		})
	}
	
	// @ts-ignore
	return new Response.json({
		success: true
	}, {
		status: 200,
		headers: resHeaders
	});
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		// Checks for CORS
		const validCORS = JSON.parse(allowed_origins as unknown as string).includes(request.headers.get("origin"))
		
		const resHeaders: Record<string, any> = {}
		if(validCORS)
			resHeaders["Access-Control-Allow-Origin"] = request.headers.get("origin")


		switch(request.method.toLowerCase()){
			case "post":
				return processSubmission(request, env, resHeaders)

			case "options":
				if(!validCORS)
					return new Response(null, { status: 204 });

				return new Response(null, {
					status: 204,
					headers: {
						"Access-Control-Allow-Origin": origin,
						"Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, DELETE, OPTIONS",
						"Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers") || "*",
						"Access-Control-Max-Age": "86400", // Cache preflight response for 24 hours
					},
				})

			default:
				return Response.json({
					success: false,
					message: "This is a post endpoint",
					details: {
						"provided-method": request.method
					}
				}, {
					status: 400,
					headers: resHeaders
				})
		}
	},
} satisfies ExportedHandler<Env>;
